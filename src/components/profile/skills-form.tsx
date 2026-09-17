// src/components/profile/skills-form.tsx
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
import { LevelPicker } from "@/components/profile/level-picker";
import type { RubricLevel } from "@/lib/classification/level-rubric";
import { Pencil, Trash2 } from "lucide-react";

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
  rubricsByCategory,
}: {
  userId: string;
  allCompetencies: Competency[];
  userCompetencies: UserCompetency[];
  rubricsByCategory: Record<string, RubricLevel[]>;
}) {
  const [userCompetencies, setUserCompetencies] = useState(initial);
  const [selectedCompetency, setSelectedCompetency] = useState("");
  const [level, setLevel] = useState(3);
  const [evidence, setEvidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedCategory =
    allCompetencies.find((c) => c.id === selectedCompetency)?.category || "";

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCompetency) return;

    if (level >= 4 && !evidence.trim()) {
      setMessage(
        "Level 4–5 needs evidence (studi kasus §22: no self-rating without context)."
      );
      return;
    }

    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("user_competencies")
      .insert({
        user_id: userId,
        competency_id: selectedCompetency,
        level,
        evidence: evidence.trim() || null,
      })
      .select("*, competencies(id, name, category)")
      .single();

    if (error) {
      setMessage(error.message);
    } else if (data) {
      setUserCompetencies((prev) => [...prev, data]);
      setSelectedCompetency("");
      setLevel(3);
      setEvidence("");
      setMessage("Skill added");
    }
    setLoading(false);
  }

  async function handleUpdateLevel(id: string, newLevel: number, ev: string | null) {
    if (newLevel >= 4 && !ev?.trim()) {
      setMessage("Level 4–5 needs evidence. Describe a project, competition, or proof.");
      return;
    }
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("user_competencies")
      .update({ level: newLevel })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setUserCompetencies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, level: newLevel } : c))
      );
      setEditingId(null);
      setMessage("Level updated — run a reassessment to see progress");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("user_competencies").delete().eq("id", id);
    if (!error) {
      setUserCompetencies((prev) => prev.filter((c) => c.id !== id));
    } else {
      setMessage(error.message);
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
            Self-rated levels guided by rubrics. Update a level after you improve,
            then reassess to track progress.
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
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">
                      {uc.competencies?.name || "Unknown"}
                      <span className="ml-2 text-xs text-muted-foreground capitalize">
                        {uc.competencies?.category}
                      </span>
                    </p>
                    {editingId === uc.id ? (
                      <div className="mt-2 max-w-xs">
                        <LevelPicker
                          rubrics={
                            rubricsByCategory[uc.competencies?.category || ""] ||
                            rubricsByCategory["general"]
                          }
                          value={uc.level}
                          onSelect={(l) => handleUpdateLevel(uc.id, l, uc.evidence)}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Level {uc.level}
                      </p>
                    )}
                    {uc.evidence && (
                      <p className="text-xs text-muted-foreground mt-1">
                        🧾 {uc.evidence}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingId(editingId === uc.id ? null : uc.id)
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(uc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Skill</CardTitle>
          <CardDescription>
            Tap the level button to see what each level means before choosing.
          </CardDescription>
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
                  {available.length === 0 && (
                    <SelectItem value="__none" disabled>
                      All competencies added
                    </SelectItem>
                  )}
                  {available.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level — what does it mean?</Label>
              <LevelPicker
                rubrics={
                  rubricsByCategory[selectedCategory] ||
                  rubricsByCategory["general"]
                }
                value={level}
                onSelect={setLevel}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Evidence{" "}
                {level >= 4 && <span className="text-destructive">(required for Lv4–5)</span>}
              </Label>
              <Textarea
                placeholder="e.g. Built 3 full-stack projects using Next.js & Supabase; 2nd place at FTP vibe coding 2026"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                rows={2}
              />
            </div>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("added") || message.includes("updated")
                    ? "text-green-600"
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