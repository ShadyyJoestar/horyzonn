// src/app/(dashboard)/counselor/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCounselor } from "@/lib/counselor/guards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClassificationBadge } from "@/components/assessment/classification-badge";
import { Users, FileText, MessageSquare, BarChart3 } from "lucide-react";

type ShareRow = {
  id: string;
  user_id: string;
  message: string | null;
  created_at: string;
  expires_at: string | null;
  assessment_results:
    | {
        readiness_score: number;
        classification: string;
        created_at: string;
        careers: { name: string } | { name: string }[] | null;
      }
    | {
        readiness_score: number;
        classification: string;
        created_at: string;
        careers: { name: string }[] | null;
      }[]
    | null;
};

export default async function CounselorDashboardPage() {
  const { error, ctx } = await requireCounselor();
  if (error || !ctx) redirect("/login");
  const { supabase, user } = ctx;

  const { data: rawShares } = await supabase
    .from("shared_assessments")
    .select(
      "id, user_id, message, created_at, expires_at, assessment_results(readiness_score, classification, created_at, careers(name))"
    )
    .eq("counselor_id", user.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  const now = new Date();
  const shares = ((rawShares ?? []) as unknown as ShareRow[]).filter(
    (s) => !s.expires_at || new Date(s.expires_at) > now
  );

  const studentIds = [...new Set(shares.map((s) => s.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);

  const nameOf = (id: string) => {
    const p = (profiles ?? []).find((x) => x.id === id);
    return p?.full_name || p?.email || "Student";
  };

  const { count: notesCount } = await supabase
    .from("counselor_notes")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id);

  const readinessList = shares
    .map((s) => {
      const ar = Array.isArray(s.assessment_results)
        ? s.assessment_results[0]
        : s.assessment_results;
      return ar ? Number(ar.readiness_score) : null;
    })
    .filter((v): v is number => v != null);
  const avgReadiness = readinessList.length
    ? Math.round(readinessList.reduce((a, b) => a + b, 0) / readinessList.length)
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
              ? "Klik baris untuk membuka detail assessment."
              : "Belum ada siswa yang share assessment ke kamu."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {shares.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Share link dibuat siswa dari halaman assessment mereka dengan
              memasukkan email kamu.
            </p>
          )}
          {shares.map((s) => {
            const ar = Array.isArray(s.assessment_results)
              ? s.assessment_results[0]
              : s.assessment_results;
            const career = ar?.careers
              ? Array.isArray(ar.careers)
                ? ar.careers[0]
                : ar.careers
              : null;
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
                      → {career?.name || "Assessment"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Shared {new Date(s.created_at).toLocaleDateString("en-US")}
                    {ar && ` · Readiness ${Math.round(Number(ar.readiness_score))}/100`}
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
                  <Button
                    size="sm"
                    variant="outline"
                    render={
                      <Link
                        href={`/counselor/shared/${"token" in s ? (s as { token?: string }).token : ""}`}
                      />
                    }
                    nativeButton={false}
                  >
                    Open
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}