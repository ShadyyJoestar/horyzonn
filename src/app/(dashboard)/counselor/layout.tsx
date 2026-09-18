import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role, email")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[counselor/layout] profile error:", profileError.message);
    }

    const role = profile?.role ?? "student";
    // enum DB cuma: student | counselor | admin (tidak ada mentor)
    if (role !== "counselor" && role !== "admin") {
      redirect("/dashboard");
    }

    const displayName =
      profile?.full_name || profile?.email || user.email || "Counselor";

    return (
      <div className="min-h-screen flex bg-background">
        <aside className="w-64 border-r border-border hidden md:flex flex-col p-4 gap-2">
          <div className="font-semibold mb-4">Horyzon · {role}</div>
          <Link href="/counselor" className="text-sm hover:underline">
            Overview
          </Link>
          <Link href="/counselor/students" className="text-sm hover:underline">
            Students
          </Link>
          <Link href="/counselor/shared" className="text-sm hover:underline">
            Shared with me
          </Link>
          <Link href="/dashboard" className="text-sm hover:underline mt-4">
            Student view
          </Link>
          {role === "admin" && (
            <Link href="/admin" className="text-sm hover:underline">
              Admin
            </Link>
          )}
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center px-4">
            <span className="font-medium truncate">{displayName}</span>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    );
  } catch (e) {
    console.error("[counselor/layout] FATAL:", e);
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Counselor layout error</h1>
        <pre className="mt-4 text-sm whitespace-pre-wrap">
          {e instanceof Error ? e.message : String(e)}
        </pre>
      </div>
    );
  }
}