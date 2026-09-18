"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitCounselorQuestion } from "@/lib/actions/questions";

export function AskCounselorForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await submitCounselorQuestion({
      subject: subject.trim() || undefined,
      question,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccess(true);
    setSubject("");
    setQuestion("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject (opsional)</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Misal: Pilihan karier UI/UX"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">Pertanyaan</Label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Tulis pertanyaan kamu untuk counselor. Tidak perlu memilih counselor — pertanyaan masuk ke pool dan bisa dijawab counselor mana saja."
          rows={5}
          required
          maxLength={4000}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-600">
          Pertanyaan terkirim. Counselor akan membalas di sini.
        </p>
      )}

      <Button type="submit" disabled={loading || !question.trim()}>
        {loading ? "Mengirim..." : "Kirim pertanyaan"}
      </Button>
    </form>
  );
}