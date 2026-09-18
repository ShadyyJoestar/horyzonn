"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  BarChart3,
  Activity,
  Shield,
  GitCompare,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import type { LucideIcon } from "lucide-react";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  primary_focus: string | null;
}

/** Shared nav shape used by Sidebar + MobileNav */
export type StudentNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  /** alias for MobileNav which expects `label` */
  label: string;
};

/**
 * Exported so layout.tsx and MobileNav can reuse the same list.
 * FIX: previously declared as local const → TS2459 when imported.
 */
export const studentNav: StudentNavItem[] = [
  { name: "Overview", label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", label: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Careers", label: "Careers", href: "/dashboard/careers", icon: Briefcase },
  { name: "Compare", label: "Compare careers", href: "/dashboard/careers/compare", icon: GitCompare },
  { name: "Academic", label: "Academic", href: "/dashboard/academic", icon: GraduationCap },
  { name: "Assessment", label: "Assessment", href: "/dashboard/assessment", icon: BarChart3 },
  { name: "Progress", label: "Progress", href: "/dashboard/progress", icon: Activity },
  { name: "Share", label: "Share assessment", href: "/dashboard/share", icon: Share2 },
];

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
          H
        </div>
        <span className="text-lg font-semibold tracking-tight">Horyzon</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {studentNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        <div className="px-3">
          <p className="text-sm font-medium truncate">
            {profile?.full_name || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {profile?.email}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {profile?.role} · {profile?.primary_focus || "both"}
          </p>
        </div>

        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <Shield className="h-4 w-4" />
            Admin panel
          </Link>
        )}

        {(profile?.role === "counselor" || profile?.role === "mentor") && (
          <Link
            href="/counselor"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <Shield className="h-4 w-4" />
            Counselor panel
          </Link>
        )}

        <SignOutButton />
      </div>
    </aside>
  );
}