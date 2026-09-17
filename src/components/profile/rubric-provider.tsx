// src/components/profile/rubric-provider.tsx
import { createClient } from "@/lib/supabase/server";
import { SkillsForm } from "@/components/profile/skills-form";
import type { RubricLevel } from "@/lib/classification/level-rubric";

export async function SkillsSection({
  userId,
  userCompetencies,
  allCompetencies,
}: {
  userId: string;
  userCompetencies: any[];
  allCompetencies: any[];
}) {
  const supabase = await createClient();
  const { data: rubricRows } = await supabase
    .from("competency_rubrics")
    .select("category, level, label, description, example_evidence")
    .order("level");

  // Group per kategori + 'general' fallback
  const rubricsByCategory: Record<string, RubricLevel[]> = {};
  (rubricRows || []).forEach((r: any) => {
    const item: RubricLevel = {
      level: r.level,
      label: r.label,
      description: r.description,
      exampleEvidence: r.example_evidence,
    };
    (rubricsByCategory[r.category] ??= []).push(item);
  });

  return (
    <SkillsForm
      userId={userId}
      allCompetencies={allCompetencies}
      userCompetencies={userCompetencies}
      rubricsByCategory={rubricsByCategory}
    />
  );
}