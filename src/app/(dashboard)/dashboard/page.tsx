import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, BookOpen, User } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: academic }, { data: competencies }, { data: experiences }, { data: interests }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("academic_records").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_competencies").select("id").eq("user_id", user.id),
      supabase.from("experiences").select("id").eq("user_id", user.id),
      supabase.from("user_interests").select("id").eq("user_id", user.id),
    ]);

  const focus = profile?.primary_focus || "both";

  // FIX: profile completeness dihitung dari data real (sama dengan engine)
  let profileCompleteness = 0;
  const academicFilled = [
    academic?.mathematics,
    academic?.english,
    academic?.science,
    academic?.indonesian,
  ].filter((v) => typeof v === "number" && v > 0).length;
  profileCompleteness += Math.min(academicFilled / 4, 1) * 25;
  profileCompleteness += Math.min((competencies?.length || 0) / 8, 1) * 30;
  profileCompleteness += Math.min((experiences?.length || 0) / 3, 1) * 25;
  profileCompleteness += Math.min((interests?.length || 0) / 3, 1) * 20;
  profileCompleteness = Math.round(profileCompleteness);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Where you are now, and what&apos;s your next horizon.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Profile Completeness</CardTitle>
            <span className="text-sm font-medium">{profileCompleteness}%</span>
          </div>
          <CardDescription>
            Complete your profile to get more accurate classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={profileCompleteness} className="h-2" />
          <div className="mt-4">
            <Button
              size="sm"
              render={<Link href="/dashboard/profile" />}
              nativeButton={false}
            >
              Complete Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(focus === "career" || focus === "both") && (
          <Card className="hover:border-foreground/30 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Career Readiness</CardTitle>
                  <CardDescription>Assess your career readiness</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link href="/dashboard/assessment" />}
                nativeButton={false}
              >
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        )}

        {(focus === "academic" || focus === "both") && (
          <Card className="hover:border-foreground/30 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Academic Path</CardTitle>
                  <CardDescription>Explore education paths</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link href="/dashboard/academic" />}
                nativeButton={false}
              >
                Explore Paths
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="hover:border-foreground/30 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">My Profile</CardTitle>
                <CardDescription>Academic, skills & experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href="/dashboard/profile" />}
              nativeButton={false}
            >
              Manage Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Current focus:</span>
        <Badge variant="secondary" className="capitalize">
          {focus}
        </Badge>
      </div>
    </div>
  );
}