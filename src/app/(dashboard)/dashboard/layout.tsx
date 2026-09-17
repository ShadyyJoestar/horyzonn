// src/app/(dashboard)/dashboard/layout.tsx
// Chrome (sidebar + header) khusus area student /dashboard/*.
// Tidak ada pengecekan role di sini: admin pun boleh membuka /dashboard.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, primary_focus")
    .eq("id", user.id)
    .maybeSingle();

  // Fallback kalau baris profiles belum ada / RLS menolak.
  // Tanpa fallback, halaman bisa kelihatan kosong padahal user valid.
  const safeProfile = profile ?? {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string) ?? null,
    email: user.email ?? null,
    role: "student",
    primary_focus: null,
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar profile={safeProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header profile={safeProfile} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}