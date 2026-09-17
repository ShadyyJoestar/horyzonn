// src/app/(dashboard)/admin/competencies/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";

export default async function AdminCompetenciesPage() {
  const supabase = await createClient();

  const { data: competencies, error } = await supabase
    .from("competencies")
    .select("id, name, slug, category, description")
    .order("category")
    .order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <Header />
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            Failed to load competencies: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  const grouped = competencies?.reduce(
    (acc, item) => {
      const cat = item.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, NonNullable<typeof competencies>>
  );

  const categoryCount = grouped ? Object.keys(grouped).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Header />
        <Button size="sm" disabled>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add competency
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Badge variant="secondary">{competencies?.length ?? 0} competencies</Badge>
        <Badge variant="outline">{categoryCount} categories</Badge>
      </div>

      {grouped &&
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {category}
              </h3>
              <Badge variant="outline" className="text-xs">
                {items?.length ?? 0}
              </Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {items?.map((item) => (
                <Card key={item.id} className="hover:bg-muted/20 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base leading-tight">
                          {item.name}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-12">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-2">
                      {item.slug}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

      {(!competencies || competencies.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">No competencies yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Seed the competencies table. Classification engine depends on this master list.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Competencies</h2>
      <p className="text-muted-foreground mt-1">
        Master list used across careers, assessments, and gap analysis.
      </p>
    </div>
  );
}