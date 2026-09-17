import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClassificationBadge } from "@/components/assessment/classification-badge";
import { ProgressChart } from "@/components/assessment/progress-chart";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // FIX: tabel asli = assessment_results
  const { data: assessments } = await supabase
    .from("assessment_results")
    .select(
      "id, readiness_score, classification, confidence, profile_completeness, created_at, career_id, careers(name, slug)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const list = assessments || [];

  const byCareer = new Map<
    string,
    {
      careerName: string;
      careerSlug: string;
      items: typeof list;
    }
  >();

  for (const a of list) {
    const career = Array.isArray(a.careers) ? a.careers[0] : a.careers;
    const name = (career as { name?: string } | null)?.name || "Unknown career";
    const slug = (career as { slug?: string } | null)?.slug || "";
    const key = a.career_id as string;

    if (!byCareer.has(key)) {
      byCareer.set(key, { careerName: name, careerSlug: slug, items: [] });
    }
    byCareer.get(key)!.items.push(a);
  }

  const latest = list.length ? list[list.length - 1] : null;
  const previous = list.length > 1 ? list[list.length - 2] : null;

  let delta: number | null = null;
  if (latest && previous) {
    delta = latest.readiness_score - previous.readiness_score;
  }

  const chartData = list.map((a) => {
    const career = Array.isArray(a.careers) ? a.careers[0] : a.careers;
    const name = (career as { name?: string } | null)?.name || "Career";
    return {
      date: new Date(a.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: new Date(a.created_at).toLocaleString("en-US"),
      score: a.readiness_score,
      label: name,
      classification: a.classification,
    };
  });

  const completeness = latest?.profile_completeness ?? 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Progress</h2>
          <p className="text-muted-foreground mt-1">
            See how your readiness score and classification change after each
            reassessment.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/assessment" />}
            nativeButton={false}
          >
            History
          </Button>
          <Button
            size="sm"
            render={<Link href="/dashboard/careers" />}
            nativeButton={false}
          >
            New Assessment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total assessments</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{list.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Across {byCareer.size} career{byCareer.size === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest readiness</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {latest ? latest.readiness_score : "—"}
              {latest && (
                <span className="text-base font-normal text-muted-foreground">
                  /100
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {latest ? (
              <ClassificationBadge classification={latest.classification} />
            ) : (
              <span className="text-xs text-muted-foreground">No data yet</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Change vs previous</CardDescription>
            <CardTitle className="text-3xl tabular-nums flex items-center gap-2">
              {delta === null ? (
                "—"
              ) : delta > 0 ? (
                <>
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                  <span className="text-emerald-600">+{delta}</span>
                </>
              ) : delta < 0 ? (
                <>
                  <TrendingDown className="h-6 w-6 text-red-500" />
                  <span className="text-red-600">{delta}</span>
                </>
              ) : (
                <>
                  <Minus className="h-6 w-6 text-muted-foreground" />
                  <span>0</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Compared to your previous assessment (any career)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Profile completeness</CardTitle>
            <span className="text-sm font-medium tabular-nums">
              {completeness}%
            </span>
          </div>
          <CardDescription>
            Higher completeness improves confidence of classifications. This is
            not a probability of career success.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={completeness} className="h-2" />
          {completeness < 80 && (
            <Button
              size="sm"
              variant="outline"
              render={<Link href="/dashboard/profile" />}
              nativeButton={false}
            >
              Improve profile
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Readiness over time</CardTitle>
          <CardDescription>
            Each point is one assessment. Improve skills, reassess, and watch the
            trend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length < 1 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No assessments yet. Run your first classification from the{" "}
              <Link href="/dashboard/careers" className="underline font-medium">
                career library
              </Link>
              .
            </p>
          ) : chartData.length === 1 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Only one assessment so far (score {chartData[0].score}). Update
              your skills and reassess to see a trend line.
            </p>
          ) : (
            <ProgressChart data={chartData} />
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Progress by career</h3>
          <p className="text-sm text-muted-foreground">
            First vs latest score for each target you assessed.
          </p>
        </div>

        {byCareer.size === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No career progress yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...byCareer.entries()].map(([careerId, group]) => {
              const first = group.items[0];
              const last = group.items[group.items.length - 1];
              const change = last.readiness_score - first.readiness_score;

              return (
                <Card key={careerId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{group.careerName}</CardTitle>
                    <CardDescription>
                      {group.items.length} assessment
                      {group.items.length === 1 ? "" : "s"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">First</p>
                        <p className="text-lg font-semibold tabular-nums">
                          {first.readiness_score}
                        </p>
                      </div>
                      <div className="text-muted-foreground text-sm">→</div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Latest</p>
                        <p className="text-lg font-semibold tabular-nums">
                          {last.readiness_score}
                        </p>
                      </div>
                      <div className="text-right min-w-[3rem]">
                        <p className="text-xs text-muted-foreground">Delta</p>
                        <p
                          className={`text-lg font-semibold tabular-nums ${
                            change > 0
                              ? "text-emerald-600"
                              : change < 0
                                ? "text-red-600"
                                : ""
                          }`}
                        >
                          {change > 0 ? `+${change}` : change}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <ClassificationBadge classification={last.classification} />
                      <Button
                        size="sm"
                        variant="ghost"
                        render={
                          <Link href={`/dashboard/assessment/${last.id}`} />
                        }
                        nativeButton={false}
                      >
                        View latest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Recent activity</h3>
          <p className="text-sm text-muted-foreground">
            Newest assessments first.
          </p>
        </div>

        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {[...list].reverse().slice(0, 10).map((a) => {
              const career = Array.isArray(a.careers) ? a.careers[0] : a.careers;
              const name =
                (career as { name?: string } | null)?.name || "Career";

              return (
                <Link
                  key={a.id}
                  href={`/dashboard/assessment/${a.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 hover:border-foreground/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString("en-US")} ·
                      Confidence {a.confidence}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums">
                      {a.readiness_score}
                      <span className="text-muted-foreground font-normal text-sm">
                        /100
                      </span>
                    </span>
                    <ClassificationBadge classification={a.classification} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}