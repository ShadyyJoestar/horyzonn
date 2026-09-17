import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Brain, Users, FileText } from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: careersCount },
    { count: competenciesCount },
    { count: usersCount },
    { count: assessmentsCount },
  ] = await Promise.all([
    supabase.from("careers").select("*", { count: "exact", head: true }),
    supabase.from("competencies").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("assessments").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { title: "Total Careers", value: careersCount ?? 0, icon: Briefcase, href: "/admin/careers" },
    { title: "Total Competencies", value: competenciesCount ?? 0, icon: Brain, href: "/admin/competencies" },
    { title: "Total Users", value: usersCount ?? 0, icon: Users, href: "/admin/users" },
    { title: "Total Assessments", value: assessmentsCount ?? 0, icon: FileText, href: "/admin/analytics" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1">
          Platform summary and quick access to management tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Manage career library & competency weights</p>
            <p>• Adjust classification thresholds</p>
            <p>• View assessment distribution</p>
            <p>• Manage user roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Classification Engine</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium text-green-600">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auth</span>
              <span className="font-medium text-green-600">Running</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}