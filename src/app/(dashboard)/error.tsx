// src/app/(dashboard)/error.tsx
"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="space-y-4 max-w-lg text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground break-words">
          {error.message}
        </p>
        <Button size="sm" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}