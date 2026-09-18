// src/app/(dashboard)/counselor/students/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCounselor } from "@/lib/counselor/guards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default async function CounselorStudentsPage() {
  const { error, ctx } = await requireCounselor();
  if (error || !ctx) redirect("/login");
  const { supabase, user } = ctx;

  // Dari share assessment
  const { data: shares } = await supabase
    .from("shared_assessments")
    .select("user_id, created_at")
    .eq("counselor_id", user.id)
    .is("revoked_at", null);

  // Dari pertanyaan pool
  const { data: questions } = await supabase
    .from("counselor_questions")
    .select("student_id, created_at");

  const shareIds = (shares ?? []).map((s) => s.user_id).filter(Boolean);
  const questionIds = (questions ?? [])
    .map((q) => q.student_id)
    .filter(Boolean);

  const ids = [...new Set([...shareIds, ...questionIds])];

  if (ids.length === 0) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Students</h2>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Belum ada siswa</CardTitle>
            <CardDescription>
              Siswa yang share assessment ke kamu, atau yang mengirim
              pertanyaan, akan muncul di sini.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, email, primary_focus")
    .in("id", ids);

  const rows = (profiles ?? []).map((p) => ({
    ...p,
    shareCount: (shares ?? []).filter((s) => s.user_id === p.id).length,
    questionCount: (questions ?? []).filter((q) => q.student_id === p.id)
      .length,
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-semibold tracking-tight">Students</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base truncate">
                  {p.full_name || "Student"}
                </CardTitle>
                <CardDescription className="truncate">
                  {p.email}
                  {p.shareCount > 0
                    ? ` · ${p.shareCount} shared`
                    : ""}
                  {p.questionCount > 0
                    ? ` · ${p.questionCount} question${p.questionCount > 1 ? "s" : ""}`
                    : ""}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/counselor/students/${p.id}`} />}
                nativeButton={false}
              >
                View profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}