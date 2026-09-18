import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { studentNav } from "@/components/dashboard/nav-config";

type Role = "student" | "counselor" | "admin";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, role, primary_focus"
    )
    .eq("id", user.id)
    .maybeSingle();

  const safeProfile = profile ?? {
    id: user.id,
    full_name:
      (user.user_metadata?.full_name as string) ??
      null,
    email: user.email ?? null,
    role: "student",
    primary_focus: null,
  };

  const role = safeProfile.role as Role;

  /**
   * Student navigation.
   *
   * Admin/counselor mendapatkan satu additional
   * navigation item untuk kembali ke panel role mereka.
   */
  const mobileItems = [...studentNav];

  if (role === "admin") {
    mobileItems.push({
      href: "/admin",
      label: "Back to Admin",
      icon: "Settings",
    });
  }

  if (role === "counselor") {
    mobileItems.push({
      href: "/counselor",
      label: "Back to Counselor",
      icon: "Users",
    });
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar profile={safeProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 h-14 gap-2">
          <MobileNav
            items={mobileItems}
            title="Horyzon"
            subtitle={safeProfile.role}
            user={{
              name:
                safeProfile.full_name ??
                "User",
              email: safeProfile.email,
              role: safeProfile.role,
            }}
          />

          <span className="font-semibold flex-1 text-center truncate">
            Horyzon
          </span>

          <SignOutButton variant="icon" />
        </div>

        <Header profile={safeProfile} />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}