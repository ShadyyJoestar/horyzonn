// src/components/counselor/share-with-counselor-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { shareAssessmentWithCounselor } from "@/lib/actions/share";
import { UserCheck } from "lucide-react";

export function ShareWithCounselorForm({
  assessmentId,
}: {
  assessmentId: string;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const res = await shareAssessmentWithCounselor({
      assessmentId,
      counselorEmail: email,
      message,
    });
    if (res.error) {
      setError(res.error);
      setState("idle");
    } else {
      setToken(res.token ?? null);
      setState("done");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserCheck className="h-4 w-4" /> Share with counselor
        </CardTitle>
        <CardDescription>
          Bagikan assessment ini secara privat ke counselor/mentor kamu. Mereka
          bisa melihat hasil, memberi catatan, dan menyusun development plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state === "done" ? (
          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-600">
            Assessment dibagikan ke counselor. Mereka bisa mengaksesnya lewat
            dashboard counselor dengan link ini:{" "}
            <code className="text-xs break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}
              /share/{token}
            </code>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="counselorEmail">Counselor email</Label>
              <Input
                id="counselorEmail"
                type="email"
                placeholder="counselor@school.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={state === "loading"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareMessage">Pesan (opsional)</Label>
              <Textarea
                id="shareMessage"
                placeholder="Ceritakan konteksnya… (mis. saya bingung memilih antara backend dan fullstack)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                disabled={state === "loading"}
              />
            </div>
            <Button type="submit" size="sm" disabled={state === "loading"}>
              {state === "loading" ? "Sharing…" : "Share privately"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}