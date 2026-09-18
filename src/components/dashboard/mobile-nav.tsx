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
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** optional alias used by studentNav */
  name?: string;
};

type Props = {
  items: NavItem[];
  title: string;
  subtitle?: string;
  user?: { name: string; email?: string | null; role?: string } | null;
};

/**
 * Mobile drawer navigation.
 * FIX:
 *  - SheetTrigger no longer uses `asChild` (Base UI Dialog Trigger does not
 *    expose that prop the same way as Radix → TS2322).
 *  - Accepts both `label` and `name` so studentNav / counselorNav both work.
 *  - Sign-out always present in the drawer footer.
 */
export function MobileNav({ items, title, subtitle, user }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* No asChild — Base UI Trigger accepts children directly */}
        <SheetTrigger
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="h-16 justify-center border-b border-border px-6">
            <SheetTitle className="text-left">
              <span className="font-semibold">{title}</span>
              {subtitle && (
                <span className="block text-xs font-normal text-muted-foreground capitalize">
                  {subtitle}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {items.map((item) => {
              const label = item.label || item.name || item.href;
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={label}
                  icon={item.icon}
                  exact={
                    item.href === "/dashboard" ||
                    item.href === "/admin" ||
                    item.href === "/counselor"
                  }
                  onClick={close}
                />
              );
            })}
          </nav>

          <div className="border-t border-border p-4 space-y-3">
            {user && (
              <div className="px-3">
                <p className="text-sm font-medium truncate">{user.name}</p>
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