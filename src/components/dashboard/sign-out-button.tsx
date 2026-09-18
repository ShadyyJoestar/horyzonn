"use client";

import { useState, useTransition } from "react";
import { Loader2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  /** "full" = sidebar style, "icon" = header compact */
  variant?: "full" | "icon";
  className?: string;
};

export function SignOutButton({ variant = "full", className }: Props) {
  const [pending, startTransition] = useTransition();
  const [showError, setShowError] = useState(false);

  function handleLogout() {
    if (pending) return;
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch {
        // Session mungkin sudah expired — tetap lanjut ke login.
        setShowError(true);
      } finally {
        // HARD navigation (bukan router.push): memaksa middleware
        // membaca cookie kosong, jadi user TIDAK bisa nyangkut
        // di halaman protected. Ini yang bikin tombol sign out
        // sebelumnya "terasa hilang" saat request signOut gagal.
        window.location.href = "/login";
      }
    });
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        disabled={pending}
        title={showError ? "Sign out (session expired)" : "Sign out"}
        aria-label="Sign out"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg",
          "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
          "disabled:opacity-50",
          className
        )}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        <span className="sr-only">Sign out</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
        "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        "disabled:opacity-50",
        className
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}