import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import { CareerFormDialog } from "@/components/admin/career-form-dialog";
import { ToggleCareerActive } from "@/components/admin/toggle-career-active";

export default async function AdminCareersPage() {
  const supabase = await createClient();

  const { data: careers, error } = await supabase
    .from("careers")
    .select("id, name, slug, description, is_active, created_at")
    .order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <Header />
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            Failed to load careers: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeCount = careers?.filter((c) => c.is_active).length ?? 0;
  const inactiveCount = (careers?.length ?? 0) - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Header />
        <CareerFormDialog mode="create" />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Badge variant="secondary">{careers?.length ?? 0} total</Badge>
        <Badge variant="default">{activeCount} active</Badge>
        {inactiveCount > 0 && (
          <Badge variant="outline">{inactiveCount} inactive</Badge>
        )}
      </div>

      <div className="grid gap-3">
        {careers?.map((career) => (
          <Card key={career.id} className="hover:bg-muted/20 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">{career.name}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {career.slug}
                  </p>
                </div>
              </div>
              <Badge variant={career.is_active ? "default" : "secondary"}>
                {career.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>
            <CardContent className="pl-[3.75rem] space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {career.description || "No description yet."}
              </p>
              <div className="flex flex-wrap gap-2">
                <CareerFormDialog mode="edit" career={career} />
                <ToggleCareerActive id={career.id} isActive={!!career.is_active} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!careers || careers.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Briefcase className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No careers in library</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Tambah career pertama supaya student bisa menjalankan assessment.
            </p>
            <CareerFormDialog mode="create" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Careers</h2>
      <p className="text-muted-foreground mt-1">
        Manage career library, visibility, and metadata.
      </p>
    </div>
  );
}