// src/lib/auth/landing.ts
// Satu sumber kebenaran untuk "habis login, user ini mendarat di mana".
import type { SupabaseClient } from "@supabase/supabase-js";

export const ADMIN_LANDING = "/admin";
export const COUNSELOR_LANDING = "/counselor";
export const STUDENT_LANDING = "/dashboard";

export function landingPathForRole(role: string | null | undefined): string {
  if (role === "admin") return ADMIN_LANDING;
  if (role === "counselor" || role === "mentor") return COUNSELOR_LANDING;
  return STUDENT_LANDING;
}

export async function resolveLandingPath(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return landingPathForRole(data?.role);
} 