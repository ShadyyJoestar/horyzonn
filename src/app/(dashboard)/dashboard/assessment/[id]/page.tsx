import { createClient } from "@/lib/supabase/server";
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
import { ArrowLeft } from "lucide-react";

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

  const { data: assessment } = await supabase
    .from("assessments")
    .select("*, careers(id, name, slug)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!assessment) notFound();

  const { data: gaps } = await supabase
    .from("assessment_gaps")
    .select("*")
    .eq("assessment_id", id)
    .order("weight", { ascending: false });

  const career = Array.isArray(assessment.careers)
    ? assessment.careers[0]
    : assessment.careers;

  const explanation =
    typeof assessment.explanation === "object" && assessment.explanation
      ? assessment.explanation
      : {};

  const actionPlan = Array.isArray(assessment.action_plan)
    ? assessment.action_plan
    : [];

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
          {new Date(assessment.created_at).toLocaleString("en-US")} · Profile
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
        <GapTable gaps={gaps || []} />
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
            render={<Link href="/dashboard/careers" />}
            nativeButton={false}
          >
            Compare Other Careers
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}