"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Target,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  primary_focus?: string | null;
}

const studentNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/profile", icon: User },
  { name: "Career Assessment", href: "/assessment", icon: Target },
  { name: "Academic Path", href: "/academic", icon: BookOpen },
  { name: "Progress", href: "/progress", icon: BarChart3 },
];

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
          H
        </div>
        <span className="text-lg font-semibold tracking-tight">Horyzon</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {studentNav.map((item) => {
          const isActive = pathname === item.href;
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

      {/* User + Logout */}
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

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}