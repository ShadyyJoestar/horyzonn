"use client";

import { useTransition } from "react";
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

  return (
    <Button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await runAssessment(careerId);
          } catch (e) {
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