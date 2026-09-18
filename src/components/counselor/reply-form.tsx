"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  replyToCounselorQuestion,
  closeCounselorQuestion,
} from "@/lib/actions/questions";

export function CounselorReplyForm({
  questionId,
  status,
}: {
  questionId: string;
  status: string;
}) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await replyToCounselorQuestion({
      questionId,
      reply,
    });

    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    setReply("");
    router.refresh();
  }

  async function handleClose() {
    setLoading(true);
    setError(null);
    const res = await closeCounselorQuestion(questionId);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleReply} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="reply">Balasan</Label>
          <Textarea
            id="reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Tulis jawaban untuk siswa..."
            rows={4}
            required
            maxLength={5000}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={loading || !reply.trim()}>
            {loading ? "Mengirim..." : "Kirim balasan"}
          </Button>

          {status !== "closed" && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleClose}
            >
              Tutup pertanyaan
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}