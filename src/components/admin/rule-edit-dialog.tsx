"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateClassificationRule } from "@/lib/actions/admin";
import { Pencil } from "lucide-react";

type Rule = {
  id: string;
  name: string;
  value: number | string;
  description: string | null;
};

export function RuleEditDialog({ rule }: { rule: Rule }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(String(rule.value));
  const [description, setDescription] = useState(rule.description ?? "");

  // FIX: tanpa ini, ngetik value baru lalu Cancel meninggalkan draft yang
  // belum tersimpan di state — dialog dibuka lagi nanti nampilin angka
  // draft itu, bukan angka asli dari DB. CareerFormDialog dan
  // CompetencyFormDialog sudah reset saat dibuka; dialog ini belum.
  function resetFromProp() {
    setValue(String(rule.value));
    setDescription(rule.description ?? "");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateClassificationRule({
        id: rule.id,
        value: Number(value),
        description,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) resetFromProp();
      }}
    >
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Pencil className="h-3.5 w-3.5 mr-1.5" />
        Edit
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit rule — {rule.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule-value">Threshold value (0–100)</Label>
            <Input
              id="rule-value"
              type="number"
              min={0}
              max={100}
              step={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule-desc">Description</Label>
            <Textarea
              id="rule-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving..." : "Save threshold"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}