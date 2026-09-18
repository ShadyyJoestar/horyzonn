"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

interface Profile {
  full_name: string | null;
  role: string;
}

export function Header({ profile }: { profile: Profile | null }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6 gap-2">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold truncate">
          Welcome back
          {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
      </div>

      {/* Sign out SELALU visible di header (desktop & mobile) —
          sebelumnya cuma icon kecil di samping yang gampang "hilang"
          karena buta warna/overflow */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
        <span className="hidden sm:inline text-xs text-muted-foreground capitalize">
          {profile?.role}
        </span>
        <SignOutButton variant="icon" />
      </div>
    </header>
  );
}