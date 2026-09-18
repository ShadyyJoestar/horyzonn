// src/app/(dashboard)/dashboard/assessment/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClassificationBadge } from "@/components/assessment/classification-badge";
import { ReadinessScore } from "@/components/assessment/readiness-score";
import { GapTable } from "@/components/assessment/gap-table";
import { ExplanationCard } from "@/components/assessment/explanation-card";
import { ActionPlanList } from "@/components/assessment/action-plan-list";
import { RunAssessmentButton } from "@/components/assessment/run-assessment-button";
import { ShareButton } from "@/components/assessment/share-button";
import { FeedbackForm } from "@/components/assessment/feedback-form";
import { ArrowLeft } from "lucide-react";

interface GapRow {
  competency_name: string;
  current_level: number;
  required_level: number;
  weight: number;
  status: string;
  gap_size: number;
}

interface ActionItem {
  priority: number;
  competencyName: string;
  currentLevel: number;
  targetLevel: number;
  suggestedAction: string;
}

interface ExplanationJson {
  summary?: string;
  strongestAreas?: string[];
  mainGaps?: string[];
  contributingFactors?: string[];
  gaps?: GapRow[];
  actionPlan?: ActionItem[];
}

export default async function AssessmentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: assessment }, { data: share }, { data: existingFeedback }] =
    await Promise.all([
      supabase
        .from("assessment_results")
        .select("*, careers(id, name, slug)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("shared_assessments")
        .select("token")
        .eq("assessment_id", id)
        .is("revoked_at", null)
        .maybeSingle(),
      supabase
        .from("feedbacks")
        .select("id")
        .eq("assessment_id", id)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (!assessment) notFound();

  // Admin: RLS counselor_notes / plan biasanya cuma counselor yang bisa baca
  const admin = createAdminClient();
  const [{ data: notes }, { data: planItems }] = await Promise.all([
    admin
      .from("counselor_notes")
      .select("id, author_name, note, created_at")
      .eq("assessment_id", id)
      .order("created_at", { ascending: true }),
    admin
      .from("development_plan_items")
      .select(
        "id, competency_name, current_level, target_level, action, status, due_date"
      )
      .eq("assessment_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  const career = Array.isArray(assessment.careers)
    ? assessment.careers[0]
    : assessment.careers;

  const explanation = (assessment.explanation ?? {}) as ExplanationJson;
  const gaps = Array.isArray(explanation.gaps) ? explanation.gaps : [];
  const actionPlan = Array.isArray(explanation.actionPlan)
    ? explanation.actionPlan
    : [];

  const hasCounselorFeedback =
    (notes?.length ?? 0) > 0 || (planItems?.length ?? 0) > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/dashboard/assessment" />}
          nativeButton={false}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          History
        </Button>
        <div className="flex items-center gap-2">
          <ShareButton
            assessmentId={assessment.id}
            existingToken={share?.token ?? null}
          />
          {(career as { id?: string } | null)?.id && (
            <RunAssessmentButton
              careerId={(career as { id: string }).id}
              label="Reassess"
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            {(career as { name?: string } | null)?.name || "Assessment"}
          </h2>
          <ClassificationBadge classification={assessment.classification} />
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date(assessment.created_at).toLocaleString("id-ID")} · Profile
          completeness {assessment.profile_completeness}% · Confidence{" "}
          <Badge variant="secondary">{assessment.confidence}</Badge>
        </p>
        {assessment.profile_completeness < 50 && (
          <p className="text-sm text-amber-600">
            Limited data — complete your{" "}
            <Link href="/dashboard/profile" className="underline font-medium">
              profile
            </Link>{" "}
            for higher confidence. Classification is not a prediction of success.
          </p>
        )}
      </div>

      {/* Jawaban / catatan counselor untuk share assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Counselor feedback</CardTitle>
          <CardDescription>
            Catatan dan development plan dari counselor setelah kamu share
            assessment ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasCounselorFeedback ? (
            <p className="text-sm text-muted-foreground">
              Belum ada feedback. Share assessment ke counselor, lalu cek
              halaman ini lagi.
            </p>
          ) : (
            <>
              {(notes ?? []).length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Catatan
                  </p>
                  {(notes ?? []).map((n) => (
                    <div
                      key={n.id}
                      className="rounded-lg bg-muted/50 p-3 text-sm space-y-1"
                    >
                      <p className="text-xs text-muted-foreground">
                        {n.author_name || "Counselor"} ·{" "}
                        {new Date(n.created_at).toLocaleString("id-ID")}
                      </p>
                      <p className="whitespace-pre-wrap">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}

              {(planItems ?? []).length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Development plan
                  </p>
                  <ul className="space-y-2">
                    {(planItems ?? []).map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border p-3 text-sm space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{item.competency_name}</p>
                          <Badge variant="secondary" className="capitalize">
                            {String(item.status).replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          Level {item.current_level} → {item.target_level}
                          {item.due_date
                            ? ` · due ${new Date(item.due_date).toLocaleDateString("id-ID")}`
                            : ""}
                        </p>
                        <p className="whitespace-pre-wrap">{item.action}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Readiness Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadinessScore
            score={assessment.readiness_score}
            classification={assessment.classification}
          />
        </CardContent>
      </Card>

      <ExplanationCard explanation={explanation} />

      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">Competency Gap Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Current level vs required level for this career.
          </p>
        </div>
        <div className="overflow-x-auto">
          <GapTable gaps={gaps} />
        </div>
      </div>

      <ActionPlanList items={actionPlan} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What next?</CardTitle>
          <CardDescription>
            Improve a skill in your profile, then reassess to see progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/profile" />}
            nativeButton={false}
          >
            Update Skills
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/careers/compare" />}
            nativeButton={false}
          >
            Compare Careers
          </Button>
        </CardContent>
      </Card>

      {!existingFeedback && <FeedbackForm assessmentId={assessment.id} />}
    </div>
  );
}