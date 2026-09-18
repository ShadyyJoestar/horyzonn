// src/app/(dashboard)/counselor/assessments/[id]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  counselorHasAccess,
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
import { ReadinessScore } from "@/components/assessment/readiness-score";
import { GapTable } from "@/components/assessment/gap-table";
import { ExplanationCard } from "@/components/assessment/explanation-card";
import { ActionPlanList } from "@/components/assessment/action-plan-list";
import { CounselorNotes } from "@/components/counselor/counselor-notes";
import { DevelopmentPlanManager } from "@/components/counselor/development-plan-manager";
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

export default async function CounselorAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { error, ctx } = await requireCounselor();
  if (error || !ctx) redirect("/login");
  const { supabase, user } = ctx;

  const allowed = await counselorHasAccess(supabase, id, user.id);
  if (!allowed) notFound();

  const { data: assessment } = await supabase
    .from("assessment_results")
    .select("*, careers(id, name, slug)")
    .eq("id", id)
    .single();
  if (!assessment) notFound();

  const studentOk = await counselorHasStudentAccess(
    supabase,
    assessment.user_id,
    user.id
  );
  if (!studentOk) notFound();

  const [
    { data: studentProfile },
    { data: shares },
    { data: notes },
    { data: planItems },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", assessment.user_id)
      .maybeSingle(),
    supabase
      .from("shared_assessments")
      .select("token, message, created_at")
      .eq("assessment_id", id)
      .eq("counselor_id", user.id)
      .is("revoked_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("counselor_notes")
      .select("id, author_id, author_name, note, created_at")
      .eq("assessment_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("development_plan_items")
      .select("*")
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

  const share = shares?.[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/counselor"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to overview
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            {(career as { name?: string } | null)?.name || "Assessment"}
          </h2>
          <ClassificationBadge classification={assessment.classification} />
        </div>
        <p className="text-sm text-muted-foreground">
          {studentProfile?.full_name || studentProfile?.email || "Student"} ·{" "}
          {new Date(assessment.created_at).toLocaleString("en-US")} · Profile
          completeness {assessment.profile_completeness}% · Confidence{" "}
          <Badge variant="secondary">{assessment.confidence}</Badge>
        </p>
        {share?.message && (
          <p className="text-sm italic text-muted-foreground">
            “{share.message}”
          </p>
        )}
        <p className="text-xs text-muted-foreground italic">
          Classification is decision support based on the data provided — not a
          prediction of career success.
        </p>
      </div>

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
        <h3 className="text-base font-semibold">Competency Gap Analysis</h3>
        <GapTable gaps={gaps} />
      </div>

      <ActionPlanList items={actionPlan} />

      <DevelopmentPlanManager
        assessmentId={assessment.id}
        items={(planItems ?? []).map((i) => ({
          id: i.id,
          competency_name: i.competency_name,
          current_level: i.current_level,
          target_level: i.target_level,
          action: i.action,
          status: i.status,
          due_date: i.due_date,
        }))}
      />

      <CounselorNotes
        assessmentId={assessment.id}
        currentUserId={user.id}
        notes={(notes ?? []).map((n) => ({
          id: n.id,
          author_id: n.author_id,
          author_name: n.author_name,
          note: n.note,
          created_at: n.created_at,
        }))}
      />
    </div>
  );
}