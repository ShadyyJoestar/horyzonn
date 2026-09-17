// src/app/(dashboard)/dashboard/academic/page.tsx
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RunAcademicButton } from "@/components/assessment/run-academic-button";
import { ArrowRight } from "lucide-react";

const PROFILE_LABEL: Record<string, string> = {
  TECHNICAL_ORIENTED: "Technical-Oriented",
  CREATIVE_ORIENTED: "Creative-Oriented",
  ANALYTICAL_ORIENTED: "Analytical-Oriented",
  COMMUNICATION_ORIENTED: "Communication-Oriented",
  MULTIDISCIPLINARY: "Multidisciplinary",
};

export default async function AcademicPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: latest }, { data: history }] = await Promise.all([
    supabase
      .from("academic_classifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("academic_classifications")
      .select("id, profile_type, confidence, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const scores = (latest?.scores ?? {}) as Record<string, number>;
  const recommendations = Array.isArray(latest?.recommendations)
    ? latest.recommendations
    : [];
  const explanation = (latest?.explanation ?? {}) as {
    summary?: string;
    strongestSignals?: string[];
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Academic Path
          </h2>
          <p className="text-muted-foreground mt-1">
            Understand your academic profile and explore compatible education
            paths.
          </p>
        </div>
        <RunAcademicButton />
      </div>

      {!latest ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No classification yet</CardTitle>
            <CardDescription>
              Complete your{" "}
              <Link href="/dashboard/profile" className="underline font-medium">
                profile
              </Link>{" "}
              (academic data, skills, interests, experiences) then run the
              academic classification.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  Your Academic Profile
                </CardTitle>
                <Badge variant="secondary">
                  {PROFILE_LABEL[latest.profile_type] || latest.profile_type}
                </Badge>
              </div>
              <CardDescription>
                {latest.created_at
                  ? new Date(latest.created_at).toLocaleString("en-US")
                  : ""}{" "}
                · Confidence {latest.confidence} · Completeness{" "}
                {latest.profile_completeness}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {explanation.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {explanation.summary}
                </p>
              )}

              {/* Orientation score bars */}
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(scores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize">{key}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {value}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-foreground transition-all"
                        style={{ width: `${Math.min(100, value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">
              Compatible Education Paths
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {recommendations.slice(0, 4).map((r: any) => (
                <Card key={r.id || r.slug}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm">{r.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={
                          r.level === "HIGH"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : r.level === "MEDIUM"
                              ? "bg-amber-500/15 text-amber-700"
                              : ""
                        }
                      >
                        {r.compatibility}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {(r.factors || []).slice(0, 3).map((f: string, i: number) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">
              Compatibility explains contributing factors — it is not a
              prediction of success.
            </p>
          </div>

          {/* History */}
          {(history?.length ?? 0) > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Classification History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {history!.map((h) => (
                  <Link
                    key={h.id}
                    href={`/dashboard/academic/${h.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:border-foreground/30 transition-colors"
                  >
                    <span className="font-medium">
                      {PROFILE_LABEL[h.profile_type] || h.profile_type}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {new Date(h.created_at).toLocaleDateString("en-US")}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}