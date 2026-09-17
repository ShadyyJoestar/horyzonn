// src/lib/auth/landing.ts
// Satu sumber kebenaran untuk "habis login, user ini mendarat di mana".
// Dipakai oleh login form, middleware, dan auth callback supaya tidak ada
// lagi tiga tempat yang hardcode "/dashboard".
import type { SupabaseClient } from "@supabase/supabase-js";

export const ADMIN_LANDING = "/admin";
export const STUDENT_LANDING = "/dashboard";

export function landingPathForRole(role: string | null | undefined): string {
  return role === "admin" ? ADMIN_LANDING : STUDENT_LANDING;
}

/**
 * Ambil role dari tabel profiles lalu kembalikan path tujuan.
 * Kalau query gagal (RLS, baris belum ada, dsb) jatuh ke dashboard student,
 * karena itu tujuan yang paling aman untuk siapa pun.
 */
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