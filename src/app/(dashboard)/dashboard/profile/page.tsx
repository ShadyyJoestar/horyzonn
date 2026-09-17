import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicForm } from "@/components/profile/academics-form";
import { SkillsForm } from "@/components/profile/skills-form";
import { ExperiencesForm } from "@/components/profile/experiences-form";
import { InterestsForm } from "@/components/profile/interests-form";
import { groupRubricsByCategory } from "@/lib/classification/level-rubric";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: academic },
    { data: userCompetencies },
    { data: experiences },
    { data: interests },
    { data: allCompetencies },
    { data: rubrics },
  ] = await Promise.all([
    supabase
      .from("academic_records")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_competencies")
      .select("*, competencies(id, name, category)")
      .eq("user_id", user.id),
    supabase
      .from("experiences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("user_interests").select("*").eq("user_id", user.id),
    supabase.from("competencies").select("*").order("name"),
    supabase
      .from("competency_rubrics")
      .select("category, level, label, description, example_evidence")
      .order("level"),
  ]);

  const rubricsByCategory = groupRubricsByCategory(rubrics || []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground mt-1">
          Build a structured profile so Horyzon can give accurate classification.
        </p>
      </div>

      <Tabs defaultValue="academic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experiences">Experiences</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="mt-6">
          <AcademicForm userId={user.id} initialData={academic} />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <SkillsForm
            userId={user.id}
            allCompetencies={allCompetencies || []}
            userCompetencies={userCompetencies || []}
            rubricsByCategory={rubricsByCategory}
          />
        </TabsContent>

        <TabsContent value="experiences" className="mt-6">
          <ExperiencesForm
            userId={user.id}
            initialData={experiences || []}
          />
        </TabsContent>

        <TabsContent value="interests" className="mt-6">
          <InterestsForm
            userId={user.id}
            initialData={interests || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}