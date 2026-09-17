// src/app/(dashboard)/admin/analytics/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const { data: assessments, error } = await supabase
    .from("assessments")
    .select("classification, readiness_score");

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

  const distribution = {
    EXPLORING: 0,
    DEVELOPING: 0,
    READY_WITH_GAPS: 0,
    CAREER_READY: 0,
  };

  let totalScore = 0;

  assessments?.forEach((a) => {
    if (a.classification in distribution) {
      distribution[a.classification as keyof typeof distribution]++;
    }
    totalScore += Number(a.readiness_score) || 0;
  });

  const total = assessments?.length || 0;
  const avgScore = total > 0 ? Math.round(totalScore / total) : 0;
  const mostCommon =
    Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <div className="space-y-6">
      <Header />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{total}</div>
            <p className="text-xs text-muted-foreground mt-1">All classification runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{avgScore}</div>
            <p className="text-xs text-muted-foreground mt-1">out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Common Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {mostCommon === "—" ? "—" : mostCommon.replaceAll("_", " ")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">by count</p>
          </CardContent>
        </Card>
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
                Distribution will appear after students run assessments.
              </p>
            </div>
          ) : (
            Object.entries(distribution).map(([level, count]) => {
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">
                      {level.replaceAll("_", " ")}
                    </span>
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
        Platform usage and classification distribution across all assessments.
      </p>
    </div>
  );
}