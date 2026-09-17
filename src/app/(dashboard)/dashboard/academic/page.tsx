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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassificationBadge } from "@/components/assessment/classification-badge";
import { computeProfileCompleteness } from "@/lib/profile-completeness";
import { ArrowRight, Target, BookOpen, User, Activity } from "lucide-react";

const academicTypeLabel: Record<string, string> = {
  TECHNICAL_ORIENTED: "Technical-Oriented",
  CREATIVE_ORIENTED: "Creative-Oriented",
  ANALYTICAL_ORIENTED: "Analytical-Oriented",
  COMMUNICATION_ORIENTED: "Communication-Oriented",
  MULTIDISCIPLINARY: "Multidisciplinary",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: academic },
    { count: skillsCount },
    { count: experiencesCount },
    { count: interestsCount },
    { data: latestCareer },
    { data: latestAcademic },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("academic_records").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("user_competencies")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("experiences")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("user_interests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("assessments")
      .select(
        "id, readiness_score, classification, confidence, created_at, careers(name)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("academic_classifications")
      .select("id, profile_type, confidence, created_at, recommendations")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const academicFields = academic
    ? [
        academic.mathematics,
        academic.english,
        academic.science,
        academic.indonesian,
        academic.social_studies,
        academic.vocational,
      ].filter((v) => v != null && Number(v) > 0).length
    : 0;

  const completeness = computeProfileCompleteness({
    hasAcademic: !!academic,
    academicFieldsFilled: academicFields,
    skillsCount: skillsCount || 0,
    experiencesCount: experiencesCount || 0,
    interestsCount: interestsCount || 0,
  });

  const focus = profile?.primary_focus || "both";
  const careerName = latestCareer
    ? (Array.isArray(latestCareer.careers)
        ? latestCareer.careers[0]
        : latestCareer.careers) as { name?: string } | null
    : null;

  const topPaths = Array.isArray(latestAcademic?.recommendations)
    ? latestAcademic!.recommendations.slice(0, 3)
    : [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Where you are now, and what&apos;s your next horizon.
        </p>
      </div>

      {/* Completeness */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Profile completeness</CardTitle>
            <span className="text-sm font-medium tabular-nums">{completeness}%</span>
          </div>
          <CardDescription>
            Academic, skills, experiences, and interests feed both academic and
            career classification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={completeness} className="h-2" />
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Academic fields: {academicFields}</span>
            <span>Skills: {skillsCount || 0}</span>
            <span>Experiences: {experiencesCount || 0}</span>
            <span>Interests: {interestsCount || 0}</span>
          </div>
          {completeness < 80 && (
            <Button
              size="sm"
              render={<Link href="/dashboard/profile" />}
              nativeButton={false}
            >
              Complete profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Two classification pillars */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <CardTitle className="text-base">Academic classification</CardTitle>
            </div>
            <CardDescription>
              Profile type and education path compatibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestAcademic ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>
                    {academicTypeLabel[latestAcademic.profile_type] ||
                      latestAcademic.profile_type}
                  </Badge>
                  <Badge variant="secondary">{latestAcademic.confidence}</Badge>
                </div>
                {topPaths.length > 0 && (
                  <ul className="text-sm space-y-1">
                    {topPaths.map(
                      (p: { name: string; compatibility: number; level: string }) => (
                        <li key={p.name} className="flex justify-between gap-2">
                          <span className="truncate">{p.name}</span>
                          <span className="text-muted-foreground tabular-nums shrink-0">
                            {p.compatibility}% · {p.level}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={`/dashboard/academic/${latestAcademic.id}`} />}
                  nativeButton={false}
                >
                  View details
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  No academic classification yet.
                </p>
                <Button
                  size="sm"
                  render={<Link href="/dashboard/academic" />}
                  nativeButton={false}
                >
                  Classify academic profile
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <CardTitle className="text-base">Career readiness</CardTitle>
            </div>
            <CardDescription>
              Latest readiness score against a target career
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestCareer ? (
              <>
                <p className="text-sm font-medium">
                  {careerName?.name || "Career"}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-semibold tabular-nums">
                    {latestCareer.readiness_score}
                    <span className="text-base text-muted-foreground font-normal">
                      /100
                    </span>
                  </span>
                  <ClassificationBadge
                    classification={latestCareer.classification}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={`/dashboard/assessment/${latestCareer.id}`} />}
                  nativeButton={false}
                >
                  View assessment
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  No career assessment yet.
                </p>
                <Button
                  size="sm"
                  render={<Link href="/dashboard/careers" />}
                  nativeButton={false}
                >
                  Choose a career
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <User className="h-4 w-4 mb-1" />
            <CardTitle className="text-sm">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              render={<Link href="/dashboard/profile" />}
              nativeButton={false}
            >
              Edit data
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <BookOpen className="h-4 w-4 mb-1" />
            <CardTitle className="text-sm">Academic paths</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              render={<Link href="/dashboard/academic" />}
              nativeButton={false}
            >
              Open
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Target className="h-4 w-4 mb-1" />
            <CardTitle className="text-sm">Careers</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              render={<Link href="/dashboard/careers" />}
              nativeButton={false}
            >
              Open
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Activity className="h-4 w-4 mb-1" />
            <CardTitle className="text-sm">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              render={<Link href="/dashboard/progress" />}
              nativeButton={false}
            >
              Open
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Focus:</span>
        <Badge variant="secondary" className="capitalize">
          {focus}
        </Badge>
      </div>
    </div>
  );
}