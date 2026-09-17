// src/lib/actions/feedback.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitFeedback(input: {
  assessmentId: string;
  rating: number; // 1–5
  comment?: string;
  inaccurateDetails?: string;
}): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (input.rating < 1 || input.rating > 5) {
    return { error: "Rating must be 1–5" };
  }

  const { error } = await supabase.from("feedbacks").insert({
    user_id: user.id,
    assessment_id: input.assessmentId,
    rating: input.rating,
    comment: input.comment?.trim() || null,
    inaccurate_details: input.rating <= 2 ? input.inaccurateDetails?.trim() || null : null,
  });

  if (error) return { error: error.message };
  return { success: true };
}