"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runAssessment } from "@/lib/actions/assesments";

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function RunAssessmentButton({
  careerId,
  label = "Run Assessment",
}: {
  careerId: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await runAssessment(careerId);
          } catch (e) {
            // Server Action redirect() throws NEXT_REDIRECT — must rethrow
            if (isNextRedirectError(e)) throw e;

            console.error(e);
            alert(e instanceof Error ? e.message : "Failed to run assessment");
          }
        });
      }}
    >
      {pending ? "Running analysis..." : label}
    </Button>
  );
}