// src/app/(dashboard)/admin/layout.tsx
// Guard role admin sekarang tinggal di sini, bukan di layout grup (dashboard).
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import {
  LayoutDashboard,
  Briefcase,
  Brain,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, email")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "student";

  // Non-admin diarahkan ke dashboard student, bukan ke landing page.
  if (role !== "admin") {
    redirect("/dashboard");
  }

  const adminNav = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/careers", label: "Careers", icon: Briefcase },
    { href: "/admin/competencies", label: "Competencies", icon: Brain },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/rules", label: "Rules", icon: Settings },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-border bg-muted/30 hidden md:flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
            H
          </div>
          <div>
            <p className="font-semibold text-sm">Horyzon</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Student view
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {profile?.full_name || profile?.email || user.email}
            </p>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}