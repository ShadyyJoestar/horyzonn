import Link from "next/link";
import { Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassificationBadge } from "@/components/assessment/classification-badge";

export const metadata = { title: "Shared with me · Horyzon" };

/**
 * Inbox counselor: daftar assessment yang di-share ke counselor ini.
 * Sebelumnya fitur ini TIDAK ADA — counselor tidak punya cara untuk
 * menemukan assessment yang di-share selain membuka link token manual.
 */
export default async function CounselorSharedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shares } = await supabase
    .from("shared_assessments")
    .select(
      `id, token, message, created_at, expires_at, revoked_at,
       assessment_results!inner (
         id, readiness_score, classification, created_at,
         careers ( name ),
         profiles!assessment_results_user_id_fkey ( full_name, email )
       )`
    )
    .eq("counselor_id", user!.id)
    .order("created_at", { ascending: false });

  const active = (shares ?? []).filter(
    (s) => !s.revoked_at && (!s.expires_at || new Date(s.expires_at) > new Date())
  );
  const expired = (shares ?? []).filter((s) => !active.includes(s));

  const renderRow = (s: any, muted = false) => {
    const ar = s.assessment_results;
    return (
      <Link
        key={s.id}
        href={`/counselor/assessments/${ar.id}`}
        className={`block rounded-lg border border-border p-4 transition-colors hover:bg-muted/40 ${
          muted ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium truncate">
              {ar.profiles?.full_name || ar.profiles?.email || "Student"}
            </p>
            <p className="text-sm text-muted-foreground">
              {ar.careers?.name ?? "Career assessment"} · score {ar.readiness_score}/100
            </p>
            {s.message && (
              <p className="mt-2 text-sm italic text-muted-foreground border-l-2 border-border pl-3">
                “{s.message}”
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <ClassificationBadge classification={ar.classification} />
            <span className="text-xs text-muted-foreground">
              {new Date(s.created_at).toLocaleDateString("id-ID")}
            </span>
            {muted && <Badge variant="secondary">Expired / revoked</Badge>}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Inbox className="h-5 w-5" /> Shared with me
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Assessment yang dibagikan student langsung ke kamu. Klik untuk melihat
          detail, memberi catatan, dan menyusun development plan.
        </p>
      </div>

      {active.length === 0 && expired.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Belum ada assessment yang dibagikan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Student membagikan assessment lewat menu Share pada halaman assessment
            mereka — bisa lewat link umum atau langsung memasukkan email kamu.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">{active.map((s) => renderRow(s))}</div>
          {expired.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Riwayat kedaluwarsa</h3>
              {expired.map((s) => renderRow(s, true))}
            </div>
          )}
        </>
      )}
    </div>
  );
}