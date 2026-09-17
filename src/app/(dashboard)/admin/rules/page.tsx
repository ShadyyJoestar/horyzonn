import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminRulesPage() {
  const supabase = await createClient();

  const { data: rules, error } = await supabase
    .from("classification_rules")
    .select("*")
    .order("name");

  if (error) {
    return <div className="text-red-500">Failed to load rules: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Classification Rules</h2>
        <p className="text-muted-foreground mt-1">
          Thresholds used by the classification engine. Changing these will affect future assessments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rules?.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <CardTitle className="text-base">{rule.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rule.value}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {rule.description || "No description"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!rules || rules.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          No rules found. Please seed classification_rules first.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Logic</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 text-muted-foreground">
          <p>• readiness ≥ 85 → CAREER_READY</p>
          <p>• 70 ≤ readiness &lt; 85 → READY_WITH_GAPS</p>
          <p>• 50 ≤ readiness &lt; 70 → DEVELOPING</p>
          <p>• readiness &lt; 50 → EXPLORING</p>
        </CardContent>
      </Card>
    </div>
  );
}