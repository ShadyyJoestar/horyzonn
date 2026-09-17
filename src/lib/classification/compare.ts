// src/lib/classification/compare.ts
import {
  CareerProfile,
  ClassificationLevel,
  CompetencyLevel,
  UserCompetency,
} from "./types";
import { getClassificationLevel, getGapStatus } from "./rules";

export interface CareerComparison {
  careerId: string;
  careerName: string;
  readinessScore: number;
  classification: ClassificationLevel;
  metCount: number;
  gapCount: number;
  majorGapCount: number;
  topGaps: { competencyName: string; gapSize: number; weight: number }[];
  strongest: string[];
}

export interface CompareResult {
  comparisons: CareerComparison[];
  tradeoffs: string[];
  limitedData: boolean;
}

export function compareCareerScenarios(
  userSkills: UserCompetency[],
  careers: CareerProfile[],
  competencyNames: Record<string, string>,
  thresholds?: { CAREER_READY: number; READY_WITH_GAPS: number; DEVELOPING: number }
): CompareResult {
  const comparisons: CareerComparison[] = careers.map((career) => {
    let totalWeighted = 0;
    let totalWeight = 0;
    let metCount = 0;
    let gapCount = 0;
    let majorGapCount = 0;
    const gaps: CareerComparison["topGaps"] = [];
    const strongest: string[] = [];

    for (const req of career.competencyRequirements) {
      const user = userSkills.find((s) => s.competencyId === req.competencyId);
      const current = (user?.level ?? 1) as CompetencyLevel;
      const name = competencyNames[req.competencyId] || req.competencyId;
      const ratio = Math.min(current / req.requiredLevel, 1.2);

      totalWeighted += ratio * req.weight;
      totalWeight += req.weight;

      const status = getGapStatus(current, req.requiredLevel);
      if (status === "EXCEEDS" || status === "MEETS") {
        metCount++;
        if (req.weight >= 0.15) strongest.push(name);
      } else {
        gapCount++;
        if (status === "MAJOR_GAP") majorGapCount++;
        gaps.push({
          competencyName: name,
          gapSize: req.requiredLevel - current,
          weight: req.weight,
        });
      }
    }

    const score =
      totalWeight > 0
        ? Math.round(Math.min((totalWeighted / totalWeight) * 100, 100))
        : 0;

    return {
      careerId: career.id,
      careerName: career.name,
      readinessScore: score,
      classification: getClassificationLevel(score, thresholds),
      metCount,
      gapCount,
      majorGapCount,
      topGaps: gaps.sort((a, b) => b.weight - a.weight || b.gapSize - a.gapSize).slice(0, 5),
      strongest: strongest.slice(0, 4),
    };
  });

  // Trade-off narrative
  const tradeoffs: string[] = [];
  if (comparisons.length >= 2) {
    const sorted = [...comparisons].sort(
      (a, b) => b.readinessScore - a.readinessScore
    );
    const best = sorted[0];
    tradeoffs.push(
      `Right now your profile is closest to ${best.careerName} (readiness ${best.readinessScore}).`
    );
    for (let i = 1; i < sorted.length; i++) {
      const c = sorted[i];
      tradeoffs.push(
        `${c.careerName} needs ${c.gapCount} competency upgrade(s) from your current level — ${c.majorGapCount} of them are major gaps.`
      );
    }
    // Shared gaps
    const gapNames = comparisons.map((c) => new Set(c.topGaps.map((g) => g.competencyName)));
    if (gapNames.length >= 2) {
      const shared = [...gapNames[0]].filter((g) =>
        gapNames.every((set) => set.has(g))
      );
      if (shared.length > 0) {
        tradeoffs.push(
          `Upgrading ${shared.join(", ")} improves your readiness for ALL selected careers.`
        );
      }
    }
  }

  // Limited data: user covers < 50% of required competencies in any career
  const limitedData = comparisons.some(
    (c) => c.metCount + c.gapCount > 0 && c.metCount / (c.metCount + c.gapCount) < 0.5
  );

  return { comparisons, tradeoffs, limitedData };
}