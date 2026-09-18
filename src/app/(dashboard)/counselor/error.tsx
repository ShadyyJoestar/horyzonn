// src/app/(dashboard)/counselor/error.tsx
"use client";

import { Button } from "@/components/ui/button";

export default function CounselorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}