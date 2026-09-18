import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  UserProfile,
  UserCompetency,
  CompetencyLevel,
  CareerProfile,
  CareerCompetencyRequirement,
} from "./types";

/** Bangun UserProfile lengkap dari DB untuk classification engine. */
export async function loadUserProfile(userId: string): Promise<UserProfile> {
  const supabase = await createClient();

  const [{ data: academic }, { data: skills }, { data: experiences }, { data: interests }] =
    await Promise.all([
      supabase
        .from("academic_records")
        .select("mathematics, english, science, indonesian, social_studies, vocational")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_competencies")
        .select("competency_id, level, evidence")
        .eq("user_id", userId),
      supabase
        .from("experiences")
        .select("type, title, description")
        .eq("user_id", userId),
      supabase.from("user_interests").select("interest").eq("user_id", userId),
    ]);

  const mappedSkills: UserCompetency[] = (skills ?? []).map((s) => ({
    competencyId: s.competency_id,
    level: Math.min(5, Math.max(1, Number(s.level) || 1)) as CompetencyLevel,
    evidence: s.evidence ?? undefined,
  }));

  return {
    id: userId,
    academic: {
      mathematics: Number(academic?.mathematics ?? 0),
      english: Number(academic?.english ?? 0),
      science: Number(academic?.science ?? 0),
      indonesian: Number(academic?.indonesian ?? 0),
      socialStudies: academic?.social_studies != null ? Number(academic.social_studies) : undefined,
      vocational: academic?.vocational != null ? Number(academic.vocational) : undefined,
    },
    skills: mappedSkills,
    interests: (interests ?? []).map((i) => i.interest),
    experiences: (experiences ?? []).map((e) => ({
      type: e.type as UserProfile["experiences"][number]["type"],
      title: e.title,
      description: e.description ?? undefined,
    })),
  };
}

/** Ambil career + competency requirements dari DB. */
export async function loadCareerProfile(
  supabase: SupabaseClient,
  key: { id?: string; slug?: string }
): Promise<CareerProfile | null> {
  let query = supabase
    .from("careers")
    .select("id, name, slug, description")
    .eq("is_active", true);
  query = key.id ? query.eq("id", key.id) : query.eq("slug", key.slug!);

  const { data: career } = await query.maybeSingle();
  if (!career) return null;

  const { data: reqs } = await supabase
    .from("career_competencies")
    .select("competency_id, required_level, weight, is_core")
    .eq("career_id", career.id);

  const requirements: CareerCompetencyRequirement[] = (reqs ?? []).map((r) => ({
    competencyId: r.competency_id,
    requiredLevel: Math.min(5, Math.max(1, Number(r.required_level) || 1)) as CompetencyLevel,
    weight: Number(r.weight) || 0,
    isCore: r.is_core ?? true,
  }));

  return {
    id: career.id,
    name: career.name,
    slug: career.slug,
    description: career.description ?? "",
    competencyRequirements: requirements,
    recommendedLearningAreas: [],
  };
}

/** Map competency_id → name untuk explanation yang readable. */
export async function loadCompetencyNames(
  supabase: SupabaseClient
): Promise<Record<string, string>> {
  const { data } = await supabase.from("competencies").select("id, name");
  return Object.fromEntries((data ?? []).map((c) => [c.id, c.name]));
}

/** Ambil SEMUA career aktif (untuk explorer / compare). */
export async function loadAllCareers(supabase: SupabaseClient): Promise<CareerProfile[]> {
  const { data: careers } = await supabase
    .from("careers")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .order("name");

  const result: CareerProfile[] = [];
  for (const c of careers ?? []) {
    const { data: reqs } = await supabase
      .from("career_competencies")
      .select("competency_id, required_level, weight, is_core")
      .eq("career_id", c.id);
    result.push({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      competencyRequirements: (reqs ?? []).map((r) => ({
        competencyId: r.competency_id,
        requiredLevel: Math.min(5, Math.max(1, Number(r.required_level) || 1)) as CompetencyLevel,
        weight: Number(r.weight) || 0,
        isCore: r.is_core ?? true,
      })),
      recommendedLearningAreas: [],
    });
  }
  return result;
}