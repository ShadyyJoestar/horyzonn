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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  primary_focus: string | null;
}

const studentNav = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Careers", href: "/dashboard/careers", icon: Briefcase },
  { name: "Academic", href: "/dashboard/academic", icon: GraduationCap },
  { name: "Assessment", href: "/dashboard/assessment", icon: BarChart3 },
  { name: "Progress", href: "/dashboard/progress", icon: Activity },
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

      <nav className="flex-1 p-4 space-y-1">
        {studentNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
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

        <SignOutButton />
      </div>
    </aside>
  );
}