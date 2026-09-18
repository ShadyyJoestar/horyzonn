// src/components/assessment/share-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createShareLink,
  revokeShareLink,
  shareAssessmentWithCounselor,
} from "@/lib/actions/share";
import { Share2, Copy, Check, ShieldOff, Send } from "lucide-react";

export function ShareButton({
  assessmentId,
  existingToken,
}: {
  assessmentId: string;
  existingToken: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(existingToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [counselorEmail, setCounselorEmail] = useState("");
  const [message, setMessage] = useState("");

  const shareUrl = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${token}`
    : null;

  async function handleCreate() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await createShareLink(assessmentId);
    if (res.error) setError(res.error);
    else if (res.token) {
      setToken(res.token);
      setSuccess("Link share berhasil dibuat.");
    }
    setLoading(false);
  }

  async function handleRevoke() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await revokeShareLink(assessmentId);
    if (res.error) setError(res.error);
    else {
      setToken(null);
      setSuccess("Link di-revoke.");
    }
    setLoading(false);
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShareToCounselor(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await shareAssessmentWithCounselor({
      assessmentId,
      counselorEmail,
      message: message.trim() || undefined,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccess(
      `Assessment berhasil dikirim ke counselor (${counselorEmail}).`
    );
    setCounselorEmail("");
    setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        }
        nativeButton={false}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share assessment</DialogTitle>
          <DialogDescription>
            Buat link publik, atau kirim langsung ke email counselor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Link publik */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Share link (read-only)</p>
            {shareUrl ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input readOnly value={shareUrl} className="flex-1" />
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRevoke}
                  disabled={loading}
                >
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Revoke link
                </Button>
              </div>
            ) : (
              <Button onClick={handleCreate} disabled={loading} size="sm">
                {loading ? "Creating..." : "Create share link"}
              </Button>
            )}
          </div>

          <div className="border-t" />

          {/* Langsung ke counselor */}
          <form onSubmit={handleShareToCounselor} className="space-y-3">
            <p className="text-sm font-medium">Kirim ke counselor</p>
            <div className="space-y-1.5">
              <Label htmlFor="counselor-email">Email counselor</Label>
              <Input
                id="counselor-email"
                type="email"
                required
                value={counselorEmail}
                onChange={(e) => setCounselorEmail(e.target.value)}
                placeholder="counselor@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="share-message">Pesan (opsional)</Label>
              <Textarea
                id="share-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tolong review assessment saya..."
                rows={2}
              />
            </div>
            <Button type="submit" disabled={loading || !counselorEmail.trim()}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Mengirim..." : "Kirim ke counselor"}
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-600">{success}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}