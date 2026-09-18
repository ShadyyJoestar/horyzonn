// src/app/(dashboard)/counselor/assessments/[id]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireCounselor,
  counselorHasAccess,
} from "@/lib/counselor/guards";
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

export const metadata = {
  title: "Shared assessment · Horyzon",
};

export default async function CounselorAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { error, ctx } = await requireCounselor();
  if (error || !ctx) redirect("/login");

  const allowed = await counselorHasAccess(ctx.supabase, id, ctx.user.id);
  if (!allowed) notFound();

  const admin = createAdminClient();

  const [
    { data: assessment },
    { data: notes },
    { data: planItems },
  ] = await Promise.all([
    admin
      .from("assessment_results")
      .select("*, careers(id, name, slug)")
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("counselor_notes")
      .select("id, author_id, author_name, note, created_at")
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

  if (!assessment) notFound();

  const { data: student } = await admin
    .from("profiles")
    .select("id, full_name, email, primary_focus")
    .eq("id", assessment.user_id)
    .maybeSingle();

  const career = Array.isArray(assessment.careers)
    ? assessment.careers[0]
    : assessment.careers;

  const explanation = (assessment.explanation ?? {}) as ExplanationJson;
  const gaps = Array.isArray(explanation.gaps) ? explanation.gaps : [];
  const actionPlan = Array.isArray(explanation.actionPlan)
    ? explanation.actionPlan
    : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link href="/counselor/shared" />}
        nativeButton={false}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Shared with me
      </Button>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {student?.full_name || student?.email || "Student"}
          {student?.primary_focus ? ` · ${student.primary_focus}` : ""}
        </p>
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
        {student?.id && (
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/counselor/students/${student.id}`} />}
            nativeButton={false}
          >
            Open student profile
          </Button>
        )}
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

      <CounselorNotes
        assessmentId={assessment.id}
        currentUserId={ctx.user.id}
        notes={notes ?? []}
      />

      <DevelopmentPlanManager
        assessmentId={assessment.id}
        items={planItems ?? []}
      />
    </div>
  );
}