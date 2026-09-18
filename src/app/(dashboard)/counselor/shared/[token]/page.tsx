// src/app/(dashboard)/counselor/shared/[token]/page.tsx
// Siswa kirim link /share/<token> ke counselor → route ini "mengklaim" link
// dan mengarahkan ke workspace counselor kalau memang diarahkan ke dia.
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CounselorSharedRedirectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: share } = await supabase
    .from("shared_assessments")
    .select("assessment_id, counselor_id, expires_at, revoked_at")
    .eq("token", token)
    .maybeSingle();

  if (!share || share.revoked_at) notFound();
  if (share.expires_at && new Date(share.expires_at) < new Date()) notFound();

  // Link privat yang diarahkan ke counselor ini → buka di workspace
  if (user && share.counselor_id === user.id) {
    redirect(`/counselor/assessments/${share.assessment_id}`);
  }

  // Link privat milik counselor lain → 404 (privacy)
  if (share.counselor_id) notFound();

  // Link publik → tampilan read-only standar
  redirect(`/share/${token}`);
}