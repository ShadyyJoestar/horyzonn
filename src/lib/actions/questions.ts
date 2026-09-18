"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCounselor } from "@/lib/counselor/guards";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: string;
};

/** Student: kirim pertanyaan ke pool counselor (tanpa pilih counselor). */
export async function submitCounselorQuestion(input: {
  question: string;
  subject?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const question = input.question?.trim();
  if (!question) return { error: "Pertanyaan tidak boleh kosong" };
  if (question.length > 4000) return { error: "Pertanyaan maksimal 4000 karakter" };

  const subject = input.subject?.trim() || null;
  if (subject && subject.length > 200) {
    return { error: "Subject maksimal 200 karakter" };
  }

  const { data, error } = await supabase
    .from("counselor_questions")
    .insert({
      student_id: user.id,
      question,
      subject,
      status: "open",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ask-counselor");
  revalidatePath("/dashboard");
  revalidatePath("/counselor/questions");

  return { success: true, id: data?.id };
}

/** Counselor: balas pertanyaan + tandai answered. */
export async function replyToCounselorQuestion(input: {
  questionId: string;
  reply: string;
}): Promise<ActionResult> {
  const { error: guardError, ctx } = await requireCounselor();
  if (guardError || !ctx) return { error: guardError ?? "Unauthorized" };

  const reply = input.reply?.trim();
  if (!reply) return { error: "Balasan tidak boleh kosong" };
  if (reply.length > 5000) return { error: "Balasan maksimal 5000 karakter" };

  const { data: question, error: qError } = await ctx.supabase
    .from("counselor_questions")
    .select("id, status")
    .eq("id", input.questionId)
    .maybeSingle();

  if (qError) return { error: qError.message };
  if (!question) return { error: "Pertanyaan tidak ditemukan" };

  const { error: insertError } = await ctx.supabase
    .from("counselor_replies")
    .insert({
      question_id: input.questionId,
      counselor_id: ctx.user.id,
      reply,
    });

  if (insertError) return { error: insertError.message };

  if (question.status === "open") {
    await ctx.supabase
      .from("counselor_questions")
      .update({
        status: "answered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.questionId);
  }

  revalidatePath("/counselor/questions");
  revalidatePath(`/counselor/questions/${input.questionId}`);
  revalidatePath("/dashboard/ask-counselor");
  revalidatePath("/dashboard");

  return { success: true };
}

/** Counselor: tutup pertanyaan. */
export async function closeCounselorQuestion(
  questionId: string
): Promise<ActionResult> {
  const { error: guardError, ctx } = await requireCounselor();
  if (guardError || !ctx) return { error: guardError ?? "Unauthorized" };

  const { error } = await ctx.supabase
    .from("counselor_questions")
    .update({
      status: "closed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", questionId);

  if (error) return { error: error.message };

  revalidatePath("/counselor/questions");
  revalidatePath(`/counselor/questions/${questionId}`);
  revalidatePath("/dashboard/ask-counselor");

  return { success: true };
}