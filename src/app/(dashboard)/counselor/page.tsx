// src/app/(dashboard)/counselor/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCounselor } from "@/lib/counselor/guards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClassificationBadge } from "@/components/assessment/classification-badge";
import { Users, FileText, MessageSquare, BarChart3 } from "lucide-react";

type ShareRow = {
  id: string;
  user_id: string | null;
  assessment_id: string;
  message: string | null;
  created_at: string;
  expires_at: string | null;
  share_token: string | null;
  token: string | null;
};

type AssessmentRow = {
  id: string;
  readiness_score: number;
  classification: string;
  career_id: string;
  created_at: string;
};

export default async function CounselorDashboardPage() {
  const result = await requireCounselor();
  if (result.error || !result.ctx) redirect("/login");
  const { supabase, user } = result.ctx;

  // 1) Ambil shares — TANPA nested join (sering bikin PostgREST error)
  const { data: rawShares, error: sharesError } = await supabase
    .from("shared_assessments")
    .select(
      "id, user_id, assessment_id, message, created_at, expires_at, share_token, token"
    )
    .eq("counselor_id", user.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (sharesError) {
    console.error("[counselor] shared_assessments error:", sharesError.message);
  }

  const now = new Date();
  const shares = ((rawShares ?? []) as ShareRow[]).filter(
    (s) => !s.expires_at || new Date(s.expires_at) > now
  );

  // 2) Assessment results (batch)
  const assessmentIds = [
    ...new Set(shares.map((s) => s.assessment_id).filter(Boolean)),
  ];
  let assessments: AssessmentRow[] = [];
  let careerMap: Record<string, string> = {};

  if (assessmentIds.length > 0) {
    const { data: arData, error: arError } = await supabase
      .from("assessment_results")
      .select("id, readiness_score, classification, career_id, created_at")
      .in("id", assessmentIds);

    if (arError) {
      console.error("[counselor] assessment_results error:", arError.message);
    } else {
      assessments = (arData ?? []) as AssessmentRow[];
    }

    const careerIds = [
      ...new Set(assessments.map((a) => a.career_id).filter(Boolean)),
    ];
    if (careerIds.length > 0) {
      const { data: careers } = await supabase
        .from("careers")
        .select("id, name")
        .in("id", careerIds);
      for (const c of careers ?? []) {
        careerMap[c.id] = c.name;
      }
    }
  }

  const assessmentById = Object.fromEntries(
    assessments.map((a) => [a.id, a])
  );

  // 3) Student profiles
  const studentIds = [
    ...new Set(
      shares.map((s) => s.user_id).filter((id): id is string => Boolean(id))
    ),
  ];
  const { data: profiles } = studentIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", studentIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] };

  const nameOf = (id: string | null) => {
    if (!id) return "Student";
    const p = (profiles ?? []).find((x) => x.id === id);
    return p?.full_name || p?.email || "Student";
  };

  // 4) Notes count
  const { count: notesCount } = await supabase
    .from("counselor_notes")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id);

  const readinessList = shares
    .map((s) => assessmentById[s.assessment_id]?.readiness_score)
    .filter((v): v is number => typeof v === "number");
  const avgReadiness = readinessList.length
    ? Math.round(
        readinessList.reduce((a, b) => a + b, 0) / readinessList.length
      )
    : null;

  const stats = [
    { label: "Active shares", value: shares.length, icon: FileText },
    { label: "Students", value: studentIds.length, icon: Users },
    { label: "My notes", value: notesCount ?? 0, icon: MessageSquare },
    { label: "Avg readiness", value: avgReadiness ?? "—", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Assessment yang dibagikan siswa ke kamu. Klik untuk lihat detail, gap
          analysis, kasih catatan, dan susun development plan.
        </p>
      </div>

      {sharesError && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          Gagal memuat shares: {sharesError.message}. Cek RLS / schema{" "}
          <code className="text-xs">shared_assessments</code>.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shared assessments</CardTitle>
          <CardDescription>
            {shares.length
              ? "Klik Open untuk membuka detail assessment."
              : "Belum ada siswa yang share assessment ke kamu."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {shares.length === 0 && !sharesError && (
            <p className="text-sm text-muted-foreground">
              Share link dibuat siswa dari halaman assessment mereka dengan
              memasukkan email kamu.
            </p>
          )}
          {shares.map((s) => {
            const ar = assessmentById[s.assessment_id];
            const careerName = ar ? careerMap[ar.career_id] : null;
            const token = s.share_token || s.token || "";
            return (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium truncate">
                    {nameOf(s.user_id)}
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      → {careerName || "Assessment"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Shared {new Date(s.created_at).toLocaleDateString("en-US")}
                    {ar &&
                      ` · Readiness ${Math.round(Number(ar.readiness_score))}/100`}
                  </p>
                  {s.message && (
                    <p className="text-xs italic text-muted-foreground">
                      “{s.message}”
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {ar && (
                    <ClassificationBadge classification={ar.classification} />
                  )}
                  {token ? (
                    <Link
                      href={`/counselor/shared/${token}`}
                      className="inline-flex h-7 items-center rounded-lg border border-border px-2.5 text-[0.8rem] font-medium hover:bg-muted transition-colors"
                    >
                      Open
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No token
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}