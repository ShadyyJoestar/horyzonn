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

export async function runAssessment(
  careerId: string
): Promise<{ error: string } | void> {
  try {
    if (!careerId) return { error: "Missing careerId" };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized — please log in again" };

    const [
      { data: career, error: careerError },
      { data: requirements, error: reqError },
      { data: userCompetencies },
      { data: academic },
      { data: experiences },
      { data: interests },
      thresholds,
    ] = await Promise.all([
      supabase.from("careers").select("*").eq("id", careerId).single(),
      supabase
        .from("career_competencies")
        .select(
          "competency_id, required_level, weight, is_core, competencies(id, name)"
        )
        .eq("career_id", careerId),
      supabase
        .from("user_competencies")
        .select("competency_id, level, evidence")
        .eq("user_id", user.id),
      supabase
        .from("academic_records")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("experiences").select("*").eq("user_id", user.id),
      supabase.from("user_interests").select("*").eq("user_id", user.id),
      loadThresholds(supabase),
    ]);

    if (careerError || !career) {
      return {
        error: `Career not found: ${careerError?.message || careerId}`,
      };
    }
    if (reqError) {
      return { error: `Failed to load requirements: ${reqError.message}` };
    }
    if (!requirements || requirements.length === 0) {
      return { error: "This career has no competency requirements in DB" };
    }

    const competencyNames: Record<string, string> = {};
    const competencyRequirements = requirements.map((r) => {
      const comp = Array.isArray(r.competencies)
        ? r.competencies[0]
        : r.competencies;
      const name =
        (comp as { name?: string } | null)?.name || r.competency_id;
      competencyNames[r.competency_id] = name;

      return {
        competencyId: r.competency_id,
        requiredLevel: Math.min(
          5,
          Math.max(1, Number(r.required_level) || 1)
        ) as CompetencyLevel,
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

    const allowedExp = new Set([
      "project",
      "organization",
      "internship",
      "certification",
      "competition",
    ]);

    const userProfile: UserProfile = {
      id: user.id,
      academic: {
        mathematics: Number(academic?.mathematics ?? 0),
        english: Number(academic?.english ?? 0),
        science: Number(academic?.science ?? 0),
        indonesian: Number(academic?.indonesian ?? 0),
        socialStudies:
          academic?.social_studies != null
            ? Number(academic.social_studies)
            : undefined,
        vocational:
          academic?.vocational != null
            ? Number(academic.vocational)
            : undefined,
      },
      skills: (userCompetencies || []).map((s) => ({
        competencyId: s.competency_id,
        level: Math.min(5, Math.max(1, Number(s.level) || 1)) as CompetencyLevel,
        evidence: s.evidence || undefined,
      })),
      interests: (interests || [])
        .map((i: { interest?: string; name?: string }) => i.interest || i.name || "")
        .filter(Boolean),
      experiences: (experiences || []).map((e) => ({
        type: (allowedExp.has(e.type) ? e.type : "project") as UserProfile["experiences"][number]["type"],
        title: e.title || "Untitled",
        description: e.description || undefined,
      })),
    };

    const result = runCareerClassification(
      userProfile,
      careerProfile,
      competencyNames
    );
    result.classification = getClassificationLevel(
      result.readinessScore,
      thresholds
    );

    // Simpan ke assessment_results (sesuai schema lo)
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
      return {
        error: `Failed to save assessment: ${insertError?.message || "unknown"}`,
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assessment");
    revalidatePath("/dashboard/progress");
    redirect(`/dashboard/assessment/${assessment.id}`);
  } catch (e) {
    // Biarkan redirect Next.js lewat
    if (
      typeof e === "object" &&
      e !== null &&
      "digest" in e &&
      String((e as { digest?: string }).digest || "").includes("NEXT_REDIRECT")
    ) {
      throw e;
    }
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg };
  }
}