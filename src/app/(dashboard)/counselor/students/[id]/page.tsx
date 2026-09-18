// src/app/(dashboard)/counselor/students/[id]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  counselorHasStudentAccess,
  requireCounselor,
} from "@/lib/counselor/guards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassificationBadge } from "@/components/assessment/classification-badge";
import { ArrowLeft } from "lucide-react";

const SUBJECTS = [
  ["mathematics", "Mathematics"],
  ["english", "English"],
  ["science", "Science"],
  ["indonesian", "Indonesian"],
  ["social_studies", "Social Studies"],
  ["vocational", "Vocational"],
] as const;

export default async function CounselorStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { error, ctx } = await requireCounselor();
  if (error || !ctx) redirect("/login");
  const { supabase, user } = ctx;

  const allowed = await counselorHasStudentAccess(supabase, id, user.id);
  if (!allowed) notFound();

  const [
    { data: profile },
    { data: academic },
    { data: competencies },
    { data: experiences },
    { data: interests },
    { data: shares },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("academic_records").select("*").eq("user_id", id).maybeSingle(),
    supabase
      .from("user_competencies")
      .select("level, evidence, competencies(name)")
      .eq("user_id", id),
    supabase
      .from("experiences")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("user_interests").select("interest").eq("user_id", id),
    supabase
      .from("shared_assessments")
      .select(
        "token, created_at, assessment_results(id, readiness_score, classification, created_at, careers(name))"
      )
      .eq("user_id", id)
      .eq("counselor_id", user.id)
      .is("revoked_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/counselor/students"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Students
      </Link>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {profile.full_name || "Student"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {profile.email}
          {profile.primary_focus ? ` · Focus: ${profile.primary_focus}` : ""}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Academic records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!academic ? (
              <p className="text-sm text-muted-foreground">Belum diisi.</p>
            ) : (
              SUBJECTS.map(([key, label]) =>
                academic[key] != null ? (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{label}</span>
                    <span className="font-medium tabular-nums">
                      {academic[key]}
                    </span>
                  </div>
                ) : null
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Competencies</CardTitle>
            <CardDescription>Self-rated, with evidence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!competencies?.length ? (
              <p className="text-sm text-muted-foreground">Belum diisi.</p>
            ) : (
              competencies.map((c, i) => {
                const comp = Array.isArray(c.competencies)
                  ? c.competencies[0]
                  : c.competencies;
                return (
                  <div key={i} className="space-y-0.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {(comp as { name?: string } | null)?.name || "—"}
                      </span>
                      <Badge variant="secondary">Lv {c.level}</Badge>
                    </div>
                    {c.evidence && (
                      <p className="text-xs text-muted-foreground">
                        {c.evidence}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Experiences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!experiences?.length ? (
              <p className="text-sm text-muted-foreground">Belum ada.</p>
            ) : (
              experiences.map((e) => (
                <div key={e.id} className="text-sm">
                  <span className="font-medium">{e.title}</span>{" "}
                  <Badge variant="outline">{e.type}</Badge>
                  {e.description && (
                    <p className="text-xs text-muted-foreground">
                      {e.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interests</CardTitle>
          </CardHeader>
          <CardContent>
            {!interests?.length ? (
              <p className="text-sm text-muted-foreground">Belum diisi.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {interests.map((i, idx) => (
                  <Badge key={idx} variant="secondary">
                    {i.interest}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shared assessments</CardTitle>
          <CardDescription>
            History assessment yang dibagikan siswa ini ke kamu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {!shares?.length && (
            <p className="text-sm text-muted-foreground">Tidak ada.</p>
          )}
          {shares?.map((s) => {
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
                key={s.token}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {career?.name || "Assessment"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ar &&
                      `${new Date(ar.created_at).toLocaleDateString("en-US")} · Readiness ${Math.round(
                        Number(ar.readiness_score)
                      )}/100`}
                  </p>
                </div>
                <ClassificationBadge
                  classification={ar?.classification ?? "EXPLORING"}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}