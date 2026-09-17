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
import { RunAssessmentButton } from "@/components/assessment/run-assessment-button";
import { ArrowLeft } from "lucide-react";

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: career } = await supabase
    .from("careers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!career) notFound();

  const { data: requirements } = await supabase
    .from("career_competencies")
    .select("required_level, weight, is_core, competencies(name, category)")
    .eq("career_id", career.id)
    .order("weight", { ascending: false });

  const skillCount = await supabase
    .from("user_competencies")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const hasSkills = (skillCount.count || 0) > 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link href="/dashboard/careers" />}
        nativeButton={false}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to library
      </Button>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{career.name}</h2>
        <p className="text-muted-foreground mt-1 leading-relaxed">
          {career.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competency Requirements</CardTitle>
          <CardDescription>
            Weighted requirements used by the classification engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(requirements || []).map((r, i) => {
            const comp = Array.isArray(r.competencies)
              ? r.competencies[0]
              : r.competencies;
            const name = (comp as { name?: string } | null)?.name || "Unknown";
            const category = (comp as { category?: string } | null)?.category;

            return (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {category}
                    {r.is_core ? " · Core" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary">Lv {r.required_level}</Badge>
                  <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                    {(Number(r.weight) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run Classification</CardTitle>
          <CardDescription>
            Horyzon will compare your profile with these requirements and produce
            a readiness classification, gaps, and an action plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasSkills && (
            <p className="text-sm text-amber-600">
              You have no skills in your profile yet.{" "}
              <Link href="/dashboard/profile" className="underline font-medium">
                Complete your profile
              </Link>{" "}
              first for a meaningful result. You can still run the assessment.
            </p>
          )}
          <RunAssessmentButton careerId={career.id} />
        </CardContent>
      </Card>
    </div>
  );
}