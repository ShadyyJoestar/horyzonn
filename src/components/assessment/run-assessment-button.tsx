"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runAssessment } from "@/lib/actions/assesments";

export function RunAssessmentButton({
  careerId,
  label = "Run Assessment",
}: {
  careerId: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        disabled={pending || !careerId}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            // Jangan wrap redirect dengan logic yang menelan error
            const result = await runAssessment(careerId);
            // Kalau action return error object (lihat bawah)
            if (result && "error" in result && result.error) {
              setError(result.error);
            }
          });
        }}
      >
        {pending ? "Running analysis..." : label}
      </Button>
      {error && (
        <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
      )}
    </div>
  );
}