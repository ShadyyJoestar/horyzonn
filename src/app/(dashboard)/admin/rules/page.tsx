import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Info } from "lucide-react";
import { RuleEditDialog } from "@/components/admin/rule-edit-dialog";

export default async function AdminRulesPage() {
  const supabase = await createClient();

  const { data: rules, error } = await supabase
    .from("classification_rules")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div className="space-y-6">
        <Header />
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            Failed to load rules: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex gap-3 py-4 text-sm">
          <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <div className="text-muted-foreground">
            <p className="font-medium text-foreground mb-1">
              Configurable classification engine
            </p>
            <p>
              Ubah threshold di sini. Perubahan hanya memengaruhi{" "}
              <strong>assessment berikutnya</strong> — history tetap utuh.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {rules?.map((rule) => (
          <Card key={rule.id} className="hover:bg-muted/20 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{rule.name}</CardTitle>
                <RuleEditDialog
                  rule={{
                    id: rule.id,
                    name: rule.name,
                    value: rule.value,
                    description: rule.description,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{rule.value}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {rule.description || "No description"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!rules || rules.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Settings className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">No classification rules found</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Seed tabel <code className="text-xs">classification_rules</code>{" "}
              dulu (nama contoh: career_ready_threshold, ready_with_gaps_threshold,
              developing_threshold).
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current engine logic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <LogicRow range="readiness ≥ 85" label="CAREER_READY" />
          <LogicRow range="70 ≤ readiness < 85" label="READY_WITH_GAPS" />
          <LogicRow range="50 ≤ readiness < 70" label="DEVELOPING" />
          <LogicRow range="readiness < 50" label="EXPLORING" />
        </CardContent>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">
        Classification Rules
      </h2>
      <p className="text-muted-foreground mt-1">
        Thresholds dipakai classification engine — ubah tanpa deploy ulang.
      </p>
    </div>
  );
}

function LogicRow({ range, label }: { range: string; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2">
      <span className="text-muted-foreground font-mono text-xs sm:text-sm">
        {range}
      </span>
      <Badge variant="secondary" className="font-mono text-xs">
        {label}
      </Badge>
    </div>
  );
}