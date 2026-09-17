"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Competency {
  id: string;
  name: string;
  category: string;
}

interface UserCompetency {
  id: string;
  competency_id: string;
  level: number;
  evidence: string | null;
  competencies?: { id: string; name: string; category: string };
}

export function SkillsForm({
  userId,
  allCompetencies,
  userCompetencies: initial,
}: {
  userId: string;
  allCompetencies: Competency[];
  userCompetencies: UserCompetency[];
}) {
  const [userCompetencies, setUserCompetencies] = useState(initial);
  const [selectedCompetency, setSelectedCompetency] = useState("");
  const [level, setLevel] = useState("3");
  const [evidence, setEvidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCompetency) return;

    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("user_competencies")
      .insert({
        user_id: userId,
        competency_id: selectedCompetency,
        level: Number(level),
        evidence: evidence || null,
      })
      .select("*, competencies(id, name, category)")
      .single();

    if (error) {
      setMessage(error.message);
    } else if (data) {
      setUserCompetencies((prev) => [...prev, data]);
      setSelectedCompetency("");
      setLevel("3");
      setEvidence("");
      setMessage("Skill added");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_competencies")
      .delete()
      .eq("id", id);
    if (!error) {
      setUserCompetencies((prev) => prev.filter((c) => c.id !== id));
    }
  }

  const alreadyAdded = new Set(userCompetencies.map((c) => c.competency_id));
  const available = allCompetencies.filter((c) => !alreadyAdded.has(c.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Skills</CardTitle>
          <CardDescription>
            Level 1 (Beginner) → 5 (Expert). Add evidence for better confidence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userCompetencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills added yet.</p>
          ) : (
            <div className="space-y-3">
              {userCompetencies.map((uc) => (
                <div
                  key={uc.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {uc.competencies?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {uc.competencies?.category} · Level {uc.level}
                    </p>
                    {uc.evidence && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {uc.evidence}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(uc.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Competency</Label>
              <Select
                value={selectedCompetency}
                onValueChange={(v) => setSelectedCompetency(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a competency" />
                </SelectTrigger>
                <SelectContent>
                  {available.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level (1–5)</Label>
              <Select
                value={level}
                onValueChange={(v) => setLevel(v ?? "3")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}{" "}
                      {n === 1 ? "(Beginner)" : n === 5 ? "(Expert)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Evidence (optional)</Label>
              <Textarea
                placeholder="e.g. Built 3 full-stack projects using Next.js & Supabase"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                rows={2}
              />
            </div>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("added")
                    ? "text-green-500"
                    : "text-destructive"
                }`}
              >
                {message}
              </p>
            )}

            <Button type="submit" disabled={loading || !selectedCompetency}>
              {loading ? "Adding..." : "Add Skill"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}