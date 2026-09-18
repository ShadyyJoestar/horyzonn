"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/lib/actions/admin";

const ROLES = ["student", "counselor", "admin"] as const;

export function RoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as (typeof ROLES)[number];
    if (role === currentRole) return;

    startTransition(async () => {
      const result = await updateUserRole({ userId, role });
      if (result.error) {
        alert(result.error);
        e.target.value = currentRole;
        return;
      }
      router.refresh();
    });
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={onChange}
      disabled={pending}
      className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}