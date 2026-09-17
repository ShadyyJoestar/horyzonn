import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminCompetenciesPage() {
  const supabase = await createClient();

  const { data: competencies, error } = await supabase
    .from("competencies")
    .select("id, name, slug, category, description")
    .order("category")
    .order("name");

  if (error) {
    return <div className="text-red-500">Failed to load: {error.message}</div>;
  }

  // Group by category
  const grouped = competencies?.reduce((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof competencies>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Competencies</h2>
        <p className="text-muted-foreground mt-1">
          Master list of competencies used across careers and assessments.
        </p>
      </div>

      {grouped &&
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {category}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {items?.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {item.description || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{item.slug}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}