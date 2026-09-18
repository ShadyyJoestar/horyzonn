import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

export default async function AdminAuditPage() {
  const supabase = createAdminClient();

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select(
      "id, actor_id, action, target_type, target_id, previous_value, new_value, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Audit log</h2>
        <p className="text-muted-foreground mt-1">
          Perubahan penting: thresholds, career competency weights, dll.
        </p>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive space-y-2">
            <p>Failed to load audit logs: {error.message}</p>
            <p className="text-muted-foreground">
              Kalau tabel belum ada, jalankan SQL create table audit_logs di Supabase.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 text-sm">
        <Badge variant="secondary">{logs?.length ?? 0} entries</Badge>
      </div>

      <div className="grid gap-3">
        {logs?.map((log) => (
          <Card key={log.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <ScrollText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base font-mono text-sm">
                    {log.action}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.target_type}
                    {log.target_id ? ` · ${log.target_id.slice(0, 8)}…` : ""}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">
                {log.created_at
                  ? new Date(log.created_at).toLocaleString("id-ID")
                  : "—"}
              </Badge>
            </CardHeader>
            <CardContent className="pl-12 space-y-2 text-xs">
              <p className="text-muted-foreground">
                Actor:{" "}
                <span className="font-mono">
                  {log.actor_id ? `${log.actor_id.slice(0, 8)}…` : "—"}
                </span>
              </p>
              {(log.previous_value || log.new_value) && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <pre className="rounded-lg border bg-muted/40 p-2 overflow-x-auto">
                    {JSON.stringify(log.previous_value, null, 2) || "null"}
                  </pre>
                  <pre className="rounded-lg border bg-muted/40 p-2 overflow-x-auto">
                    {JSON.stringify(log.new_value, null, 2) || "null"}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!logs || logs.length === 0) && !error && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            Belum ada audit entries. Ubah threshold atau career requirement untuk
            menghasilkan log.
          </CardContent>
        </Card>
      )}
    </div>
  );
}