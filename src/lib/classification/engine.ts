// lib/classification/engine.ts

import {
  CareerProfile,
  UserProfile,
  ClassificationResult,
  CompetencyGap,
  CompetencyLevel,
  UserCompetency,
} from "./types";
import {
  getClassificationLevel,
  getGapStatus,
  Thresholds,
} from "./rules";

/**
 * Hitung readiness score berdasarkan weighted competency matching.
 * Score = sum( (currentLevel / requiredLevel) * weight ) / totalWeight * 100
 * Rasio per competency di-cap 1.2 biar yang exceeds dapat sedikit bonus,
 * tapi skor akhir tetap di-cap 100.
 */
function calculateReadinessScore(
  userSkills: UserCompetency[],
  requirements: CareerProfile["competencyRequirements"]
): number {
  if (requirements.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const req of requirements) {
    const userSkill = userSkills.find((s) => s.competencyId === req.competencyId);
    const currentLevel = userSkill?.level ?? 1; // default 1 kalau belum diisi
    const ratio = Math.min(currentLevel / req.requiredLevel, 1.2);

    totalWeightedScore += ratio * req.weight;
    totalWeight += req.weight;
  }

  if (totalWeight === 0) return 0;

  const normalized = totalWeightedScore / totalWeight;
  return Math.round(Math.min(normalized * 100, 100));
}

function buildGaps(
  userSkills: UserCompetency[],
  career: CareerProfile,
  competencyNames: Record<string, string>
): CompetencyGap[] {
  return career.competencyRequirements.map((req) => {
    const userSkill = userSkills.find((s) => s.competencyId === req.competencyId);
    const currentLevel = (userSkill?.level ?? 1) as CompetencyLevel;

    return {
      competencyId: req.competencyId,
      competencyName: competencyNames[req.competencyId] || req.competencyId,
      currentLevel,
      requiredLevel: req.requiredLevel,
      weight: req.weight,
      status: getGapStatus(currentLevel, req.requiredLevel),
      gapSize: req.requiredLevel - currentLevel,
    };
  });
}

function generateExplanation(
  classification: ClassificationResult["classification"],
  score: number,
  gaps: CompetencyGap[],
  careerName: string
): ClassificationResult["explanation"] {
  const strengths = gaps
    .filter((g) => g.status === "EXCEEDS" || g.status === "MEETS")
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((g) => g.competencyName);

  const mainGaps = gaps
    .filter((g) => g.status === "GAP" || g.status === "MAJOR_GAP")
    .sort((a, b) => b.weight - a.weight || b.gapSize - a.gapSize)
    .slice(0, 3)
    .map((g) => g.competencyName);

  let summary = "";
  switch (classification) {
    case "CAREER_READY":
      summary = `Based on the competency requirements and the information you provided, your current profile is classified as Career Ready for ${careerName} (score ${score}). This is decision support — not a guarantee of outcomes.`;
      break;
    case "READY_WITH_GAPS":
      summary = `Your profile is classified as Ready With Gaps for ${careerName} (score ${score}). Most core competencies are met, but a few weighted areas still need development.`;
      break;
    case "DEVELOPING":
      summary = `You are in a Developing stage for ${careerName} (score ${score}). Some foundations exist, but several gaps still need to be closed.`;
      break;
    case "EXPLORING":
    default:
      summary = `Your profile is in an Exploring stage for ${careerName} (score ${score}). Evidence against the target competencies is limited — add more data to get a sharper classification.`;
  }

  return {
    summary,
    strongestAreas: strengths,
    mainGaps,
    contributingFactors: [
      ...strengths.map((s) => `Strength in ${s}`),
      ...mainGaps.map((g) => `Gap in ${g}`),
    ],
  };
}

function generateActionPlan(gaps: CompetencyGap[]): ClassificationResult["actionPlan"] {
  return gaps
    .filter((g) => g.status === "GAP" || g.status === "MAJOR_GAP")
    .sort((a, b) => b.weight - a.weight || b.gapSize - a.gapSize)
    .slice(0, 5)
    .map((g, index) => ({
      priority: index + 1,
      competencyName: g.competencyName,
      currentLevel: g.currentLevel,
      targetLevel: g.requiredLevel,
      suggestedAction:
        g.status === "MAJOR_GAP"
          ? `Build a stronger foundation in ${g.competencyName} (raise at least 2 levels).`
          : `Improve ${g.competencyName} from level ${g.currentLevel} to ${g.requiredLevel}.`,
    }));
}

function calculateProfileCompleteness(profile: UserProfile): number {
  let score = 0;

  const academicFilled = Object.values(profile.academic).filter(
    (v) => v !== undefined && v > 0
  ).length;
  score += Math.min(academicFilled / 4, 1) * 25;
  score += Math.min(profile.skills.length / 8, 1) * 30;
  score += Math.min(profile.experiences.length / 3, 1) * 25;
  score += Math.min(profile.interests.length / 3, 1) * 20;

  return Math.round(score);
}

/**
 * Main function — Classification Engine
 * thresholds opsional: kalau dikasih, pakai nilai dari DB (classification_rules).
 * Kalau tidak, fallback ke CLASSIFICATION_THRESHOLDS di rules.ts.
 */
export function runCareerClassification(
  userProfile: UserProfile,
  career: CareerProfile,
  competencyNames: Record<string, string> = {},
  thresholds?: Thresholds
): ClassificationResult {
  const readinessScore = calculateReadinessScore(
    userProfile.skills,
    career.competencyRequirements
  );

  const classification = getClassificationLevel(readinessScore, thresholds);
  const gaps = buildGaps(userProfile.skills, career, competencyNames);

  const strengths = gaps
    .filter((g) => g.status === "EXCEEDS" || g.status === "MEETS")
    .sort((a, b) => b.weight - a.weight);

  const profileCompleteness = calculateProfileCompleteness(userProfile);

  let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (profileCompleteness >= 80) confidence = "HIGH";
  else if (profileCompleteness >= 50) confidence = "MEDIUM";

  return {
    readinessScore,
    classification,
    confidence,
    profileCompleteness,
    gaps,
    strengths,
    explanation: generateExplanation(
      classification,
      readinessScore,
      gaps,
      career.name
    ),
    actionPlan: generateActionPlan(gaps),
  };
}