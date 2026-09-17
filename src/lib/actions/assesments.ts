"use server";

import { createClient } from "@/lib/supabase/server";
import { runCareerClassification } from "@/lib/classification/engine";
import {
  CareerProfile,
  CompetencyLevel,
  UserProfile,
} from "@/lib/classification/types";
import {
  CLASSIFICATION_THRESHOLDS,
  getClassificationLevel,
  type Thresholds,
} from "@/lib/classification/rules";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function loadThresholds(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Thresholds> {
  const { data } = await supabase
    .from("classification_rules")
    .select("name, value");

  const map = new Map((data || []).map((r) => [r.name, Number(r.value)]));

  return {
    CAREER_READY:
      map.get("career_ready_threshold") ?? CLASSIFICATION_THRESHOLDS.CAREER_READY,
    READY_WITH_GAPS:
      map.get("ready_with_gaps_threshold") ??
      CLASSIFICATION_THRESHOLDS.READY_WITH_GAPS,
    DEVELOPING:
      map.get("developing_threshold") ?? CLASSIFICATION_THRESHOLDS.DEVELOPING,
  };
}

export async function runAssessment(careerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const [
    { data: career, error: careerError },
    { data: requirements },
    { data: userCompetencies },
    { data: academic },
    { data: experiences },
    { data: interests },
    thresholds,
  ] = await Promise.all([
    supabase.from("careers").select("*").eq("id", careerId).single(),
    supabase
      .from("career_competencies")
      .select("competency_id, required_level, weight, is_core, competencies(id, name)")
      .eq("career_id", careerId),
    supabase
      .from("user_competencies")
      .select("competency_id, level, evidence")
      .eq("user_id", user.id),
    supabase.from("academic_records").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("experiences").select("*").eq("user_id", user.id),
    supabase.from("user_interests").select("*").eq("user_id", user.id),
    loadThresholds(supabase),
  ]);

  if (careerError || !career) {
    throw new Error("Career not found");
  }

  if (!requirements || requirements.length === 0) {
    throw new Error("Career has no competency requirements");
  }

  const competencyNames: Record<string, string> = {};
  const competencyRequirements = requirements.map((r) => {
    const comp = Array.isArray(r.competencies) ? r.competencies[0] : r.competencies;
    const name = (comp as { name?: string } | null)?.name || r.competency_id;
    competencyNames[r.competency_id] = name;

    return {
      competencyId: r.competency_id,
      requiredLevel: Math.min(5, Math.max(1, r.required_level)) as CompetencyLevel,
      weight: Number(r.weight) || 0,
      isCore: Boolean(r.is_core),
    };
  });

  const careerProfile: CareerProfile = {
    id: career.id,
    name: career.name,
    slug: career.slug,
    description: career.description || "",
    competencyRequirements,
    recommendedLearningAreas: [],
  };

  const userProfile: UserProfile = {
    id: user.id,
    academic: {
      mathematics: academic?.mathematics ?? 0,
      english: academic?.english ?? 0,
      science: academic?.science ?? 0,
      indonesian: academic?.indonesian ?? 0,
      socialStudies: academic?.social_studies ?? undefined,
      vocational: academic?.vocational ?? undefined,
    },
    skills: (userCompetencies || []).map((s) => ({
      competencyId: s.competency_id,
      level: Math.min(5, Math.max(1, s.level)) as CompetencyLevel,
      evidence: s.evidence || undefined,
    })),
    interests: (interests || []).map((i) => i.interest || i.name || "").filter(Boolean),
    experiences: (experiences || []).map((e) => ({
      type: e.type,
      title: e.title,
      description: e.description || undefined,
    })),
  };

  const result = runCareerClassification(userProfile, careerProfile, competencyNames);
  result.classification = getClassificationLevel(result.readinessScore, thresholds);

  // ============================================================
  // FIX: tabel asli = assessment_results (lihat screenshot Supabase)
  // Kolom: id, user_id, career_id, readiness_score, classification,
  //        confidence, profile_completeness, explanation (jsonb), created_at
  // Tidak ada kolom action_plan → gaps & actionPlan disimpan
  // di dalam explanation jsonb (snake_case, cocok dengan GapTable).
  // ============================================================
  const { data: assessment, error: insertError } = await supabase
    .from("assessment_results")
    .insert({
      user_id: user.id,
      career_id: careerId,
      readiness_score: result.readinessScore,
      classification: result.classification,
      confidence: result.confidence,
      profile_completeness: result.profileCompleteness,
      explanation: {
        summary: result.explanation.summary,
        strongestAreas: result.explanation.strongestAreas,
        mainGaps: result.explanation.mainGaps,
        contributingFactors: result.explanation.contributingFactors,
        gaps: result.gaps.map((g) => ({
          competency_name: g.competencyName,
          current_level: g.currentLevel,
          required_level: g.requiredLevel,
          weight: g.weight,
          status: g.status,
          gap_size: g.gapSize,
        })),
        actionPlan: result.actionPlan,
      },
    })
    .select("id")
    .single();

  if (insertError || !assessment) {
    throw new Error(insertError?.message || "Failed to save assessment");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/assessment");
  revalidatePath("/dashboard/progress");
  redirect(`/dashboard/assessment/${assessment.id}`);
}