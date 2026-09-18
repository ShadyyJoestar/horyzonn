"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

import { studentNav } from "./nav-config";
import { getDashboardIcon } from "./nav-icons";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  primary_focus: string | null;
}

export { studentNav } from "./nav-config";

export function Sidebar({
  profile,
}: {
  profile: Profile | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
          H
        </div>

        <span className="text-lg font-semibold tracking-tight">
          Horyzon
        </span>
      </div>

      {/* Student navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {studentNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href));

          const Icon = getDashboardIcon(
            item.icon
          );

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
              <Icon className="h-4 w-4 shrink-0" />

              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User / role navigation */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="px-3">
          <p className="text-sm font-medium truncate">
            {profile?.full_name || "User"}
          </p>

          <p className="text-xs text-muted-foreground truncate">
            {profile?.email}
          </p>

          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {profile?.role} ·{" "}
            {profile?.primary_focus || "both"}
          </p>
        </div>

        {/* ADMIN → BACK TO ADMIN PANEL */}
        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <Shield className="h-4 w-4" />

            Back to Admin
          </Link>
        )}

        {/* COUNSELOR → BACK TO COUNSELOR PANEL */}
        {profile?.role === "counselor" && (
          <Link
            href="/counselor"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <Shield className="h-4 w-4" />

            Back to Counselor
          </Link>
        )}

        <SignOutButton />
      </div>
    </aside>
  );
}