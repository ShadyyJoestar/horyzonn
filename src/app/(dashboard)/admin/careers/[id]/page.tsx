import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CareerRequirementsManager } from "@/components/admin/career-requirements-manager";
import { ArrowLeft } from "lucide-react";

export default async function AdminCareerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: career, error: careerError },
    { data: requirements, error: reqError },
    { data: competencies },
  ] = await Promise.all([
    supabase
      .from("careers")
      .select("id, name, slug, description, is_active")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("career_competencies")
      .select(
        "id, competency_id, required_level, weight, is_core, competencies(id, name, category)"
      )
      .eq("career_id", id)
      .order("weight", { ascending: false }),
    supabase
      .from("competencies")
      .select("id, name, category")
      .order("name"),
  ]);

  if (careerError || !career) notFound();

  // normalize join shape (kadang array, kadang object)
  const normalizedReqs = (requirements || []).map((r) => {
    const comp = Array.isArray(r.competencies)
      ? r.competencies[0]
      : r.competencies;
    return {
      id: r.id,
      competency_id: r.competency_id,
      required_level: r.required_level,
      weight: Number(r.weight),
      is_core: !!r.is_core,
      competencies: comp
        ? {
            id: (comp as { id: string }).id,
            name: (comp as { name: string }).name,
            category: (comp as { category?: string }).category,
          }
        : null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/careers" />}
            className="px-0 text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to careers
          </Button>
          <h2 className="text-2xl font-semibold tracking-tight">{career.name}</h2>
          <p className="text-sm text-muted-foreground font-mono">{career.slug}</p>
        </div>
        <Badge variant={career.is_active ? "default" : "secondary"}>
          {career.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {career.description && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            {career.description}
          </CardContent>
        </Card>
      )}

      {reqError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            Failed to load requirements: {reqError.message}
          </CardContent>
        </Card>
      )}

      <CareerRequirementsManager
        careerId={career.id}
        careerName={career.name}
        requirements={normalizedReqs}
        allCompetencies={competencies || []}
      />
    </div>
  );
}