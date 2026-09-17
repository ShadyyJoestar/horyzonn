"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runAcademicAssessment } from "@/lib/actions/academic";

// Deteksi redirect error Next.js secara robust (digest ATAU message)
function isNextNavigationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { digest, message } = error as { digest?: unknown; message?: unknown };
  return (
    (typeof digest === "string" &&
      (digest.includes("NEXT_REDIRECT") || digest.includes("NEXT_NOT_FOUND"))) ||
    (typeof message === "string" &&
      (message.includes("NEXT_REDIRECT") || message.includes("NEXT_NOT_FOUND")))
  );
}

export function RunAcademicButton({
  label = "Classify Academic Profile",
}: {
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const result = await runAcademicAssessment();
              // Error bisnis sekarang return object, bukan throw
              if (result && "error" in result && result.error) {
                setError(result.error);
              }
            } catch (e) {
              // Redirect error Next.js wajib re-throw supaya navigasi jalan
              if (isNextNavigationError(e)) throw e;
              console.error(e);
              setError(e instanceof Error ? e.message : "Failed to run classification");
            }
          });
        }}
      >
        {pending ? "Classifying..." : label}
      </Button>
      {error && (
        <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
      )}
    </div>
  );
}