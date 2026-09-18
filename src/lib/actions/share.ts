"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export async function createShareLink(
  assessmentId: string
): Promise<{
  token?: string;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  // Pastikan assessment milik user
  const { data: assessment } = await supabase
    .from("assessment_results")
    .select("id")
    .eq("id", assessmentId)
    .eq("user_id", user.id)
    .single();

  if (!assessment) {
    return {
      error: "Assessment not found",
    };
  }

  // Reuse active link jika masih ada
  const { data: existing } = await supabase
    .from("shared_assessments")
    .select("token")
    .eq("assessment_id", assessmentId)
    .is("revoked_at", null)
    .maybeSingle();

  if (existing?.token) {
    return {
      token: existing.token,
    };
  }

  const token = randomBytes(16).toString("hex");

  const expires = new Date(
    Date.now() +
      30 * 24 * 60 * 60 * 1000
  );

  const { error } = await supabase
    .from("shared_assessments")
    .insert({
      user_id: user.id,
      shared_by: user.id,
      assessment_id: assessmentId,
      token,
      expires_at: expires.toISOString(),
    });

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath(
    `/dashboard/assessment/${assessmentId}`
  );

  revalidatePath("/dashboard/share");

  return {
    token,
  };
}

export async function revokeShareById(
  shareId: string
): Promise<{
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  // Pastikan share memang milik user
  const { data: share, error: lookupError } =
    await supabase
      .from("shared_assessments")
      .select("id, assessment_id")
      .eq("id", shareId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (lookupError) {
    return {
      error: lookupError.message,
    };
  }

  if (!share) {
    return {
      error: "Share not found",
    };
  }

  const { error } = await supabase
    .from("shared_assessments")
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq("id", shareId)
    .eq("user_id", user.id)
    .is("revoked_at", null);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/dashboard/share");

  revalidatePath(
    `/dashboard/assessment/${share.assessment_id}`
  );

  return {};
}

export async function revokeShareLink(
  assessmentId: string
): Promise<{
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  const { error } = await supabase
    .from("shared_assessments")
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq("assessment_id", assessmentId)
    .eq("user_id", user.id)
    .is("revoked_at", null);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath(
    `/dashboard/assessment/${assessmentId}`
  );

  revalidatePath("/dashboard/share");

  return {};
}

export async function shareAssessmentWithCounselor(
  input: {
    assessmentId: string;
    counselorEmail: string;
    message?: string;
  }
): Promise<{
  token?: string;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  // Assessment harus milik user
  const { data: assessment } = await supabase
    .from("assessment_results")
    .select("id")
    .eq("id", input.assessmentId)
    .eq("user_id", user.id)
    .single();

  if (!assessment) {
    return {
      error: "Assessment not found",
    };
  }

  const email = input.counselorEmail
    ?.trim()
    .toLowerCase();

  if (!email) {
    return {
      error: "Email counselor wajib diisi",
    };
  }

  // HARUS admin client — student tidak boleh SELECT profiles counselor (RLS)
  const admin = createAdminClient();

  const { data: counselor } = await admin
    .from("profiles")
    .select("id, role, email")
    .ilike("email", email)
    .maybeSingle();

  if (!counselor) {
    return {
      error:
        "User dengan email itu tidak ditemukan",
    };
  }

  if (
    counselor.role !== "counselor" &&
    counselor.role !== "admin"
  ) {
    return {
      error:
        "User itu bukan counselor atau admin",
    };
  }

  if (counselor.id === user.id) {
    return {
      error:
        "Kamu tidak bisa share ke diri sendiri",
    };
  }

  // Reuse active share ke counselor yang sama
  const { data: existing } = await supabase
    .from("shared_assessments")
    .select("token")
    .eq(
      "assessment_id",
      input.assessmentId
    )
    .eq("counselor_id", counselor.id)
    .is("revoked_at", null)
    .maybeSingle();

  if (existing?.token) {
    return {
      token: existing.token,
    };
  }

  const token = randomBytes(16).toString("hex");

  const expires = new Date(
    Date.now() +
      30 * 24 * 60 * 60 * 1000
  );

  const { error } = await supabase
    .from("shared_assessments")
    .insert({
      user_id: user.id,
      shared_by: user.id,
      assessment_id: input.assessmentId,
      token,
      counselor_id: counselor.id,
      message:
        input.message?.trim() || null,
      expires_at:
        expires.toISOString(),
    });

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath(
    `/dashboard/assessment/${input.assessmentId}`
  );

  revalidatePath("/dashboard/share");

  revalidatePath("/counselor/shared");

  revalidatePath("/counselor/students");

  return {
    token,
  };
}