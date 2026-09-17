// src/app/(dashboard)/dashboard/error.tsx
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
    <div className="flex flex-col items-start gap-4 max-w-lg">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Unexpected error while loading this page."}
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={reset}>Try again</Button>
        <Button size="sm" variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}