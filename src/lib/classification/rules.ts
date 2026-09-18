import type { SupabaseClient } from "@supabase/supabase-js";
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

/**
 * Studi kasus §20: threshold harus bisa diubah admin TANPA ubah code.
 * Baca dari tabel classification_rules (kolom name, value).
 * Fallback ke default kalau tabel kosong / error.
 */
export async function loadThresholdsFromDb(
  supabase: SupabaseClient
): Promise<Thresholds> {
  const fallback: Thresholds = { ...CLASSIFICATION_THRESHOLDS };
  try {
    const { data, error } = await supabase
      .from("classification_rules")
      .select("name, value");
    if (error || !data || data.length === 0) return fallback;

    const map = Object.fromEntries(data.map((r) => [r.name, Number(r.value)]));
    return {
      CAREER_READY: map.CAREER_READY ?? fallback.CAREER_READY,
      READY_WITH_GAPS: map.READY_WITH_GAPS ?? fallback.READY_WITH_GAPS,
      DEVELOPING: map.DEVELOPING ?? fallback.DEVELOPING,
    };
  } catch {
    return fallback;
  }
}