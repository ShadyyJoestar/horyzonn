"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

interface Profile {
  full_name: string | null;
  role: string;
}

export function Header({ profile }: { profile: Profile | null }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div>
        <h1 className="text-lg font-semibold">
          Welcome back
          {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <SignOutButton variant="icon" />
      </div>
    </header>
  );
}