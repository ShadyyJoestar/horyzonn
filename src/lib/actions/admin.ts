"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { error?: string; success?: boolean };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized — silakan login ulang" as const, ctx: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Forbidden — admin only" as const, ctx: null };
  }

  return {
    error: null,
    ctx: {
      user,
      supabase,
      admin: createAdminClient(),
    },
  };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/careers");
  revalidatePath("/admin/competencies");
  revalidatePath("/admin/rules");
  revalidatePath("/admin/users");
  revalidatePath("/admin/analytics");
  revalidatePath("/dashboard/careers");
}

// ─── CAREERS ─────────────────────────────────────────────

export async function createCareer(formData: {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  const name = formData.name?.trim();
  if (!name) return { error: "Nama career wajib diisi" };

  const slug = (formData.slug?.trim() || slugify(name)).slice(0, 80);
  if (!slug) return { error: "Slug tidak valid" };

  const { error: insertError } = await ctx.admin.from("careers").insert({
    name,
    slug,
    description: formData.description?.trim() || null,
    is_active: formData.is_active ?? true,
  });

  if (insertError) return { error: insertError.message };

  revalidateAdmin();
  return { success: true };
}

export async function updateCareer(formData: {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  if (!formData.id) return { error: "Missing career id" };
  const name = formData.name?.trim();
  if (!name) return { error: "Nama career wajib diisi" };

  const slug = (formData.slug?.trim() || slugify(name)).slice(0, 80);

  const { error: updateError } = await ctx.admin
    .from("careers")
    .update({
      name,
      slug,
      description: formData.description?.trim() || null,
      is_active: formData.is_active ?? true,
    })
    .eq("id", formData.id);

  if (updateError) return { error: updateError.message };

  revalidateAdmin();
  return { success: true };
}

export async function toggleCareerActive(
  id: string,
  is_active: boolean
): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };
  if (!id) return { error: "Missing career id" };

  const { error: updateError } = await ctx.admin
    .from("careers")
    .update({ is_active })
    .eq("id", id);

  if (updateError) return { error: updateError.message };

  revalidateAdmin();
  return { success: true };
}

// ─── COMPETENCIES ────────────────────────────────────────

export async function createCompetency(formData: {
  name: string;
  slug?: string;
  category?: string;
  description?: string;
}): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  const name = formData.name?.trim();
  if (!name) return { error: "Nama competency wajib diisi" };

  const slug = (formData.slug?.trim() || slugify(name)).slice(0, 80);
  const category = formData.category?.trim() || "general";

  const { error: insertError } = await ctx.admin.from("competencies").insert({
    name,
    slug,
    category,
    description: formData.description?.trim() || null,
  });

  if (insertError) return { error: insertError.message };

  revalidateAdmin();
  return { success: true };
}

export async function updateCompetency(formData: {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  description?: string;
}): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  if (!formData.id) return { error: "Missing competency id" };
  const name = formData.name?.trim();
  if (!name) return { error: "Nama competency wajib diisi" };

  const slug = (formData.slug?.trim() || slugify(name)).slice(0, 80);

  const { error: updateError } = await ctx.admin
    .from("competencies")
    .update({
      name,
      slug,
      category: formData.category?.trim() || "general",
      description: formData.description?.trim() || null,
    })
    .eq("id", formData.id);

  if (updateError) return { error: updateError.message };

  revalidateAdmin();
  return { success: true };
}

// ─── CLASSIFICATION RULES ────────────────────────────────

export async function updateClassificationRule(formData: {
  id: string;
  value: number;
  description?: string;
}): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  if (!formData.id) return { error: "Missing rule id" };
  const value = Number(formData.value);
  if (Number.isNaN(value) || value < 0 || value > 100) {
    return { error: "Value harus angka 0–100" };
  }

  const payload: Record<string, unknown> = { value };
  if (formData.description !== undefined) {
    payload.description = formData.description?.trim() || null;
  }

  const { error: updateError } = await ctx.admin
    .from("classification_rules")
    .update(payload)
    .eq("id", formData.id);

  if (updateError) return { error: updateError.message };

  revalidateAdmin();
  return { success: true };
}

