import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CounselorDashboardPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "student";
    if (role !== "counselor" && role !== "admin") {
      redirect("/dashboard");
    }

    // Select HANYA kolom yang ada di DB (token, bukan share_token)
    const { data: shares, error } = await supabase
      .from("shared_assessments")
      .select(
        "id, user_id, assessment_id, message, created_at, expires_at, token, counselor_id, revoked_at"
      )
      .eq("counselor_id", user.id)
      .is("revoked_at", null)
      .order("created_at", { ascending: false })
      .limit(20);

    return (
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-2xl font-semibold">Counselor Overview</h1>
        <p className="text-sm text-muted-foreground">
          Role: {role} · User: {user.email}
        </p>

        {error && (
          <div className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm">
            Query error: {error.message}
          </div>
        )}

        <div className="rounded border border-border p-4">
          <p className="font-medium mb-2">
            Shared assessments: {(shares ?? []).length}
          </p>
          {(shares ?? []).length === 0 && !error && (
            <p className="text-sm text-muted-foreground">
              Belum ada share. Ini normal — page harus tetap load.
            </p>
          )}
          <ul className="space-y-2 text-sm">
            {(shares ?? []).map((s) => (
              <li key={s.id} className="border-b border-border pb-2">
                id: {s.id}
                <br />
                assessment: {s.assessment_id}
                <br />
                token: {s.token ?? "(null)"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } catch (e) {
    console.error("[counselor/page] FATAL:", e);
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Counselor page error</h1>
        <pre className="mt-4 text-sm whitespace-pre-wrap">
          {e instanceof Error ? e.message : String(e)}
        </pre>
      </div>
    );
  }
}