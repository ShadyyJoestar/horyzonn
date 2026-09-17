// src/app/(dashboard)/layout.tsx
// Layout ini dipakai bersama oleh /dashboard/* DAN /admin/*.
// Jadi di sini HANYA boleh ada auth guard (harus login).
// Guard "role harus admin" dipindah ke src/app/(dashboard)/admin/layout.tsx.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <>{children}</>;
}