import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveLandingPath } from "@/lib/auth/landing";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Tanpa ?next=, tujuan default ditentukan dari role, bukan hardcode
      // "/dashboard" seperti sebelumnya.
      const destination =
        next ??
        (data.user ? await resolveLandingPath(supabase, data.user.id) : "/dashboard");
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}