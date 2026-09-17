// src/app/(dashboard)/dashboard/careers/compare/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CareerCompareForm } from "@/components/assessment/career-compare-form";
import { ArrowLeft } from "lucide-react";

export default async function ComparePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: careers }, { data: userCompetencies }] = await Promise.all([
    supabase
      .from("careers")
      .select("id, name, description, is_active, career_competencies(required_level, weight, is_core, competencies(id, name))")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("user_competencies")
      .select("competency_id, level, competencies(name)")
      .eq("user_id", user.id),
  ]);

  const careerInputs = (careers || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description || "",
    requirements: (c.career_competencies || []).map((r: any) => {
      const comp = Array.isArray(r.competencies) ? r.competencies[0] : r.competencies;
      return {
        competencyId: r.competencies?.id ?? "",
        competencyName: comp?.name || "Unknown",
        requiredLevel: Math.min(5, Math.max(1, Number(r.required_level) || 1)),
        weight: Number(r.weight) || 0,
        isCore: Boolean(r.is_core),
      };
    }),
  }));

  const userSkills = (userCompetencies || []).map((uc: any) => ({
    competencyId: uc.competency_id,
    level: Math.min(5, Math.max(1, Number(uc.level) || 1)),
  }));

  const userSkillNames: Record<string, string> = {};
  (userCompetencies || []).forEach((uc: any) => {
    const comp = Array.isArray(uc.competencies) ? uc.competencies[0] : uc.competencies;
    if (comp?.name) userSkillNames[uc.competency_id] = comp.name;
  });

  return (
    <div className="space-y-6 max-w-5xl">
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
        <h2 className="text-2xl font-semibold tracking-tight">
          Decision Explorer
        </h2>
        <p className="text-muted-foreground mt-1">
          Compare competency requirements across careers to understand
          trade-offs and preparation needed for each path.
        </p>
      </div>

      {careerInputs.length < 2 ? (
        <p className="text-sm text-muted-foreground">
          Need at least 2 active careers in the library to compare.
        </p>
      ) : (
        <CareerCompareForm
          careers={careerInputs}
          userSkills={userSkills}
          userSkillNames={userSkillNames}
        />
      )}
    </div>
  );
}