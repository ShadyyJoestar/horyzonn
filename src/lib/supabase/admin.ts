// src/lib/supabase/admin.ts
//
// PERINGATAN: client ini pakai service_role key dan MELEWATI RLS sepenuhnya.
// - JANGAN pernah import file ini dari komponen "use client" atau kirim
//   apapun dari sini ke browser tanpa filter/transform.
// - HANYA dipanggil dari server component / route handler yang sudah
//   memverifikasi sendiri bahwa user yang login adalah admin
//   (mis. setelah lolos guard di src/app/(dashboard)/admin/layout.tsx).
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}