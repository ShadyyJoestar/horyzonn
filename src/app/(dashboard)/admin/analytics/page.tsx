import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // Classification distribution
  const { data: assessments } = await supabase
    .from("assessments")
    .select("classification, readiness_score");

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Platform usage and classification distribution.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Common Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classification Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(distribution).map(([level, count]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={level}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{level.replaceAll("_", " ")}</span>
                  <span className="text-muted-foreground">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}