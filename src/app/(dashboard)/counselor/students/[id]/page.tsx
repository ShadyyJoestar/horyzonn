// src/app/(dashboard)/counselor/students/[id]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  // Bypass RLS untuk baca data student
  const admin = createAdminClient();

  const [
    { data: profile },
    { data: academic },
    { data: competencies },
    { data: experiences },
    { data: interests },
    { data: shares },
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).maybeSingle(),
    admin.from("academic_records").select("*").eq("user_id", id).maybeSingle(),
    admin
      .from("user_competencies")
      .select("level, evidence, competencies(name)")
      .eq("user_id", id),
    admin
      .from("experiences")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    admin.from("user_interests").select("interest").eq("user_id", id),
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
            <CardTitle className="text-base">Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(competencies ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum diisi.</p>
            ) : (
              (competencies ?? []).map((c: any, i: number) => {
                const comp = Array.isArray(c.competencies)
                  ? c.competencies[0]
                  : c.competencies;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{comp?.name ?? "Skill"}</span>
                    <Badge variant="secondary">Lv {c.level}</Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experiences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(experiences ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum diisi.</p>
          ) : (
            (experiences ?? []).map((e: any) => (
              <div key={e.id} className="text-sm border-b last:border-0 pb-2">
                <p className="font-medium">
                  {e.title || e.role || "Experience"}
                </p>
                {e.organization && (
                  <p className="text-muted-foreground">{e.organization}</p>
                )}
                {e.description && (
                  <p className="mt-1 text-muted-foreground">{e.description}</p>
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
          {(interests ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum diisi.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(interests ?? []).map((i: any, idx: number) => (
                <Badge key={idx} variant="outline">
                  {i.interest}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shared assessments</CardTitle>
          <CardDescription>
            Assessment yang di-share ke kamu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(shares ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada assessment yang di-share ke kamu.
            </p>
          ) : (
            (shares ?? []).map((s: any, idx: number) => {
              const ar = Array.isArray(s.assessment_results)
                ? s.assessment_results[0]
                : s.assessment_results;
              if (!ar) return null;
              const career = Array.isArray(ar.careers)
                ? ar.careers[0]
                : ar.careers;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm border-b last:border-0 py-2"
                >
                  <div>
                    <p className="font-medium">
                      {career?.name ?? "Career"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ar.classification} · {ar.readiness_score}
                    </p>
                  </div>
                  <Link
                    href={`/counselor/assessments/${ar.id}`}
                    className="text-sm underline"
                  >
                    View
                  </Link>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}