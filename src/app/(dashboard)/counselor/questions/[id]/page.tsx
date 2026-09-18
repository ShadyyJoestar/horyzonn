import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CounselorReplyForm } from "@/components/counselor/reply-form";
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
  title: "Question detail · Horyzon",
};

type Props = {
  params: Promise<{ id: string }>;
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

export default async function CounselorQuestionDetailPage({ params }: Props) {
  const { id } = await params;
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

  const { data: question } = await supabase
    .from("counselor_questions")
    .select("id, student_id, subject, question, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!question) notFound();

  const [{ data: student }, { data: replies }, { data: assessments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, primary_focus, role")
        .eq("id", question.student_id)
        .maybeSingle(),
      supabase
        .from("counselor_replies")
        .select("id, reply, created_at, counselor_id")
        .eq("question_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("assessment_results")
        .select(
          "id, readiness_score, classification, created_at, careers(name)"
        )
        .eq("user_id", question.student_id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const counselorIds = [
    ...new Set((replies ?? []).map((r) => r.counselor_id)),
  ];
  let counselorMap = new Map<string, string>();
  if (counselorIds.length > 0) {
    const { data: cps } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", counselorIds);
    for (const c of cps ?? []) {
      counselorMap.set(c.id, c.full_name || c.email || "Counselor");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/counselor/questions" />}
          nativeButton={false}
        >
          ← Back
        </Button>
        {statusBadge(question.status)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {question.subject || "Tanpa subject"}
          </CardTitle>
          <CardDescription>
            {new Date(question.created_at).toLocaleString("id-ID")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{question.question}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name: </span>
            {student?.full_name || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            {student?.email || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Focus: </span>
            {student?.primary_focus || "—"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            render={<Link href={`/counselor/students/${question.student_id}`} />}
            nativeButton={false}
          >
            Open student page
          </Button>
        </CardContent>
      </Card>

      {(assessments?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(assessments ?? []).map((a) => {
              const career = Array.isArray(a.careers)
                ? a.careers[0]
                : a.careers;
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-sm border-b last:border-0 py-2"
                >
                  <div>
                    <p className="font-medium">
                      {(career as { name?: string } | null)?.name ?? "Career"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.classification} · score {a.readiness_score ?? "—"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/counselor/assessments/${a.id}`} />}
                    nativeButton={false}
                  >
                    View
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {(replies?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Replies
          </h3>
          {(replies ?? []).map((r) => (
            <div
              key={r.id}
              className="rounded-lg border bg-card p-4 text-sm space-y-1"
            >
              <p className="text-xs text-muted-foreground">
                {counselorMap.get(r.counselor_id) || "Counselor"} ·{" "}
                {new Date(r.created_at).toLocaleString("id-ID")}
              </p>
              <p className="whitespace-pre-wrap">{r.reply}</p>
            </div>
          ))}
        </div>
      )}

      {question.status !== "closed" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your reply</CardTitle>
          </CardHeader>
          <CardContent>
            <CounselorReplyForm
              questionId={question.id}
              status={question.status}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}