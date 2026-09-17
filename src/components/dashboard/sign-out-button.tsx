"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  /** "full" = sidebar style (default), "icon" = header compact */
  variant?: "full" | "icon";
  className?: string;
};

export function SignOutButton({ variant = "full", className }: Props) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        title="Sign out"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
          className
        )}
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign out</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}