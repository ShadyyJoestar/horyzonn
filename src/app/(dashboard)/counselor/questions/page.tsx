import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Student questions · Horyzon",
};

type QuestionRow = {
  id: string;
  student_id: string;
  subject: string | null;
  question: string;
  status: string;
  created_at: string;
};

function statusBadge(status: string) {
  if (status === "answered") {
    return (
      <Badge className="bg-emerald-600/15 text-emerald-700 border-0">
        Answered
      </Badge>
    );
  }
  if (status === "closed") {
    return <Badge variant="secondary">Closed</Badge>;
  }
  return <Badge variant="outline">Open</Badge>;
}

export default async function CounselorQuestionsPage() {
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

  const { data: questions, error } = await supabase
    .from("counselor_questions")
    .select("id, student_id, subject, question, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const safeQuestions = (questions ?? []) as QuestionRow[];

  const studentIds = [...new Set(safeQuestions.map((q) => q.student_id))];
  const studentMap = new Map<
    string,
    { full_name: string | null; email: string | null }
  >();

  if (studentIds.length > 0) {
    const admin = createAdminClient();
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", studentIds);

    for (const p of profiles ?? []) {
      studentMap.set(p.id, {
        full_name: p.full_name,
        email: p.email,
      });
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Student questions
        </h1>
        <p className="text-muted-foreground mt-1">
          Pertanyaan dari siswa (tanpa pilih counselor). Buka untuk lihat
          profil & jawab.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Gagal memuat: {error.message}. Pastikan migration
          <code className="mx-1">counselor_questions</code> sudah dijalankan.
        </div>
      )}

      {safeQuestions.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          Belum ada pertanyaan dari siswa.
        </p>
      )}

      <div className="space-y-3">
        {safeQuestions.map((q) => {
          const student = studentMap.get(q.student_id);
          return (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {q.subject || "Tanpa subject"}
                    </CardTitle>
                    <CardDescription>
                      {student?.full_name || student?.email || "Student"} ·{" "}
                      {new Date(q.created_at).toLocaleString("id-ID")}
                    </CardDescription>
                  </div>
                  {statusBadge(q.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {q.question}
                </p>
                <Button
                  size="sm"
                  render={<Link href={`/counselor/questions/${q.id}`} />}
                  nativeButton={false}
                >
                  Reply
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}