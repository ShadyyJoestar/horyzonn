"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Interest {
  id: string;
  interest: string;
}

const SUGGESTED = [
  "Software Development",
  "Game Development",
  "Data Science",
  "UI/UX Design",
  "Cybersecurity",
  "Business",
  "Engineering",
  "Research",
  "Product Management",
  "Artificial Intelligence",
];

export function InterestsForm({
  userId,
  initialData,
}: {
  userId: string;
  initialData: Interest[];
}) {
  const [interests, setInterests] = useState(initialData);
  const [newInterest, setNewInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd(value: string) {
    if (!value.trim()) return;
    if (interests.some((i) => i.interest.toLowerCase() === value.trim().toLowerCase())) {
      setMessage("Interest already added");
      return;
    }

    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_interests")
      .insert({ user_id: userId, interest: value.trim() })
      .select()
      .single();

    if (error) {
      setMessage(error.message);
    } else if (data) {
      setInterests((prev) => [...prev, data]);
      setNewInterest("");
      setMessage("Interest added");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("user_interests").delete().eq("id", id);
    if (!error) {
      setInterests((prev) => prev.filter((i) => i.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Interests</CardTitle>
          <CardDescription>
            What fields are you interested in exploring?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interests.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-4">No interests added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {interests.map((i) => (
                <span
                  key={i.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm"
                >
                  {i.interest}
                  <button
                    onClick={() => handleDelete(i.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED.filter(
              (s) => !interests.some((i) => i.interest.toLowerCase() === s.toLowerCase())
            ).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAdd(s)}
                disabled={loading}
                className="rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label className="sr-only">Custom interest</Label>
              <Input
                placeholder="Add custom interest..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd(newInterest);
                  }
                }}
              />
            </div>
            <Button
              type="button"
              onClick={() => handleAdd(newInterest)}
              disabled={loading || !newInterest.trim()}
            >
              Add
            </Button>
          </div>

          {message && (
            <p className={`text-sm mt-3 ${message.includes("added") ? "text-green-500" : "text-destructive"}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}