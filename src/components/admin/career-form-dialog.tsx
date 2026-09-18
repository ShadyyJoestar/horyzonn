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
import { createCareer, updateCareer } from "@/lib/actions/admin";
import { Plus, Pencil } from "lucide-react";

type Career = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

export function CareerFormDialog({
  mode,
  career,
}: {
  mode: "create" | "edit";
  career?: Career;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(career?.name ?? "");
  const [slug, setSlug] = useState(career?.slug ?? "");
  const [description, setDescription] = useState(career?.description ?? "");
  const [isActive, setIsActive] = useState(career?.is_active ?? true);

  function resetFromProp() {
    setName(career?.name ?? "");
    setSlug(career?.slug ?? "");
    setDescription(career?.description ?? "");
    setIsActive(career?.is_active ?? true);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCareer({ name, slug, description, is_active: isActive })
          : await updateCareer({
              id: career!.id,
              name,
              slug,
              description,
              is_active: isActive,
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
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant={mode === "create" ? "default" : "outline"}
          />
        }
      >
        {mode === "create" ? (
          <>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add career
          </>
        ) : (
          <>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add career" : "Edit career"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="career-name">Name</Label>
            <Input
              id="career-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full-Stack Developer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="career-slug">Slug</Label>
            <Input
              id="career-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="full-stack-developer (auto jika kosong)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="career-desc">Description</Label>
            <Textarea
              id="career-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ringkas deskripsi career..."
              rows={3}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-input"
            />
            Active (tampil di career library student)
          </label>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

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
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}