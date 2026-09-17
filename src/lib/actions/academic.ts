"use server";

import { createClient } from "@/lib/supabase/server";
import { runAcademicClassification } from "@/lib/classification/academic-engine";
import { CompetencyLevel, UserProfile } from "@/lib/classification/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function runAcademicAssessment() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [
    { data: academic },
    { data: userCompetencies },
    { data: experiences },
    { data: interests },
    { data: paths },
    { data: allCompetencies },
  ] = await Promise.all([
    supabase.from("academic_records").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("user_competencies")
      .select("competency_id, level, evidence")
      .eq("user_id", user.id),
    supabase.from("experiences").select("*").eq("user_id", user.id),
    supabase.from("user_interests").select("*").eq("user_id", user.id),
    supabase.from("education_paths").select("*").eq("is_active", true),
    supabase.from("competencies").select("id, name"),
  ]);

  const competencyNames: Record<string, string> = {};
  (allCompetencies || []).forEach((c) => {
    competencyNames[c.id] = c.name;
  });

  const userProfile: UserProfile = {
    id: user.id,
    academic: {
      mathematics: Number(academic?.mathematics ?? 0),
      english: Number(academic?.english ?? 0),
      science: Number(academic?.science ?? 0),
      indonesian: Number(academic?.indonesian ?? 0),
      socialStudies:
        academic?.social_studies != null ? Number(academic.social_studies) : undefined,
      vocational: academic?.vocational != null ? Number(academic.vocational) : undefined,
    },
    skills: (userCompetencies || []).map((s) => ({
      competencyId: s.competency_id,
      level: Math.min(5, Math.max(1, Number(s.level))) as CompetencyLevel,
      evidence: s.evidence || undefined,
    })),
    interests: (interests || [])
      .map((i: { interest?: string }) => i.interest || "")
      .filter(Boolean),
    experiences: (experiences || []).map((e) => ({
      type: (["project", "organization", "internship", "certification", "competition"].includes(
        e.type
      )
        ? e.type
        : "project") as UserProfile["experiences"][number]["type"],
      title: e.title,
      description: e.description || undefined,
    })),
  };

  const result = runAcademicClassification(
    userProfile,
    paths || [],
    competencyNames
  );

  const { data: row, error } = await supabase
    .from("academic_classifications")
    .insert({
      user_id: user.id,
      profile_type: result.profileType,
      confidence: result.confidence,
      profile_completeness: result.profileCompleteness,
      scores: result.scores,
      explanation: result.explanation,
      recommendations: result.recommendations,
    })
    .select("id")
    .single();

  if (error || !row) {
    throw new Error(error?.message || "Failed to save academic classification");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/academic");
  redirect(`/dashboard/academic/${row.id}`);
}