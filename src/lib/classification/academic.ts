// lib/classification/academic.ts
// Academic Path Classification Engine (studi kasus bagian 5–7)
// Modular & independent dari UI — bisa diuji sendiri.

export type AcademicOrientation =
  | "TECHNICAL"
  | "CREATIVE"
  | "ANALYTICAL"
  | "COMMUNICATION"
  | "MULTIDISCIPLINARY";

export interface AcademicClassificationInput {
  academic: {
    mathematics: number | null;
    english: number | null;
    science: number | null;
    indonesian: number | null;
    social_studies?: number | null;
    vocational?: number | null;
  };
  skills: { name: string; category: string; level: number }[];
  interests: string[];
  experiences: { type: string; title: string }[];
}

export type PathCompatibility = "HIGH" | "MEDIUM" | "EXPLORATORY";

export interface EducationPathRecommendation {
  name: string;
  compatibility: PathCompatibility;
  factors: string[];
}

export interface AcademicClassificationResult {
  orientation: AcademicOrientation;
  scores: Record<AcademicOrientation, number>;
  explanation: {
    summary: string;
    contributingFactors: string[];
  };
  recommendations: EducationPathRecommendation[];
}

const TECH_INTERESTS = [
  "software development",
  "game development",
  "data science",
  "cybersecurity",
  "artificial intelligence",
  "engineering",
];

const CREATIVE_INTERESTS = [
  "ui/ux design",
  "game development",
  "design",
  "art",
  "multimedia",
];

const ANALYTICAL_INTERESTS = [
  "data science",
  "research",
  "mathematics",
  "artificial intelligence",
];

const COMMUNICATION_INTERESTS = [
  "business",
  "product management",
  "communication",
];

const ORIENTATION_LABEL: Record<AcademicOrientation, string> = {
  TECHNICAL: "Technical-Oriented",
  CREATIVE: "Creative-Oriented",
  ANALYTICAL: "Analytical-Oriented",
  COMMUNICATION: "Communication-Oriented",
  MULTIDISCIPLINARY: "Multidisciplinary",
};

