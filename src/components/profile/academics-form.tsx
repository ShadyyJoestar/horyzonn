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

interface AcademicData {
  id?: string;
  mathematics?: number | null;
  english?: number | null;
  science?: number | null;
  indonesian?: number | null;
  social_studies?: number | null;
  vocational?: number | null;
}

export function AcademicForm({
  userId,
  initialData,
}: {
  userId: string;
  initialData: AcademicData | null;
}) {
  const [form, setForm] = useState({
    mathematics: initialData?.mathematics ?? "",
    english: initialData?.english ?? "",
    science: initialData?.science ?? "",
    indonesian: initialData?.indonesian ?? "",
    social_studies: initialData?.social_studies ?? "",
    vocational: initialData?.vocational ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    const payload = {
      user_id: userId,
      mathematics: form.mathematics === "" ? null : Number(form.mathematics),
      english: form.english === "" ? null : Number(form.english),
      science: form.science === "" ? null : Number(form.science),
      indonesian: form.indonesian === "" ? null : Number(form.indonesian),
      social_studies: form.social_studies === "" ? null : Number(form.social_studies),
      vocational: form.vocational === "" ? null : Number(form.vocational),
      updated_at: new Date().toISOString(),
    };

    let error;
    if (initialData?.id) {
      ({ error } = await supabase
        .from("academic_records")
        .update(payload)
        .eq("id", initialData.id));
    } else {
      ({ error } = await supabase.from("academic_records").insert(payload));
    }

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Academic data saved successfully");
    }
    setLoading(false);
  }

  const fields = [
    { key: "mathematics", label: "Mathematics" },
    { key: "english", label: "English" },
    { key: "science", label: "Science" },
    { key: "indonesian", label: "Indonesian" },
    { key: "social_studies", label: "Social Studies" },
    { key: "vocational", label: "Vocational Subjects" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Performance</CardTitle>
        <CardDescription>
          Enter your scores (0–100). Leave blank if not applicable.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0–100"
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  disabled={loading}
                />
              </div>
            ))}
          </div>

          {message && (
            <p className={`text-sm ${message.includes("success") ? "text-green-500" : "text-destructive"}`}>
              {message}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Academic Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}