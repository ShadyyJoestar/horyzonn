import { ClassificationLevel } from "./types";

export const CLASSIFICATION_THRESHOLDS = {
  CAREER_READY: 85,
  READY_WITH_GAPS: 70,
  DEVELOPING: 50,
} as const;

export type Thresholds = {
  CAREER_READY: number;
  READY_WITH_GAPS: number;
  DEVELOPING: number;
};

export function getClassificationLevel(
  score: number,
  thresholds: Thresholds = CLASSIFICATION_THRESHOLDS
): ClassificationLevel {
  if (score >= thresholds.CAREER_READY) return "CAREER_READY";
  if (score >= thresholds.READY_WITH_GAPS) return "READY_WITH_GAPS";
  if (score >= thresholds.DEVELOPING) return "DEVELOPING";
  return "EXPLORING";
}

export function getGapStatus(
  current: number,
  required: number
): "EXCEEDS" | "MEETS" | "GAP" | "MAJOR_GAP" {
  const diff = current - required;
  if (diff >= 1) return "EXCEEDS";
  if (diff === 0) return "MEETS";
  if (diff === -1) return "GAP";
  return "MAJOR_GAP";
}