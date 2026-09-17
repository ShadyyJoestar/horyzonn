// src/app/(dashboard)/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Brain,
  Users,
  FileText,
  Settings,
  BarChart3,
  ArrowRight,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  let careersCount = 0;
  let competenciesCount = 0;
  let usersCount = 0;
  let assessmentsCount = 0;
  let loadError: string | null = null;

  try {
    const results = await Promise.all([
      supabase.from("careers").select("*", { count: "exact", head: true }),
      supabase.from("competencies").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("assessments").select("*", { count: "exact", head: true }),
    ]);

    careersCount = results[0].count ?? 0;
    competenciesCount = results[1].count ?? 0;
    usersCount = results[2].count ?? 0;
    assessmentsCount = results[3].count ?? 0;

    const firstError = results.find((r) => r.error)?.error;
    if (firstError) loadError = firstError.message;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load platform stats";
  }

  const stats = [
    {
      title: "Careers",
      value: careersCount,
      icon: Briefcase,
      href: "/admin/careers",
      description: "Library & requirements",
    },
    {
      title: "Competencies",
      value: competenciesCount,
      icon: Brain,
      href: "/admin/competencies",
      description: "Master skill list",
    },
    {
      title: "Users",
      value: usersCount,
      icon: Users,
      href: "/admin/users",
      description: "Roles & accounts",
    },
    {
      title: "Assessments",
      value: assessmentsCount,
      icon: FileText,
      href: "/admin/analytics",
      description: "Classification records",
    },
  ];

  const managementAreas = [
    {
      title: "Career Library",
      description: "Add, edit, or deactivate careers and their competency weights.",
      href: "/admin/careers",
      icon: Briefcase,
    },
    {
      title: "Competency Master",
      description: "Maintain the global competency list used by assessments.",
      href: "/admin/competencies",
      icon: Brain,
    },
    {
      title: "Classification Rules",
      description: "Adjust readiness thresholds without touching source code.",
      href: "/admin/rules",
      icon: Settings,
    },
    {
      title: "User Roles",
      description: "View accounts and manage student / counselor / admin roles.",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Platform Analytics",
      description: "See classification distribution and average readiness.",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Manage platform data, classification rules, and user access.
        </p>
      </div>

      {loadError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            Partial load issue: {loadError}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="h-full hover:bg-muted/40 transition-colors cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Management areas
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {managementAreas.map((area) => (
            <Link key={area.href} href={area.href}>
              <Card className="h-full hover:bg-muted/40 transition-colors cursor-pointer group">
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-background transition-colors">
                    <area.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{area.title}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {area.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-muted-foreground">Classification Engine</span>
            <Badge className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-muted-foreground">Database</span>
            <Badge className="bg-emerald-600 hover:bg-emerald-600">Connected</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-muted-foreground">Auth & RLS</span>
            <Badge className="bg-emerald-600 hover:bg-emerald-600">Running</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}