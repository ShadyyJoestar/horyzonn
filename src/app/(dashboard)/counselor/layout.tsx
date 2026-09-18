import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavLink } from "@/components/dashboard/nav-link";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import {
  LayoutDashboard,
  Users,
  Inbox,
  LayoutGrid,
  ClipboardList,
  BarChart3,
} from "lucide-react";

/**
 * Counselor / Mentor module – clear destinations:
 *  1. Overview          → ringkasan & recent activity
 *  2. Students          → students who shared with this counselor
 *  3. Shared with me    → inbox of shared assessments
 *  4. Assessments       → list assessments
 */
const counselorNav = [
  { href: "/counselor", label: "Overview", icon: LayoutDashboard },
  { href: "/counselor/students", label: "Students", icon: Users },
  { href: "/counselor/shared", label: "Shared with me", icon: Inbox },
  { href: "/counselor/assessments", label: "Assessments", icon: ClipboardList },
];

export default async function CounselorLayout({
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
  if (!["counselor", "mentor", "admin"].includes(role)) {
    redirect("/dashboard");
  }

  const displayName =
    profile?.full_name || profile?.email || user.email || "Counselor";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
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
          {counselorNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              exact={item.href === "/counselor"}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          {role === "admin" && (
            <NavLink href="/admin" label="Admin panel" icon={LayoutGrid} />
          )}
          <NavLink
            href="/dashboard"
            label="Student view"
            icon={BarChart3}
          />
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 gap-2 sticky top-0 z-40 bg-background">
          <div className="flex items-center gap-3 min-w-0">
            <MobileNav
              items={counselorNav}
              title="Horyzon Counselor"
              subtitle={role}
              user={{
                name: displayName,
                email: profile?.email ?? user.email,
                role,
              }}
            />
            <div className="min-w-0 hidden sm:block">
              <h1 className="font-semibold truncate text-sm md:text-base">
                Counselor Dashboard
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {displayName}
              </p>
            </div>
            <span className="sm:hidden font-semibold truncate">Counselor</span>
          </div>
          {/* Always-visible sign-out on mobile & desktop header */}
          <SignOutButton variant="icon" />
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}