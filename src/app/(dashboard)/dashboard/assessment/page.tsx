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
import { ClassificationBadge } from "@/components/assessment/classification-badge";
import { ArrowRight } from "lucide-react";

export default async function AssessmentHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assessments } = await supabase
    .from("assessments")
    .select(
      "id, readiness_score, classification, confidence, created_at, careers(name, slug)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Assessment History
          </h2>
          <p className="text-muted-foreground mt-1">
            Track how your classification changes after you improve your skills.
          </p>
        </div>
        <Button
          size="sm"
          render={<Link href="/dashboard/careers" />}
          nativeButton={false}
        >
          New Assessment
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {!assessments?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No assessments yet</CardTitle>
            <CardDescription>
              Pick a career from the library and run your first classification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              render={<Link href="/dashboard/careers" />}
              nativeButton={false}
            >
              Open Career Library
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => {
            const career = Array.isArray(a.careers) ? a.careers[0] : a.careers;
            const careerName =
              (career as { name?: string } | null)?.name || "Career";

            return (
              <Link
                key={a.id}
                href={`/dashboard/assessment/${a.id}`}
                className="block rounded-lg border border-border p-4 hover:border-foreground/30 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{careerName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(a.created_at).toLocaleString("en-US")} ·
                      Confidence {a.confidence}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold tabular-nums">
                      {a.readiness_score}
                      <span className="text-sm text-muted-foreground font-normal">
                        /100
                      </span>
                    </span>
                    <ClassificationBadge classification={a.classification} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}