// ─── USERS / ROLES ───────────────────────────────────────

export async function updateUserRole(formData: {
  userId: string;
  role: "student" | "counselor" | "admin";
}): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  if (!formData.userId) return { error: "Missing user id" };
  if (!["student", "counselor", "admin"].includes(formData.role)) {
    return { error: "Role tidak valid" };
  }

  // Cegah admin menghapus role dirinya sendiri tanpa sengaja
  if (formData.userId === ctx.user.id && formData.role !== "admin") {
    return { error: "Tidak bisa menurunkan role akun admin yang sedang login" };
  }

  const { error: updateError } = await ctx.admin
    .from("profiles")
    .update({ role: formData.role })
    .eq("id", formData.userId);

  if (updateError) return { error: updateError.message };

  revalidateAdmin();
  return { success: true };
}
// ─── CAREER COMPETENCY REQUIREMENTS ──────────────────────

export async function addCareerCompetency(formData: {
  careerId: string;
  competencyId: string;
  requiredLevel: number;
  weight: number;
  isCore?: boolean;
}): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  if (!formData.careerId || !formData.competencyId) {
    return { error: "careerId dan competencyId wajib" };
  }

  const requiredLevel = Number(formData.requiredLevel);
  const weight = Number(formData.weight);

  if (!Number.isFinite(requiredLevel) || requiredLevel < 1 || requiredLevel > 5) {
    return { error: "required_level harus 1–5" };
  }
  if (!Number.isFinite(weight) || weight <= 0) {
    return { error: "weight harus angka > 0" };
  }

  const { error: insertError } = await ctx.admin.from("career_competencies").insert({
    career_id: formData.careerId,
    competency_id: formData.competencyId,
    required_level: requiredLevel,
    weight,
    is_core: formData.isCore ?? false,
  });

  if (insertError) {
    // unique violation = sudah ada
    if (insertError.code === "23505") {
      return { error: "Competency ini sudah terhubung ke career tersebut" };
    }
    return { error: insertError.message };
  }

  revalidateAdmin();
  revalidatePath(`/admin/careers/${formData.careerId}`);
  revalidatePath(`/dashboard/careers`);
  return { success: true };
}

export async function updateCareerCompetency(formData: {
  id: string;
  careerId: string;
  requiredLevel: number;
  weight: number;
  isCore?: boolean;
}): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  if (!formData.id) return { error: "Missing requirement id" };

  const requiredLevel = Number(formData.requiredLevel);
  const weight = Number(formData.weight);

  if (!Number.isFinite(requiredLevel) || requiredLevel < 1 || requiredLevel > 5) {
    return { error: "required_level harus 1–5" };
  }
  if (!Number.isFinite(weight) || weight <= 0) {
    return { error: "weight harus angka > 0" };
  }

  const { error: updateError } = await ctx.admin
    .from("career_competencies")
    .update({
      required_level: requiredLevel,
      weight,
      is_core: formData.isCore ?? false,
    })
    .eq("id", formData.id);

  if (updateError) return { error: updateError.message };

  revalidateAdmin();
  revalidatePath(`/admin/careers/${formData.careerId}`);
  revalidatePath(`/dashboard/careers`);
  return { success: true };
}

export async function removeCareerCompetency(formData: {
  id: string;
  careerId: string;
}): Promise<ActionResult> {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return { error: error ?? "Unauthorized" };

  if (!formData.id) return { error: "Missing requirement id" };

  const { error: deleteError } = await ctx.admin
    .from("career_competencies")
    .delete()
    .eq("id", formData.id);

  if (deleteError) return { error: deleteError.message };

  revalidateAdmin();
  revalidatePath(`/admin/careers/${formData.careerId}`);
  revalidatePath(`/dashboard/careers`);
  return { success: true };
}