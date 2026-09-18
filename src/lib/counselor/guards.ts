// src/lib/counselor/guards.ts
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CounselorCtx = {
  user: User;
  supabase: SupabaseClient;
  role: string;
};

export async function requireCounselor(): Promise<
  { error: string; ctx: null } | { error: null; ctx: CounselorCtx }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized — silakan login ulang", ctx: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "student";
  if (!["counselor", "mentor", "admin"].includes(role)) {
    return { error: "Forbidden — khusus counselor/mentor", ctx: null };
  }

  return { error: null, ctx: { user, supabase, role } };
}

/** Cek: apakah counselor ini punya share aktif yang diarahkan ke dia untuk assessment ini? */
export async function counselorHasAccess(
  supabase: SupabaseClient,
  assessmentId: string,
  counselorId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("shared_assessments")
    .select("id, expires_at")
    .eq("assessment_id", assessmentId)
    .eq("counselor_id", counselorId)
    .is("revoked_at", null);

  const now = new Date();
  return (data ?? []).some(
    (r) => !r.expires_at || new Date(r.expires_at) > now
  );
}

/** Cek: student ini pernah share (aktif) ke counselor ini? */
export async function counselorHasStudentAccess(
  supabase: SupabaseClient,
  studentId: string,
  counselorId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("shared_assessments")
    .select("id, expires_at")
    .eq("user_id", studentId)
    .eq("counselor_id", counselorId)
    .is("revoked_at", null);

  const now = new Date();
  return (data ?? []).some(
    (r) => !r.expires_at || new Date(r.expires_at) > now
  );
}