import {
  AcademicClassificationResult,
  AcademicOrientationScores,
  AcademicProfileType,
  EducationPathMatch,
} from "./academic-types";
import { UserProfile } from "./types";

interface EducationPathRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  profile_tags: string[] | null;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.round(Math.min(max, Math.max(min, n)));
}

/** Map competency categories + names into orientation buckets */
function skillOrientationBoost(skills: UserProfile["skills"], names: Record<string, string>) {
  const scores = { technical: 0, creative: 0, analytical: 0, communication: 0 };
  const weights = { technical: 0, creative: 0, analytical: 0, communication: 0 };

  for (const s of skills) {
    const name = (names[s.competencyId] || "").toLowerCase();
    const level = s.level; // 1-5

    const add = (key: keyof typeof scores, w = 1) => {
      scores[key] += (level / 5) * 100 * w;
      weights[key] += w;
    };

    if (
      /program|frontend|backend|database|system|cyber|game|dsa|software|code/.test(name)
    ) {
      add("technical", 1.2);
    }
    if (/ui|ux|design|creative|product thinking/.test(name)) {
      add("creative", 1.2);
    }
    if (/math|research|data|problem|analy|statistic/.test(name)) {
      add("analytical", 1.2);
    }
    if (/communicat|collaborat|present|leader/.test(name)) {
      add("communication", 1.2);
    }
  }

  (Object.keys(scores) as (keyof typeof scores)[]).forEach((k) => {
    scores[k] = weights[k] > 0 ? scores[k] / weights[k] : 0;
  });

  return scores;
}

function academicOrientation(academic: UserProfile["academic"]) {
  const math = academic.mathematics || 0;
  const science = academic.science || 0;
  const english = academic.english || 0;
  const indo = academic.indonesian || 0;
  const social = academic.socialStudies || 0;
  const vocational = academic.vocational || 0;

  return {
    technical: clamp(vocational * 0.5 + science * 0.3 + math * 0.2),
    creative: clamp((vocational * 0.35 + english * 0.25 + indo * 0.2 + social * 0.2) * 0.85),
    analytical: clamp(math * 0.55 + science * 0.45),
    communication: clamp(english * 0.4 + indo * 0.35 + social * 0.25),
  };
}

function interestBoost(interests: string[]) {
  const scores = { technical: 0, creative: 0, analytical: 0, communication: 0 };
  for (const raw of interests) {
    const i = raw.toLowerCase();
    if (/software|program|engineer|cyber|game|tech/.test(i)) scores.technical += 18;
    if (/design|creative|media|art|ui|ux/.test(i)) scores.creative += 18;
    if (/data|research|math|science|analy/.test(i)) scores.analytical += 18;
    if (/business|communicat|manage|market|psych/.test(i)) scores.communication += 18;
  }
  return scores;
}

function experienceBoost(experiences: UserProfile["experiences"]) {
  const scores = { technical: 0, creative: 0, analytical: 0, communication: 0 };
  for (const e of experiences) {
    const t = `${e.type} ${e.title} ${e.description || ""}`.toLowerCase();
    if (/project|competition|internship|code|app|software|game/.test(t)) scores.technical += 12;
    if (/design|creative|media|ui/.test(t)) scores.creative += 12;
    if (/research|data|olymp|math|science/.test(t)) scores.analytical += 12;
    if (/organization|leader|volunteer|present|debate/.test(t)) scores.communication += 12;
  }
  return scores;
}

function mergeScores(
  parts: AcademicOrientationScores[],
  weights: number[]
): AcademicOrientationScores {
  const keys: (keyof AcademicOrientationScores)[] = [
    "technical",
    "creative",
    "analytical",
    "communication",
  ];
  const out = { technical: 0, creative: 0, analytical: 0, communication: 0 };
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;

  for (const k of keys) {
    let s = 0;
    parts.forEach((p, i) => {
      s += p[k] * weights[i];
    });
    out[k] = clamp(s / wSum);
  }
  return out;
}

