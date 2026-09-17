"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FocusOption = "academic" | "career" | "both";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [primaryFocus, setPrimaryFocus] = useState<FocusOption>("both");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          primary_focus: primaryFocus,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">Create account</CardTitle>
        <CardDescription>
          Build your profile and start exploring your next horizon
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {/* Primary Focus */}
          <div className="space-y-3">
            <Label>What are you looking for?</Label>
            <div className="grid gap-2">
              <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 has-[:checked]:border-foreground has-[:checked]:bg-muted/30">
                <input
                  type="radio"
                  name="focus"
                  value="academic"
                  checked={primaryFocus === "academic"}
                  onChange={() => setPrimaryFocus("academic")}
                  className="mt-1"
                  disabled={loading}
                />
                <div>
                  <p className="font-medium text-sm">Academic Path</p>
                  <p className="text-xs text-muted-foreground">
                    Looking for college major / education path
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 has-[:checked]:border-foreground has-[:checked]:bg-muted/30">
                <input
                  type="radio"
                  name="focus"
                  value="career"
                  checked={primaryFocus === "career"}
                  onChange={() => setPrimaryFocus("career")}
                  className="mt-1"
                  disabled={loading}
                />
                <div>
                  <p className="font-medium text-sm">Career Path</p>
                  <p className="text-xs text-muted-foreground">
                    Looking for career readiness & skill gaps
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 has-[:checked]:border-foreground has-[:checked]:bg-muted/30">
                <input
                  type="radio"
                  name="focus"
                  value="both"
                  checked={primaryFocus === "both"}
                  onChange={() => setPrimaryFocus("both")}
                  className="mt-1"
                  disabled={loading}
                />
                <div>
                  <p className="font-medium text-sm">Both</p>
                  <p className="text-xs text-muted-foreground">
                    Explore education paths and career readiness
                  </p>
                </div>
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}