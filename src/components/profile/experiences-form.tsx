"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Experience {
  id: string;
  type: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
}

const EXPERIENCE_TYPES = [
  { value: "project", label: "Project" },
  { value: "organization", label: "Organization" },
  { value: "internship", label: "Internship" },
  { value: "certification", label: "Certification" },
  { value: "competition", label: "Competition" },
];

export function ExperiencesForm({
  userId,
  initialData,
}: {
  userId: string;
  initialData: Experience[];
}) {
  const [experiences, setExperiences] = useState(initialData);
  const [type, setType] = useState("project");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("experiences")
      .insert({
        user_id: userId,
        type,
        title: title.trim(),
        description: description.trim() || null,
      })
      .select()
      .single();

    if (error) {
      setMessage(error.message);
    } else if (data) {
      setExperiences((prev) => [data, ...prev]);
      setTitle("");
      setDescription("");
      setMessage("Experience added");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (!error) {
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Experiences</CardTitle>
          <CardDescription>
            Projects, organizations, internships, certifications, competitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No experiences added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{exp.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {exp.type}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(exp.id)}
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
          <CardTitle>Add Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v ?? "project")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Built Horyzon MVP"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Adding..." : "Add Experience"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}