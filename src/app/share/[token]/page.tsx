// src/app/share/[token]/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassificationBadge } from "@/components/assessment/classification-badge";
import { ReadinessScore } from "@/components/assessment/readiness-score";
import { GapTable } from "@/components/assessment/gap-table";
import { ExplanationCard } from "@/components/assessment/explanation-card";
import { ActionPlanList } from "@/components/assessment/action-plan-list";
import { Compass } from "lucide-react";

interface GapRow {
  competency_name: string;
  current_level: number;
  required_level: number;
  weight: number;
  status: string;
  gap_size: number;
}

export default async function SharedAssessmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: share } = await supabase
    .from("shared_assessments")
    .select("assessment_id, expires_at")
    .eq("token", token)
    .is("revoked_at", null)
    .maybeSingle();

  if (!share) notFound();
  if (share.expires_at && new Date(share.expires_at) < new Date()) notFound();

  const { data: assessment } = await supabase
    .from("assessment_results")
    .select("*, careers(name)")
    .eq("id", share.assessment_id)
    .single();

  if (!assessment) notFound();

  const career = Array.isArray(assessment.careers)
    ? assessment.careers[0]
    : assessment.careers;

  const explanation = (assessment.explanation ?? {}) as {
    summary?: string;
    strongestAreas?: string[];
    mainGaps?: string[];
    contributingFactors?: string[];
    gaps?: GapRow[];
    actionPlan?: any[];
  };
  const gaps = Array.isArray(explanation.gaps) ? explanation.gaps : [];
  const actionPlan = Array.isArray(explanation.actionPlan)
    ? explanation.actionPlan
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            <span className="font-semibold">Horyzon</span>
            <Badge variant="secondary" className="ml-2">
              Shared assessment · read-only
            </Badge>
          </div>
          <Button size="sm" variant="outline" render={<Link href="/" />} nativeButton={false}>
            Build my own profile
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {(career as { name?: string } | null)?.name || "Assessment"}
            </h1>
            <ClassificationBadge classification={assessment.classification} />
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(assessment.created_at).toLocaleString("en-US")} · Profile
            completeness {assessment.profile_completeness}% · Confidence{" "}
            <Badge variant="secondary">{assessment.confidence}</Badge>
          </p>
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
          <div className="overflow-x-auto">
            <GapTable gaps={gaps} />
          </div>
        </div>

        <ActionPlanList items={actionPlan} />
      </main>
    </div>
  );
}