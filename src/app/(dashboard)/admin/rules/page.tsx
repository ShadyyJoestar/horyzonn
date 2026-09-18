import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Info } from "lucide-react";
import { RuleEditDialog } from "@/components/admin/rule-edit-dialog";
import { CLASSIFICATION_THRESHOLDS } from "@/lib/classification/rules";

export default async function AdminRulesPage() {
  const supabase = await createClient();

  const { data: rules, error } = await supabase
    .from("classification_rules")
    .select("*")
    .order("name");

  // FIX: card "Current engine logic" dulu hardcoded 85/70/50 — sudah tidak
  // benar begitu admin mengubah threshold lewat RuleEditDialog. Sekarang
  // dibaca dari rules yang sama persis dipakai classification engine
  // (lihat loadThresholds() di src/lib/actions/assesments.ts), dengan
  // fallback ke default kalau rule belum di-seed.
  const ruleValueByName = new Map(
    (rules || []).map((r) => [r.name, Number(r.value)])
  );
  const liveThresholds = {
    CAREER_READY:
      ruleValueByName.get("career_ready_threshold") ??
      CLASSIFICATION_THRESHOLDS.CAREER_READY,
    READY_WITH_GAPS:
      ruleValueByName.get("ready_with_gaps_threshold") ??
      CLASSIFICATION_THRESHOLDS.READY_WITH_GAPS,
    DEVELOPING:
      ruleValueByName.get("developing_threshold") ??
      CLASSIFICATION_THRESHOLDS.DEVELOPING,
  };

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
          <p className="text-xs text-muted-foreground">
            Live dari nilai di atas — bukan teks statis.
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <LogicRow
            range={`readiness ≥ ${liveThresholds.CAREER_READY}`}
            label="CAREER_READY"
          />
          <LogicRow
            range={`${liveThresholds.READY_WITH_GAPS} ≤ readiness < ${liveThresholds.CAREER_READY}`}
            label="READY_WITH_GAPS"
          />
          <LogicRow
            range={`${liveThresholds.DEVELOPING} ≤ readiness < ${liveThresholds.READY_WITH_GAPS}`}
            label="DEVELOPING"
          />
          <LogicRow
            range={`readiness < ${liveThresholds.DEVELOPING}`}
            label="EXPLORING"
          />
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