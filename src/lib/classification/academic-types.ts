    export type AcademicProfileType =
  | "TECHNICAL_ORIENTED"
  | "CREATIVE_ORIENTED"
  | "ANALYTICAL_ORIENTED"
  | "COMMUNICATION_ORIENTED"
  | "MULTIDISCIPLINARY";

export interface AcademicOrientationScores {
  technical: number;
  creative: number;
  analytical: number;
  communication: number;
}

export interface EducationPathMatch {
  id: string;
  name: string;
  slug: string;
  description: string;
  compatibility: number; // 0-100
  level: "HIGH" | "MEDIUM" | "LOW";
  factors: string[];
}

export interface AcademicClassificationResult {
  profileType: AcademicProfileType;
  scores: AcademicOrientationScores;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  profileCompleteness: number;
  explanation: {
    summary: string;
    strongestSignals: string[];
    notes: string[];
  };
  recommendations: EducationPathMatch[];
}