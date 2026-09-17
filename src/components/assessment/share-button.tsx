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
import {
  createShareLink,
  revokeShareLink,
} from "@/lib/actions/share";
import { Share2, Copy, Check, ShieldOff } from "lucide-react";

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

  const shareUrl = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${token}`
    : null;

  async function handleCreate() {
    setLoading(true);
    setError(null);
    const res = await createShareLink(assessmentId);
    if (res.error) setError(res.error);
    else if (res.token) setToken(res.token);
    setLoading(false);
  }

  async function handleRevoke() {
    setLoading(true);
    setError(null);
    const res = await revokeShareLink(assessmentId);
    if (res.error) setError(res.error);
    else setToken(null);
    setLoading(false);
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <DialogTitle>Share with mentor / counselor</DialogTitle>
          <DialogDescription>
            Anyone with this link can view this assessment (read-only). Links
            expire after 30 days and you can revoke anytime.
          </DialogDescription>
        </DialogHeader>

        {shareUrl ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={shareUrl} className="flex-1" />
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create share link"}
          </Button>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}