import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminCareersPage() {
  const supabase = await createClient();

  const { data: careers, error } = await supabase
    .from("careers")
    .select("id, name, slug, description, is_active, created_at")
    .order("name");

  if (error) {
    return (
      <div className="text-red-500">
        Failed to load careers: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Careers</h2>
        <p className="text-muted-foreground mt-1">
          Manage career library and their competency requirements.
        </p>
      </div>

      <div className="grid gap-4">
        {careers?.map((career) => (
          <Card key={career.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">{career.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{career.slug}</p>
              </div>
              <Badge variant={career.is_active ? "default" : "secondary"}>
                {career.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {career.description || "No description"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!careers || careers.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          No careers found. Please seed the data first.
        </div>
      )}
    </div>
  );
}