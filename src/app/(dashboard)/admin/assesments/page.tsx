import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

type CareerJoin = { name: string | null; slug: string | null } | null;
type ProfileJoin = { full_name: string | null; email: string | null } | null;

type AssessmentRow = {
  id: string;
  readiness_score: number | null;
  classification: string | null;
  confidence: number | null;
  profile_completeness: number | null;
  created_at: string | null;
  user_id: string;
  careers?: CareerJoin | CareerJoin[];
  profiles?: ProfileJoin | ProfileJoin[];
};

const levelVariant: Record<string, "default" | "secondary" | "outline"> = {
  CAREER_READY: "default",
  READY_WITH_GAPS: "secondary",
  DEVELOPING: "outline",
  EXPLORING: "outline",
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function AdminAssessmentsPage() {
  const supabase = createAdminClient();

  let list: AssessmentRow[] = [];
  let loadError: string | null = null;

  // Query utama: coba join profiles (kalau FK/relasi ada)
  const primary = await supabase
    .from("assessment_results")
    .select(
      `
      id,
      readiness_score,
      classification,
      confidence,
      profile_completeness,
      created_at,
      user_id,
      careers ( name, slug ),
      profiles:user_id ( full_name, email )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (!primary.error && primary.data) {
    list = primary.data as AssessmentRow[];
  } else {
    // Fallback: tanpa profiles, biar page tetap jalan
    const fallback = await supabase
      .from("assessment_results")
      .select(
        `
        id,
        readiness_score,
        classification,
        confidence,
        profile_completeness,
        created_at,
        user_id,
        careers ( name, slug )
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (fallback.error) {
      loadError = fallback.error.message;
    } else {
      list = (fallback.data as AssessmentRow[]) ?? [];
      // simpan error primary sebagai info ringan (opsional)
      if (primary.error) {
        loadError = `Profiles join skipped: ${primary.error.message}`;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Assessment records
        </h2>
        <p className="text-muted-foreground mt-1">
          Riwayat classification runs di seluruh platform (100 terbaru).
        </p>
      </div>

      {loadError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            {loadError}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 text-sm">
        <Badge variant="secondary">{list.length} shown</Badge>
      </div>

      <div className="grid gap-3">
        {list.map((a) => {
          const career = pickOne(a.careers);
          const profile = pickOne(a.profiles);

          return (
            <Card key={a.id} className="hover:bg-muted/20 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {career?.name || "Unknown career"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      {profile?.full_name ||
                        profile?.email ||
                        `${a.user_id.slice(0, 8)}…`}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    levelVariant[a.classification || ""] || "outline"
                  }
                >
                  {String(a.classification || "—").replaceAll("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="pl-12 space-y-1 text-sm">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                  <span>
                    Score{" "}
                    <strong className="text-foreground tabular-nums">
                      {a.readiness_score ?? "—"}
                    </strong>
                  </span>
                  <span>
                    Confidence{" "}
                    <strong className="text-foreground tabular-nums">
                      {a.confidence ?? "—"}
                    </strong>
                  </span>
                  <span>
                    Completeness{" "}
                    <strong className="text-foreground tabular-nums">
                      {a.profile_completeness ?? "—"}
                    </strong>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {a.created_at
                    ? new Date(a.created_at).toLocaleString("id-ID")
                    : "—"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {list.length === 0 && !loadError && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            Belum ada assessment records.
          </CardContent>
        </Card>
      )}
    </div>
  );
}