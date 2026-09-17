// src/lib/classification/level-rubric.ts

export interface RubricLevel {
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  description: string;
  exampleEvidence: string;
  category?: string;
}

/** Fallback kalau tabel competency_rubrics kosong / query gagal */
export const GENERAL_RUBRIC: RubricLevel[] = [
  {
    level: 1,
    label: "Aware / Beginner",
    description:
      "You know the basic concepts and have tried it, but still need step-by-step guidance for small tasks.",
    exampleEvidence:
      "Followed a course/tutorial, built a “hello world”, replicated a demo but never built something from scratch.",
    category: "general",
  },
  {
    level: 2,
    label: "Guided Practitioner",
    description:
      "You can finish small tasks on your own with references/tutorials, but get stuck on non-standard problems.",
    exampleEvidence:
      "Built 1–2 small projects following tutorials, can read documentation, still needs help with weird errors.",
    category: "general",
  },
  {
    level: 3,
    label: "Independent Practitioner",
    description:
      "You can complete a whole project independently from zero to finished, including debugging common issues.",
    exampleEvidence:
      "At least 1 finished project that is your own idea & execution (not a tutorial), and you can explain the technical decisions.",
    category: "general",
  },
  {
    level: 4,
    label: "Advanced / Mentor",
    description:
      "You handle complex cases, optimization, or edge cases confidently. Others start asking you for help.",
    exampleEvidence:
      "Real-scale project (used by others / competition / client), open-source contribution, or mentored peers.",
    category: "general",
  },
  {
    level: 5,
    label: "Expert / Leader",
    description:
      "You set standards for others: design architecture, lead projects, or your work is publicly recognized.",
    exampleEvidence:
      "Led a team, won a prestigious competition, published work, or a project with significant real users.",
    category: "general",
  },
];

/** Alias biar import lama / baru sama-sama jalan */
export const DEFAULT_RUBRICS = GENERAL_RUBRIC;

type RubricRow = {
  category: string;
  level: number;
  label: string;
  description: string;
  example_evidence?: string;
  exampleEvidence?: string;
};

/**
 * Group rows from competency_rubrics → Record<category, RubricLevel[]>
 * Dipakai di profile/page.tsx
 */
export function groupRubricsByCategory(
  rows: RubricRow[]
): Record<string, RubricLevel[]> {
  const map: Record<string, RubricLevel[]> = {};

  for (const row of rows) {
    const level = Math.min(5, Math.max(1, Number(row.level))) as 1 | 2 | 3 | 4 | 5;
    const item: RubricLevel = {
      level,
      label: row.label,
      description: row.description,
      exampleEvidence: row.example_evidence || row.exampleEvidence || "",
      category: row.category,
    };
    if (!map[row.category]) map[row.category] = [];
    map[row.category].push(item);
  }

  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.level - b.level);
  }

  if (!map.general || map.general.length === 0) {
    map.general = GENERAL_RUBRIC;
  }

  return map;
}

/** Ambil rubrik per kategori competency; fallback ke general */
export function getRubricsForCategory(
  rubricsByCategory: Record<string, RubricLevel[]>,
  category?: string | null
): RubricLevel[] {
  if (category && rubricsByCategory[category]?.length) {
    return rubricsByCategory[category];
  }
  return rubricsByCategory.general || GENERAL_RUBRIC;
}

/** Versi lama (kalau skills-form / level-picker masih pakai ini) */
export function getRubricForCategory(
  rubrics: RubricLevel[] | null,
  _category: string
): RubricLevel[] {
  if (!rubrics || rubrics.length === 0) return GENERAL_RUBRIC;
  return rubrics;
}

export function getRubricLevel(
  rubrics: RubricLevel[],
  level: number
): RubricLevel | undefined {
  return rubrics.find((l) => l.level === level);
}

/**
 * Mini self-assessment → suggested level.
 * q1 practiced, q2 independent, q3 mentorOthers
 */
export function suggestLevel(answers: {
  practiced: boolean;
  independent: boolean;
  mentorOthers: boolean;
}): 1 | 2 | 3 | 4 | 5 {
  if (!answers.practiced) return 1;
  if (!answers.independent) return 2;
  if (!answers.mentorOthers) return 3;
  return 4; // level 5 stays manual — needs explicit public/leadership evidence
}