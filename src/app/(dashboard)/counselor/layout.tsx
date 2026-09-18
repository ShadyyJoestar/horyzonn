import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { MobileNav } from "@/components/dashboard/mobile-nav";
import { NavLink } from "@/components/dashboard/nav-link";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

import type { DashboardIconName } from "@/components/dashboard/nav-config";

type CounselorNavItem = {
  href: string;
  label: string;
  icon: DashboardIconName;
};

const counselorNav: CounselorNavItem[] = [
  {
    href: "/counselor",
    label: "Overview",
    icon: "LayoutDashboard",
  },
  {
    href: "/counselor/students",
    label: "Students",
    icon: "Users",
  },
  {
    href: "/counselor/shared",
    label: "Shared with me",
    icon: "Share2",
  },
  {
    href: "/counselor/questions",
    label: "Questions",
    icon: "MessageCircle",
  },
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

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "[counselor/layout] profile error:",
      profileError.message
    );
  }

  const role = profile?.role ?? "student";

  // DB enum: student | counselor | admin
  if (role !== "counselor" && role !== "admin") {
    redirect("/dashboard");
  }

  const displayName =
    profile?.full_name ||
    profile?.email ||
    user.email ||
    "Counselor";

  const mobileNav: CounselorNavItem[] = [
    ...counselorNav,
    {
      href: "/dashboard",
      label: "Student view",
      icon: "LayoutDashboard",
    },
  ];

  if (role === "admin") {
    mobileNav.push({
      href: "/admin",
      label: "Admin panel",
      icon: "Settings",
    });
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
            H
          </div>

          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight">
              Horyzon
            </p>

            <p className="text-xs text-muted-foreground capitalize">
              {role}
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {counselorNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              exact={item.href === "/counselor"}
            />
          ))}
        </nav>

        <div className="border-t border-border p-4 space-y-3">
          <div className="px-3">
            <p className="text-sm font-medium truncate">
              {displayName}
            </p>

            <p className="text-xs text-muted-foreground truncate">
              {profile?.email ?? user.email}
            </p>

            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {role}
            </p>
          </div>

          <NavLink
            href="/dashboard"
            label="Student view"
            icon="LayoutDashboard"
          />

          {role === "admin" && (
            <NavLink
              href="/admin"
              label="Admin panel"
              icon="Settings"
              exact
            />
          )}

          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 gap-2 sticky top-0 z-40 bg-background">
          <div className="flex items-center gap-3 min-w-0">
            <MobileNav
              items={mobileNav}
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

            <span className="sm:hidden font-semibold truncate">
              Counselor
            </span>
          </div>

          <SignOutButton variant="icon" />
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}