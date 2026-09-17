// src/components/assessment/feedback-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submitFeedback } from "@/lib/actions/feedback";
import { Star } from "lucide-react";

export function FeedbackForm({ assessmentId }: { assessmentId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [inaccurate, setInaccurate] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Pick a star rating first");
      return;
    }
    setState("loading");
    setError(null);
    const res = await submitFeedback({
      assessmentId,
      rating,
      comment,
      inaccurateDetails: rating <= 2 ? inaccurate : undefined,
    });
    if (res.error) {
      setError(res.error);
      setState("idle");
    } else {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback sent</CardTitle>
          <CardDescription>
            Thanks — your feedback feeds the evaluation system and helps improve
            the classification engine.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Was this assessment useful?</CardTitle>
        <CardDescription>
          Your feedback is part of the evaluation system (studi kasus §17).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1"
                aria-label={`Rate ${n}`}
              >
                <Star
                  className={`h-6 w-6 ${
                    n <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Comment (optional)</Label>
            <Textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What felt accurate or helpful?"
            />
          </div>

          {rating > 0 && rating <= 2 && (
            <div className="space-y-2">
              <Label>What felt inaccurate?</Label>
              <Textarea
                rows={2}
                value={inaccurate}
                onChange={(e) => setInaccurate(e.target.value)}
                placeholder="Tell us which part felt off..."
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="sm" disabled={state === "loading"}>
            {state === "loading" ? "Sending..." : "Send feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}