function pickProfileType(scores: AcademicOrientationScores): AcademicProfileType {
  const entries = Object.entries(scores) as [keyof AcademicOrientationScores, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const [topKey, topVal] = entries[0];
  const secondVal = entries[1][1];

  // Multidisciplinary if top scores are close and mid-range spread
  if (topVal - secondVal < 12 && topVal >= 40) {
    return "MULTIDISCIPLINARY";
  }

  const map: Record<keyof AcademicOrientationScores, AcademicProfileType> = {
    technical: "TECHNICAL_ORIENTED",
    creative: "CREATIVE_ORIENTED",
    analytical: "ANALYTICAL_ORIENTED",
    communication: "COMMUNICATION_ORIENTED",
  };
  return map[topKey];
}

function completeness(profile: UserProfile): number {
  let score = 0;
  const academicFilled = Object.values(profile.academic).filter(
    (v) => typeof v === "number" && v > 0
  ).length;
  score += Math.min(academicFilled / 4, 1) * 30;
  score += Math.min(profile.skills.length / 6, 1) * 30;
  score += Math.min(profile.experiences.length / 2, 1) * 20;
  score += Math.min(profile.interests.length / 3, 1) * 20;
  return Math.round(score);
}

function matchPaths(
  scores: AcademicOrientationScores,
  profileType: AcademicProfileType,
  paths: EducationPathRow[]
): EducationPathMatch[] {
  const tagScore = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes("technical")) return scores.technical;
    if (t.includes("creative")) return scores.creative;
    if (t.includes("analytical")) return scores.analytical;
    if (t.includes("communication")) return scores.communication;
    return 40;
  };

  const results: EducationPathMatch[] = paths.map((p) => {
    const tags = p.profile_tags || [];
    let compatibility = 35;
    const factors: string[] = [];

    if (tags.length === 0) {
      compatibility = 40;
      factors.push("General path with limited tag signals");
    } else {
      const tagScores = tags.map(tagScore);
      compatibility = tagScores.reduce((a, b) => a + b, 0) / tagScores.length;

      tags.forEach((tag) => {
        const s = tagScore(tag);
        if (s >= 65) factors.push(`Strong ${tag} signal in your profile`);
        else if (s >= 45) factors.push(`Moderate ${tag} alignment`);
        else factors.push(`Limited ${tag} evidence so far`);
      });
    }

    // Boost if profile type aligns with primary tag
    const typeTag =
      profileType === "TECHNICAL_ORIENTED"
        ? "technical"
        : profileType === "CREATIVE_ORIENTED"
          ? "creative"
          : profileType === "ANALYTICAL_ORIENTED"
            ? "analytical"
            : profileType === "COMMUNICATION_ORIENTED"
              ? "communication"
              : null;

    if (typeTag && tags.some((t) => t.toLowerCase().includes(typeTag))) {
      compatibility += 8;
      factors.unshift(`Matches your ${profileType.replace(/_/g, " ").toLowerCase()} profile`);
    }

    compatibility = clamp(compatibility);
    const level: EducationPathMatch["level"] =
      compatibility >= 70 ? "HIGH" : compatibility >= 50 ? "MEDIUM" : "LOW";

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      compatibility,
      level,
      factors: factors.slice(0, 4),
    };
  });

  return results.sort((a, b) => b.compatibility - a.compatibility);
}

export function runAcademicClassification(
  profile: UserProfile,
  paths: EducationPathRow[],
  competencyNames: Record<string, string> = {}
): AcademicClassificationResult {
  const fromSkills = skillOrientationBoost(profile.skills, competencyNames);
  const fromAcademic = academicOrientation(profile.academic);
  const fromInterests = interestBoost(profile.interests);
  const fromExp = experienceBoost(profile.experiences);

  // Weights: skills & academic heavier than interests/experience
  const scores = mergeScores(
    [fromSkills, fromAcademic, fromInterests, fromExp],
    [0.35, 0.35, 0.15, 0.15]
  );

  const profileType = pickProfileType(scores);
  const profileCompleteness = completeness(profile);

  let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (profileCompleteness >= 80) confidence = "HIGH";
  else if (profileCompleteness >= 50) confidence = "MEDIUM";

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const strongestSignals = ranked.slice(0, 2).map(
    ([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} orientation (${v}/100)`
  );

  const label = profileType.replace(/_/g, " ");
  const summary = `Based on your academic scores, skills, interests, and experience, your profile is classified as ${label}. This is a decision-support classification from the data you provided — not a fixed prediction of your future major.`;

  const notes: string[] = [];
  if (profileCompleteness < 50) {
    notes.push("Limited data — add more academic scores, skills, and experiences to improve confidence.");
  }
  if (profile.skills.length < 3) {
    notes.push("Few skills recorded; skill evidence strongly influences technical/creative classification.");
  }

  const recommendations = matchPaths(scores, profileType, paths).slice(0, 6);

  return {
    profileType,
    scores,
    confidence,
    profileCompleteness,
    explanation: { summary, strongestSignals, notes },
    recommendations,
  };
}