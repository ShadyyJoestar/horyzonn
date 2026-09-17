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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RunAcademicButton } from "@/components/assessment/run-academic-button";
import { ArrowLeft } from "lucide-react";

const typeLabel: Record<string, string> = {
  TECHNICAL_ORIENTED: "Technical-Oriented",
  CREATIVE_ORIENTED: "Creative-Oriented",
  ANALYTICAL_ORIENTED: "Analytical-Oriented",
  COMMUNICATION_ORIENTED: "Communication-Oriented",
  MULTIDISCIPLINARY: "Multidisciplinary",
};

export default async function AcademicResultPage({
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

  const { data: row } = await supabase
    .from("academic_classifications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!row) notFound();

  const scores = row.scores || {};
  const explanation = row.explanation || {};
  const recommendations = Array.isArray(row.recommendations)
    ? row.recommendations
    : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/dashboard/academic" />}
          nativeButton={false}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Academic
        </Button>
        <RunAcademicButton label="Reclassify" />
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {typeLabel[row.profile_type] || row.profile_type}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(row.created_at).toLocaleString("en-US")} · Confidence{" "}
          <Badge variant="secondary">{row.confidence}</Badge> · Completeness{" "}
          {row.profile_completeness}%
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Classification is derived from your data. It does not decide your major
          for you — it shows how your current profile aligns with different paths.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orientation scores</CardTitle>
          <CardDescription>
            Relative strength across four orientation dimensions (0–100).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["technical", "creative", "analytical", "communication"] as const).map(
            (key) => {
              const value = Number(scores[key] ?? 0);
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{key}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {value}
                    </span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              );
            }
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Why this classification?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="leading-relaxed">{explanation.summary}</p>
          {explanation.strongestSignals?.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {explanation.strongestSignals.map((s: string) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
          {explanation.notes?.length > 0 && (
            <div className="text-amber-600 space-y-1">
              {explanation.notes.map((n: string) => (
                <p key={n}>{n}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-base font-semibold">Education path compatibility</h3>
        <p className="text-sm text-muted-foreground">
          Ranked by alignment with your orientation profile — with factors, not
          just a number.
        </p>
        <div className="space-y-3">
          {recommendations.map(
            (r: {
              id: string;
              name: string;
              compatibility: number;
              level: string;
              factors: string[];
              description: string;
            }) => (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{r.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">
                        {r.compatibility}%
                      </span>
                      <Badge
                        variant={
                          r.level === "HIGH"
                            ? "default"
                            : r.level === "MEDIUM"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {r.level}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{r.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={r.compatibility} className="h-1.5 mb-3" />
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                    {(r.factors || []).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next steps</CardTitle>
          <CardDescription>
            Strengthen weak orientation areas in your profile, then reclassify.
            You can also run a career readiness assessment for a specific job target.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/profile" />}
            nativeButton={false}
          >
            Update profile
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/careers" />}
            nativeButton={false}
          >
            Explore careers
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}