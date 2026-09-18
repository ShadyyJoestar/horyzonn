"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { getDashboardIcon } from "./nav-icons";
import type { DashboardIconName } from "./nav-config";

type Props = {
  href: string;
  label: string;
  icon: DashboardIconName;
  exact?: boolean;
  onClick?: () => void;
};

export function NavLink({
  href,
  label,
  icon,
  exact = false,
  onClick,
}: Props) {
  const pathname = usePathname();

  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  const Icon = getDashboardIcon(icon);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />

      {label}
    </Link>
  );
}