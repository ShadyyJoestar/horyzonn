import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { NavLink } from "@/components/dashboard/nav-link";
import {
  LayoutDashboard,
  Briefcase,
  Brain,
  Users,
  Settings,
  BarChart3,
  FileText,
  ScrollText,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
  { href: "/admin/competencies", label: "Competencies", icon: Brain },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/rules", label: "Rules", icon: Settings },
  { href: "/admin/assessments", label: "Assessments", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
];

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

  if (role !== "admin") {
    redirect("/dashboard");
  }

  const displayName =
    profile?.full_name || profile?.email || user.email || "Admin";

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

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              exact={item.href === "/admin"}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <NavLink
            href="/dashboard"
            label="Student view"
            icon={LayoutDashboard}
          />
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 gap-2 sticky top-0 z-40 bg-background">
          <div className="flex items-center gap-3 min-w-0">
            <MobileNav
              items={adminNav}
              title="Horyzon Admin"
              subtitle={role}
              user={{
                name: displayName,
                email: profile?.email ?? user.email,
                role,
              }}
            />
            <div className="min-w-0 hidden sm:block">
              <h1 className="font-semibold truncate text-sm md:text-base">
                Admin Dashboard
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {displayName}
              </p>
            </div>
            <span className="sm:hidden font-semibold truncate">Admin</span>
          </div>
          <SignOutButton variant="icon" />
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}