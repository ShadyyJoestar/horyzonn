"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { NavLink } from "./nav-link";
import { SignOutButton } from "./sign-out-button";
import type { DashboardIconName } from "./nav-config";

export type NavItem = {
  href: string;
  label: string;
  icon: DashboardIconName;
};

type Props = {
  items: NavItem[];
  title: string;
  subtitle?: string;
  user?: {
    name: string;
    email?: string | null;
    role?: string;
  } | null;
};

export function MobileNav({
  items,
  title,
  subtitle,
  user,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-72 p-0 flex flex-col"
        >
          <SheetHeader className="h-16 justify-center border-b border-border px-6">
            <SheetTitle className="text-left">
              <span className="font-semibold">
                {title}
              </span>

              {subtitle && (
                <span className="block text-xs font-normal text-muted-foreground capitalize">
                  {subtitle}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                exact={
                  item.href === "/dashboard" ||
                  item.href === "/admin" ||
                  item.href === "/counselor"
                }
                onClick={() => setOpen(false)}
              />
            ))}
          </nav>

          <div className="border-t border-border p-4 space-y-3">
            {user && (
              <div className="px-3">
                <p className="text-sm font-medium truncate">
                  {user.name}
                </p>

                {user.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                )}
              </div>
            )}

            <SignOutButton />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}