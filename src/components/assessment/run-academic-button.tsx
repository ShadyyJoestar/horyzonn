"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runAcademicAssessment } from "@/lib/actions/academic";

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function RunAcademicButton({
  label = "Classify Academic Profile",
}: {
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await runAcademicAssessment();
          } catch (e) {
            if (isNextRedirectError(e)) throw e;
            console.error(e);
            alert(e instanceof Error ? e.message : "Failed to run classification");
          }
        });
      }}
    >
      {pending ? "Classifying..." : label}
    </Button>
  );
}