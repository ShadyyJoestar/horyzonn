// src/lib/actions/counselor.ts
"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireCounselor,
  counselorHasAccess,
} from "@/lib/counselor/guards";

type ActionResult = { error?: string; success?: boolean };

async function writeAuditLog(payload: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
}) {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("audit_logs").insert({
      actor_id: payload.actorId,
      action: payload.action,
      target_type: payload.targetType,
      target_id: payload.targetId ?? null,
      previous_value: payload.previousValue ?? null,
      new_value: payload.newValue ?? null,
    });
    if (error) console.error("audit_logs insert failed:", error.message);
  } catch (e) {
    console.error("audit log error:", e);
  }
}

/** Guard: counselor + punya akses ke assessment. Return ctx atau throw error string. */
async function guardAssessment(assessmentId: string) {
  const { error, ctx } = await requireCounselor();
  if (error || !ctx) return { error: error ?? "Unauthorized", ctx: null };
  const ok = await counselorHasAccess(ctx.supabase, assessmentId, ctx.user.id);
  if (!ok) return { error: "Kamu tidak punya akses ke assessment ini", ctx: null };
  return { error: null, ctx };
}

// ─── NOTES ─────────────────────────────────────────────

export async function addCounselorNote(input: {
  assessmentId: string;
  note: string;
}): Promise<ActionResult> {
  const { error, ctx } = await guardAssessment(input.assessmentId);
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  const note = input.note?.trim();
  if (!note) return { error: "Catatan tidak boleh kosong" };
  if (note.length > 5000) return { error: "Catatan maksimal 5000 karakter" };

  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", ctx.user.id)
    .maybeSingle();
  const authorName = profile?.full_name || profile?.email || "Counselor";

  const { data, error: insertError } = await ctx.supabase
    .from("counselor_notes")
    .insert({
      assessment_id: input.assessmentId,
      author_id: ctx.user.id,
      author_name: authorName,
      note,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };

  await writeAuditLog({
    actorId: ctx.user.id,
    action: "COUNSELOR_NOTE_CREATE",
    targetType: "assessment",
    targetId: input.assessmentId,
    newValue: { noteId: data?.id },
  });

  revalidatePath(`/counselor/assessments/${input.assessmentId}`);
  revalidatePath("/counselor");
  return { success: true };
}

export async function updateCounselorNote(input: {
  noteId: string;
  assessmentId: string;
  note: string;
}): Promise<ActionResult> {
  const { error, ctx } = await guardAssessment(input.assessmentId);
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  const note = input.note?.trim();
  if (!note) return { error: "Catatan tidak boleh kosong" };

  const { data: existing } = await ctx.supabase
    .from("counselor_notes")
    .select("note")
    .eq("id", input.noteId)
    .eq("author_id", ctx.user.id)
    .maybeSingle();
  if (!existing) return { error: "Catatan tidak ditemukan" };

  const { error: updateError } = await ctx.supabase
    .from("counselor_notes")
    .update({ note })
    .eq("id", input.noteId)
    .eq("author_id", ctx.user.id);

  if (updateError) return { error: updateError.message };

  await writeAuditLog({
    actorId: ctx.user.id,
    action: "COUNSELOR_NOTE_UPDATE",
    targetType: "counselor_note",
    targetId: input.noteId,
    previousValue: { note: existing.note },
  });

  revalidatePath(`/counselor/assessments/${input.assessmentId}`);
  return { success: true };
}

export async function deleteCounselorNote(input: {
  noteId: string;
  assessmentId: string;
}): Promise<ActionResult> {
  const { error, ctx } = await guardAssessment(input.assessmentId);
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  const { error: deleteError } = await ctx.supabase
    .from("counselor_notes")
    .delete()
    .eq("id", input.noteId)
    .eq("author_id", ctx.user.id);

  if (deleteError) return { error: deleteError.message };

  await writeAuditLog({
    actorId: ctx.user.id,
    action: "COUNSELOR_NOTE_DELETE",
    targetType: "counselor_note",
    targetId: input.noteId,
  });

  revalidatePath(`/counselor/assessments/${input.assessmentId}`);
  return { success: true };
}

// ─── DEVELOPMENT PLAN ──────────────────────────────────

export async function addDevelopmentItem(input: {
  assessmentId: string;
  competencyName: string;
  currentLevel: number;
  targetLevel: number;
  action: string;
  dueDate?: string | null;
}): Promise<ActionResult> {
  const { error, ctx } = await guardAssessment(input.assessmentId);
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  const name = input.competencyName?.trim();
  const action = input.action?.trim();
  if (!name) return { error: "Nama competency wajib diisi" };
  if (!action) return { error: "Action wajib diisi" };

  const cur = Math.min(5, Math.max(1, Number(input.currentLevel) || 1));
  const tgt = Math.min(5, Math.max(1, Number(input.targetLevel) || 1));

  const { data: maxRow } = await ctx.supabase
    .from("development_plan_items")
    .select("sort_order")
    .eq("assessment_id", input.assessmentId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.sort_order ?? 0) + 1;

  const { data, error: insertError } = await ctx.supabase
    .from("development_plan_items")
    .insert({
      assessment_id: input.assessmentId,
      competency_name: name,
      current_level: cur,
      target_level: tgt,
      action,
      due_date: input.dueDate || null,
      sort_order: nextOrder,
      created_by: ctx.user.id,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };

  await writeAuditLog({
    actorId: ctx.user.id,
    action: "DEV_PLAN_ITEM_CREATE",
    targetType: "assessment",
    targetId: input.assessmentId,
    newValue: { itemId: data?.id, competency: name },
  });

  revalidatePath(`/counselor/assessments/${input.assessmentId}`);
  return { success: true };
}

export async function updateDevelopmentItemStatus(input: {
  itemId: string;
  assessmentId: string;
  status: string;
}): Promise<ActionResult> {
  const { error, ctx } = await guardAssessment(input.assessmentId);
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  if (!["todo", "in_progress", "done"].includes(input.status)) {
    return { error: "Status tidak valid" };
  }

  const { data: existing } = await ctx.supabase
    .from("development_plan_items")
    .select("status")
    .eq("id", input.itemId)
    .maybeSingle();
  if (!existing) return { error: "Item tidak ditemukan" };

  const { error: updateError } = await ctx.supabase
    .from("development_plan_items")
    .update({ status: input.status })
    .eq("id", input.itemId);

  if (updateError) return { error: updateError.message };

  await writeAuditLog({
    actorId: ctx.user.id,
    action: "DEV_PLAN_ITEM_STATUS",
    targetType: "development_plan_item",
    targetId: input.itemId,
    previousValue: { status: existing.status },
    newValue: { status: input.status },
  });

  revalidatePath(`/counselor/assessments/${input.assessmentId}`);
  return { success: true };
}

export async function deleteDevelopmentItem(input: {
  itemId: string;
  assessmentId: string;
}): Promise<ActionResult> {
  const { error, ctx } = await guardAssessment(input.assessmentId);
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  const { error: deleteError } = await ctx.supabase
    .from("development_plan_items")
    .delete()
    .eq("id", input.itemId);

  if (deleteError) return { error: deleteError.message };

  await writeAuditLog({
    actorId: ctx.user.id,
    action: "DEV_PLAN_ITEM_DELETE",
    targetType: "development_plan_item",
    targetId: input.itemId,
  });

  revalidatePath(`/counselor/assessments/${input.assessmentId}`);
  return { success: true };
}