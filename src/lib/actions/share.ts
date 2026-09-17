// src/lib/actions/share.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export async function createShareLink(
  assessmentId: string
): Promise<{ token?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Pastikan assessment ini milik user
  const { data: assessment } = await supabase
    .from("assessment_results")
    .select("id")
    .eq("id", assessmentId)
    .eq("user_id", user.id)
    .single();

  if (!assessment) return { error: "Assessment not found" };

  // Reuse link aktif kalau masih ada
  const { data: existing } = await supabase
    .from("shared_assessments")
    .select("token")
    .eq("assessment_id", assessmentId)
    .is("revoked_at", null)
    .maybeSingle();

  if (existing?.token) return { token: existing.token };

  const token = randomBytes(16).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 hari

  const { error } = await supabase.from("shared_assessments").insert({
    user_id: user.id,
    assessment_id: assessmentId,
    token,
    expires_at: expires.toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/assessment/${assessmentId}`);
  return { token };
}

export async function revokeShareLink(
  assessmentId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("shared_assessments")
    .update({ revoked_at: new Date().toISOString() })
    .eq("assessment_id", assessmentId)
    .eq("user_id", user.id)
    .is("revoked_at", null);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/assessment/${assessmentId}`);
  return {};
}