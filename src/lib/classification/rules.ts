// lib/classification/rules.ts

import { ClassificationLevel } from "./types";

export const CLASSIFICATION_THRESHOLDS = {
  CAREER_READY: 85,
  READY_WITH_GAPS: 70,
  DEVELOPING: 50,
  // di bawah 50 = EXPLORING
} as const;

export function getClassificationLevel(score: number): ClassificationLevel {
  if (score >= CLASSIFICATION_THRESHOLDS.CAREER_READY) return "CAREER_READY";
  if (score >= CLASSIFICATION_THRESHOLDS.READY_WITH_GAPS) return "READY_WITH_GAPS";
  if (score >= CLASSIFICATION_THRESHOLDS.DEVELOPING) return "DEVELOPING";
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