function avgPositive(...vals: (number | null | undefined)[]): number | null {
  const valid = vals.filter((v): v is number => typeof v === "number" && v > 0);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function matchCount(source: string[], patterns: string[]): number {
  return source.filter((s) =>
    patterns.some((p) => s.toLowerCase().includes(p))
  ).length;
}

export function classifyAcademicProfile(
  input: AcademicClassificationInput
): AcademicClassificationResult {
  const { academic, skills, interests, experiences } = input;

  const techSkills = skills.filter(
    (s) =>
      s.category?.toLowerCase() === "technical" ||
      /program|coding|develop|web|software|database|network|system/i.test(s.name)
  );
  const creativeSkills = skills.filter(
    (s) =>
      s.category?.toLowerCase() === "design" ||
      /design|ui|ux|art|creative|video|animation/i.test(s.name)
  );
  const analyticalSkills = skills.filter(
    (s) =>
      /analy|math|logic|research|data|algorithm|statistic/i.test(s.name) ||
      s.category?.toLowerCase() === "analytical"
  );
  const commSkills = skills.filter(
    (s) =>
      /communic|present|leader|team|writ|speak|manage/i.test(s.name) ||
      s.category?.toLowerCase() === "soft"
  );

  const techSkillAvg = avgPositive(...techSkills.map((s) => s.level));
  const creativeSkillAvg = avgPositive(...creativeSkills.map((s) => s.level));
  const analyticalSkillAvg = avgPositive(...analyticalSkills.map((s) => s.level));
  const commSkillAvg = avgPositive(...commSkills.map((s) => s.level));

  const subjectTech = avgPositive(academic.mathematics, academic.science, academic.vocational);
  const subjectComm = avgPositive(academic.english, academic.indonesian);

  const projectCount = experiences.filter((e) => e.type === "project").length;
  const orgCount = experiences.filter((e) => e.type === "organization").length;

  const interestSignals = (patterns: string[]) =>
    Math.min(matchCount(interests, patterns) / 2, 1) * 100;

  // Score tiap orientasi 0–100 dari data aktual
  const scores: Record<AcademicOrientation, number> = {
    TECHNICAL: Math.round(
      (subjectTech ?? 0) * 0.45 +
        (techSkillAvg ? techSkillAvg * 20 * 0.35 : 0) +
        interestSignals(TECH_INTERESTS) * 0.2
    ),
    CREATIVE: Math.round(
      (creativeSkillAvg ? creativeSkillAvg * 20 * 0.6 : 0) +
        interestSignals(CREATIVE_INTERESTS) * 0.4
    ),
    ANALYTICAL: Math.round(
      (academic.mathematics ?? 0) * 0.4 +
        (analyticalSkillAvg ? analyticalSkillAvg * 20 * 0.35 : 0) +
        interestSignals(ANALYTICAL_INTERESTS) * 0.25
    ),
    COMMUNICATION: Math.round(
      (subjectComm ?? 0) * 0.45 +
        (commSkillAvg ? commSkillAvg * 20 * 0.35 : 0) +
        interestSignals(COMMUNICATION_INTERESTS) * 0.2
    ),
    MULTIDISCIPLINARY: 0,
  };

  const baseOrientations: Exclude<AcademicOrientation, "MULTIDISCIPLINARY">[] = [
    "TECHNICAL",
    "CREATIVE",
    "ANALYTICAL",
    "COMMUNICATION",
  ];

  const sorted = baseOrientations
    .map((o) => [o, scores[o]] as const)
    .sort((a, b) => b[1] - a[1]);

  const [top, topScore] = sorted[0];
  const [second, secondScore] = sorted[1];

  // Kalau dua orientasi teratas berjarak ≤ 10 poin → Multidisciplinary
  const orientation: AcademicOrientation =
    topScore - secondScore <= 10 ? "MULTIDISCIPLINARY" : top;

  scores.MULTIDISCIPLINARY =
    orientation === "MULTIDISCIPLINARY"
      ? Math.round((topScore + secondScore) / 2)
      : 0;

  // Contributing factors dari data aktual (bukan angka random)
  const contributingFactors: string[] = [];
  if (academic.mathematics && academic.mathematics > 0)
    contributingFactors.push(`Mathematics score ${academic.mathematics}`);
  if (academic.english && academic.english > 0)
    contributingFactors.push(`English score ${academic.english}`);
  if (academic.vocational && academic.vocational > 0)
    contributingFactors.push(`Vocational subjects score ${academic.vocational}`);
  if (techSkills.length > 0)
    contributingFactors.push(
      `${techSkills.length} technical skill(s) (avg level ${(techSkillAvg ?? 0).toFixed(1)})`
    );
  if (creativeSkills.length > 0)
    contributingFactors.push(`${creativeSkills.length} design/creative skill(s)`);
  if (analyticalSkills.length > 0)
    contributingFactors.push(`${analyticalSkills.length} analytical skill(s)`);
  if (commSkills.length > 0)
    contributingFactors.push(`${commSkills.length} communication/soft skill(s)`);
  if (interests.length > 0)
    contributingFactors.push(`Interests: ${interests.slice(0, 4).join(", ")}`);
  if (projectCount > 0) contributingFactors.push(`${projectCount} project experience(s)`);
  if (orgCount > 0) contributingFactors.push(`${orgCount} organization experience(s)`);

  const summary =
    orientation === "MULTIDISCIPLINARY"
      ? `Your competencies are spread across multiple domains (${ORIENTATION_LABEL[top]} and ${ORIENTATION_LABEL[second]} are close). A multidisciplinary path may fit you well.`
      : `Your profile is classified as ${ORIENTATION_LABEL[orientation]}, driven by your strongest signals in that domain.`;

  // Education path knowledge base (studi kasus §7 — tiap rekomendasi
  // menjelaskan faktor yang berkontribusi, bukan cuma angka)
  const PATHS: {
    name: string;
    primary: AcademicOrientation[];
    secondary: AcademicOrientation[];
  }[] = [
    { name: "Computer Science / Software Engineering", primary: ["TECHNICAL"], secondary: ["ANALYTICAL"] },
    { name: "Engineering (Electrical / Mechanical / Civil)", primary: ["TECHNICAL"], secondary: ["ANALYTICAL"] },
    { name: "Data Science / Statistics", primary: ["ANALYTICAL"], secondary: ["TECHNICAL"] },
    { name: "Information Systems", primary: ["TECHNICAL"], secondary: ["COMMUNICATION"] },
    { name: "Game Development / Interactive Media", primary: ["CREATIVE"], secondary: ["TECHNICAL"] },
    { name: "Digital Design / Visual Communication Design", primary: ["CREATIVE"], secondary: ["COMMUNICATION"] },
    { name: "Communication / Business & Management", primary: ["COMMUNICATION"], secondary: ["CREATIVE"] },
    { name: "Multidisciplinary / Interdisciplinary Studies", primary: ["MULTIDISCIPLINARY"], secondary: [] },
  ];

  const recommendations: EducationPathRecommendation[] = PATHS.map((p) => {
    const compatibility: PathCompatibility =
      p.primary.includes(orientation) ||
      (orientation === "MULTIDISCIPLINARY" && p.secondary.length > 0)
        ? "HIGH"
        : p.secondary.includes(orientation)
          ? "MEDIUM"
          : "EXPLORATORY";

    return {
      name: p.name,
      compatibility,
      factors: contributingFactors.slice(0, 4),
    };
  })
    .sort((a, b) => {
      const rank = { HIGH: 0, MEDIUM: 1, EXPLORATORY: 2 };
      return rank[a.compatibility] - rank[b.compatibility];
    })
    .slice(0, 6);

  return {
    orientation,
    scores,
    explanation: { summary, contributingFactors },
    recommendations,
  };
}