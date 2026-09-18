import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AskCounselorForm } from "@/components/counselor/ask-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Ask counselor · Horyzon",
};

type QuestionRow = {
  id: string;
  subject: string | null;
  question: string;
  status: string;
  created_at: string;
};

type ReplyRow = {
  id: string;
  question_id: string;
  reply: string;
  created_at: string;
  counselor_id: string;
};

function statusBadge(status: string) {
  if (status === "answered") {
    return <Badge className="bg-emerald-600/15 text-emerald-700 border-0">Answered</Badge>;
  }
  if (status === "closed") {
    return <Badge variant="secondary">Closed</Badge>;
  }
  return <Badge variant="outline">Open</Badge>;
}

export default async function AskCounselorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: questions, error: qError } = await supabase
    .from("counselor_questions")
    .select("id, subject, question, status, created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const safeQuestions = (questions ?? []) as QuestionRow[];
  const questionIds = safeQuestions.map((q) => q.id);

  let replies: ReplyRow[] = [];
  let counselorMap = new Map<string, { full_name: string | null; email: string | null }>();

  if (questionIds.length > 0) {
    const { data: replyData } = await supabase
      .from("counselor_replies")
      .select("id, question_id, reply, created_at, counselor_id")
      .in("question_id", questionIds)
      .order("created_at", { ascending: true });

    replies = (replyData ?? []) as ReplyRow[];

    const counselorIds = [
      ...new Set(replies.map((r) => r.counselor_id)),
    ];

    if (counselorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", counselorIds);

      for (const p of profiles ?? []) {
        counselorMap.set(p.id, {
          full_name: p.full_name,
          email: p.email,
        });
      }
    }
  }

  const repliesByQuestion = new Map<string, ReplyRow[]>();
  for (const r of replies) {
    const list = repliesByQuestion.get(r.question_id) ?? [];
    list.push(r);
    repliesByQuestion.set(r.question_id, list);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Ask counselor
        </h2>
        <p className="text-muted-foreground mt-1">
          Kirim pertanyaan tanpa memilih counselor. Pertanyaan masuk ke pool
          dan bisa dijawab counselor mana saja. Balasan muncul di halaman ini
          dan di overview dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pertanyaan baru</CardTitle>
          <CardDescription>
            Tidak perlu pilih counselor — cukup tulis pertanyaanmu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AskCounselorForm />
        </CardContent>
      </Card>

      {qError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Gagal memuat pertanyaan: {qError.message}. Pastikan migration
          <code className="mx-1">counselor_questions</code> sudah dijalankan.
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Riwayat pertanyaan</h3>

        {safeQuestions.length === 0 && !qError && (
          <p className="text-sm text-muted-foreground">
            Belum ada pertanyaan. Kirim yang pertama di atas.
          </p>
        )}

        {safeQuestions.map((q) => {
          const qReplies = repliesByQuestion.get(q.id) ?? [];
          return (
            <Card key={q.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {q.subject || "Tanpa subject"}
                    </CardTitle>
                    <CardDescription>
                      {new Date(q.created_at).toLocaleString("id-ID")}
                    </CardDescription>
                  </div>
                  {statusBadge(q.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm whitespace-pre-wrap">{q.question}</p>

                {qReplies.length > 0 && (
                  <div className="space-y-3 border-t pt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Balasan counselor
                    </p>
                    {qReplies.map((r) => {
                      const c = counselorMap.get(r.counselor_id);
                      return (
                        <div
                          key={r.id}
                          className="rounded-lg bg-muted/50 p-3 text-sm space-y-1"
                        >
                          <p className="text-xs text-muted-foreground">
                            {c?.full_name || c?.email || "Counselor"} ·{" "}
                            {new Date(r.created_at).toLocaleString("id-ID")}
                          </p>
                          <p className="whitespace-pre-wrap">{r.reply}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}