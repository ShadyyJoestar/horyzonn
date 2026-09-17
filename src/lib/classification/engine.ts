// lib/classification/engine.ts

import {
  CareerProfile,
  UserProfile,
  ClassificationResult,
  CompetencyGap,
  CompetencyLevel,
  UserCompetency,
} from "./types";
import { getClassificationLevel, getGapStatus } from "./rules";

/**
 * Hitung readiness score berdasarkan weighted competency matching.
 * Score = sum( (currentLevel / requiredLevel) * weight ) * 100
 * Tapi dibatasi max 1.0 per competency (tidak over-score terlalu jauh)
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

    // Rasio kemampuan (max 1.2 biar yang exceeds tetap dikasih sedikit bonus)
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
      summary = `Profil Anda menunjukkan kesiapan tinggi untuk jalur ${careerName} (skor ${score}). Sebagian besar kompetensi inti sudah terpenuhi.`;
      break;
    case "READY_WITH_GAPS":
      summary = `Profil Anda sudah cukup kuat untuk ${careerName} (skor ${score}), namun masih ada beberapa area penting yang perlu dikembangkan.`;
      break;
    case "DEVELOPING":
      summary = `Anda sedang dalam tahap pengembangan untuk ${careerName} (skor ${score}). Beberapa fondasi sudah ada, tapi masih banyak gap yang harus ditutup.`;
      break;
    case "EXPLORING":
      summary = `Saat ini profil Anda masih berada di tahap eksplorasi untuk ${careerName} (skor ${score}). Evidence terhadap kompetensi target masih terbatas.`;
      break;
  }

  return {
    summary,
    strongestAreas: strengths,
    mainGaps,
    contributingFactors: [
      ...strengths.map((s) => `Kekuatan di ${s}`),
      ...mainGaps.map((g) => `Gap pada ${g}`),
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
          ? `Fokus membangun fondasi ${g.competencyName} (naikkan minimal 2 level).`
          : `Tingkatkan ${g.competencyName} dari level ${g.currentLevel} ke ${g.requiredLevel}.`,
    }));
}

function calculateProfileCompleteness(profile: UserProfile): number {
  let score = 0;
  const academicFilled = Object.values(profile.academic).filter((v) => v > 0).length;
  score += Math.min(academicFilled / 4, 1) * 25;

  score += Math.min(profile.skills.length / 8, 1) * 30;
  score += Math.min(profile.experiences.length / 3, 1) * 25;
  score += Math.min(profile.interests.length / 3, 1) * 20;

  return Math.round(score);
}

/**
 * Main function — Classification Engine
 */
export function runCareerClassification(
  userProfile: UserProfile,
  career: CareerProfile,
  competencyNames: Record<string, string> = {}
): ClassificationResult {
  const readinessScore = calculateReadinessScore(
    userProfile.skills,
    career.competencyRequirements
  );

  const classification = getClassificationLevel(readinessScore);
  const gaps = buildGaps(userProfile.skills, career, competencyNames);

  const strengths = gaps
    .filter((g) => g.status === "EXCEEDS" || g.status === "MEETS")
    .sort((a, b) => b.weight - a.weight);

  const profileCompleteness = calculateProfileCompleteness(userProfile);

  let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (profileCompleteness >= 80) confidence = "HIGH";
  else if (profileCompleteness >= 50) confidence = "MEDIUM";

  const explanation = generateExplanation(
    classification,
    readinessScore,
    gaps,
    career.name
  );

  const actionPlan = generateActionPlan(gaps);

  return {
    readinessScore,
    classification,
    confidence,
    profileCompleteness,
    gaps,
    strengths,
    explanation,
    actionPlan,
  };
}