"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleCareerActive } from "@/lib/actions/admin";

export function ToggleCareerActive({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleCareerActive(id, !isActive);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? "..." : isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}