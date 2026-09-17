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
import { Progress } from "@/components/ui/progress";
import {
  classifyAcademicProfile,
  type AcademicOrientation,
} from "@/lib/classification/academic";
import { ArrowRight } from "lucide-react";

const ORIENTATION_LABEL: Record<AcademicOrientation, string> = {
  TECHNICAL: "Technical-Oriented",
  CREATIVE: "Creative-Oriented",
  ANALYTICAL: "Analytical-Oriented",
  COMMUNICATION: "Communication-Oriented",
  MULTIDISCIPLINARY: "Multidisciplinary",
};

const COMPATIBILITY_STYLE: Record<string, string> = {
  HIGH: "bg-emerald-500/15 text-emerald-600",
  MEDIUM: "bg-amber-500/15 text-amber-700",
  EXPLORATORY: "bg-muted text-muted-foreground",
};

export default async function AcademicPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: academic }, { data: userCompetencies }, { data: interests }, { data: experiences }] =
    await Promise.all([
      supabase.from("academic_records").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("user_competencies")
        .select("level, competencies(name, category)")
        .eq("user_id", user.id),
      supabase.from("user_interests").select("interest").eq("user_id", user.id),
      supabase.from("experiences").select("type, title").eq("user_id", user.id),
    ]);

  const hasAnyData =
    academic ||
    (userCompetencies && userCompetencies.length > 0) ||
    (interests && interests.length > 0);

  const skills = (userCompetencies || []).map((uc) => {
    const comp = Array.isArray(uc.competencies) ? uc.competencies[0] : uc.competencies;
    return {
      name: (comp as { name?: string } | null)?.name || "Unknown",
      category: (comp as { category?: string } | null)?.category || "",
      level: uc.level,
    };
  });

  const result = classifyAcademicProfile({
    academic: {
      mathematics: academic?.mathematics ?? null,
      english: academic?.english ?? null,
      science: academic?.science ?? null,
      indonesian: academic?.indonesian ?? null,
      social_studies: academic?.social_studies ?? null,
      vocational: academic?.vocational ?? null,
    },
    skills,
    interests: (interests || []).map((i) => i.interest),
    experiences: (experiences || []).map((e) => ({ type: e.type, title: e.title })),
  });

  const orientations: Exclude<AcademicOrientation, "MULTIDISCIPLINARY">[] = [
    "TECHNICAL",
    "CREATIVE",
    "ANALYTICAL",
    "COMMUNICATION",
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Academic Path</h2>
        <p className="text-muted-foreground mt-1">
          Understand your academic profile and explore compatible education paths.
        </p>
      </div>

      {!hasAnyData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No profile data yet</CardTitle>
            <CardDescription>
              Complete your academic data, skills, and interests to get your
              academic profile classification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              render={<Link href="/dashboard/profile" />}
              nativeButton={false}
            >
              Complete Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-base">Academic Profile</CardTitle>
                <Badge className="bg-primary/15 text-primary border-0">
                  {ORIENTATION_LABEL[result.orientation]}
                </Badge>
              </div>
              <CardDescription>
                Derived from your actual academic records, skills, interests, and
                experiences — classification, not prediction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">
                {result.explanation.summary}
              </p>

              <div className="space-y-2">
                {orientations.map((o) => (
                  <div key={o} className="flex items-center gap-3">
                    <span className="text-xs w-36 shrink-0 text-muted-foreground">
                      {ORIENTATION_LABEL[o]}
                    </span>
                    <Progress value={result.scores[o]} className="h-2 flex-1" />
                    <span className="text-xs tabular-nums w-8 text-right">
                      {result.scores[o]}
                    </span>
                  </div>
                ))}
              </div>

              {result.explanation.contributingFactors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Contributing factors
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-0.5">
                    {result.explanation.contributingFactors.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold">Education Path Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Compatibility between your profile and each path.
              </p>
            </div>

            {result.recommendations.map((rec) => (
              <div
                key={rec.name}
                className="rounded-lg border border-border p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-sm">{rec.name}</p>
                  <Badge
                    variant="outline"
                    className={`border-0 font-medium ${COMPATIBILITY_STYLE[rec.compatibility]}`}
                  >
                    {rec.compatibility} Compatibility
                  </Badge>
                </div>
                {rec.factors.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Because: {rec.factors.join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What next?</CardTitle>
              <CardDescription>
                A career-ready profile starts with a complete academic profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                render={<Link href="/dashboard/profile" />}
                nativeButton={false}
              >
                Update Profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                render={<Link href="/dashboard/careers" />}
                nativeButton={false}
              >
                Explore Careers
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}