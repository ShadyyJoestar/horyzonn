// lib/classification/types.ts

export type CompetencyLevel = 1 | 2 | 3 | 4 | 5;

export type ClassificationLevel =
  | "EXPLORING"
  | "DEVELOPING"
  | "READY_WITH_GAPS"
  | "CAREER_READY";

export type GapStatus = "EXCEEDS" | "MEETS" | "GAP" | "MAJOR_GAP";

export interface Competency {
  id: string;
  name: string;
  category: string; // technical, soft, domain, dll
}

export interface CareerCompetencyRequirement {
  competencyId: string;
  requiredLevel: CompetencyLevel;
  weight: number; // 0-1, total weight idealnya 1
  isCore: boolean;
}

export interface CareerProfile {
  id: string;
  name: string;
  slug: string;
  description: string;
  competencyRequirements: CareerCompetencyRequirement[];
  recommendedLearningAreas: string[];
}

export interface UserCompetency {
  competencyId: string;
  level: CompetencyLevel;
  evidence?: string; // project / experience
}

export interface UserProfile {
  id: string;
  academic: {
    mathematics: number; // 0-100
    english: number;
    science: number;
    indonesian: number;
    socialStudies?: number;
    vocational?: number;
  };
  skills: UserCompetency[];
  interests: string[];
  experiences: {
    type: "project" | "organization" | "internship" | "certification" | "competition";
    title: string;
    description?: string;
  }[];
}

export interface CompetencyGap {
  competencyId: string;
  competencyName: string;
  currentLevel: CompetencyLevel;
  requiredLevel: CompetencyLevel;
  weight: number;
  status: GapStatus;
  gapSize: number; // required - current (bisa negatif)
}

export interface ClassificationResult {
  readinessScore: number; // 0-100
  classification: ClassificationLevel;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  profileCompleteness: number; // 0-100
  gaps: CompetencyGap[];
  strengths: CompetencyGap[]; // yang EXCEEDS atau MEETS dengan weight tinggi
  explanation: {
    summary: string;
    strongestAreas: string[];
    mainGaps: string[];
    contributingFactors: string[];
  };
  actionPlan: {
    priority: number;
    competencyName: string;
    currentLevel: number;
    targetLevel: number;
    suggestedAction: string;
  }[];
}