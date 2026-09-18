import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const supabase = createAdminClient();

  const [
    { data: assessments, error },
    { count: usersCount },
    { count: careersCount },
  ] = await Promise.all([
    supabase
      .from("assessment_results")
      .select("classification, readiness_score, confidence, created_at, career_id"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("careers").select("*", { count: "exact", head: true }),
  ]);

  if (error) {
    return (
      <div className="space-y-6">
        <Header />
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            Failed to load analytics: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  const distribution: Record<string, number> = {
    EXPLORING: 0,
    DEVELOPING: 0,
    READY_WITH_GAPS: 0,
    CAREER_READY: 0,
  };

  let totalScore = 0;
  let totalConfidence = 0;

  assessments?.forEach((a) => {
    const key = a.classification as string;
    if (key in distribution) distribution[key] += 1;
    totalScore += Number(a.readiness_score) || 0;
    totalConfidence += Number(a.confidence) || 0;
  });

  const total = assessments?.length || 0;
  const avgScore = total > 0 ? Math.round(totalScore / total) : 0;
  const avgConfidence = total > 0 ? Math.round(totalConfidence / total) : 0;
  const mostCommon =
    Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  // assessments 7 hari terakhir
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCount =
    assessments?.filter((a) =>
      a.created_at ? new Date(a.created_at).getTime() >= weekAgo : false
    ).length ?? 0;

  return (
    <div className="space-y-6">
      <Header />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Assessments" value={total} hint="All runs" />
        <StatCard title="Avg Readiness" value={avgScore} hint="out of 100" />
        <StatCard title="Avg Confidence" value={avgConfidence} hint="model confidence" />
        <StatCard title="Last 7 days" value={recentCount} hint="new assessments" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Users" value={usersCount ?? 0} hint="profiles" />
        <StatCard title="Careers" value={careersCount ?? 0} hint="in library" />
        <StatCard
          title="Most common level"
          value={mostCommon === "—" ? "—" : mostCommon.replaceAll("_", " ")}
          hint="by count"
          largeText
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Classification distribution</CardTitle>
          <Badge variant="outline">{total} records</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No assessment data yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Distribution appears after students run assessments.
              </p>
            </div>
          ) : (
            Object.entries(distribution).map(([level, count]) => {
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{level.replaceAll("_", " ")}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
      <p className="text-muted-foreground mt-1">
        Platform usage and classification distribution.
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  largeText,
}: {
  title: string;
  value: string | number;
  hint: string;
  largeText?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={
            largeText
              ? "text-lg font-bold"
              : "text-3xl font-bold tabular-nums"
          }
        >
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      </CardContent>
    </Card>
  );
}