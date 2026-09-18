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
import { createCompetency, updateCompetency } from "@/lib/actions/admin";
import { Plus, Pencil } from "lucide-react";

type Competency = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
};

export function CompetencyFormDialog({
  mode,
  competency,
}: {
  mode: "create" | "edit";
  competency?: Competency;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(competency?.name ?? "");
  const [slug, setSlug] = useState(competency?.slug ?? "");
  const [category, setCategory] = useState(competency?.category ?? "technical");
  const [description, setDescription] = useState(
    competency?.description ?? ""
  );

  function resetFromProp() {
    setName(competency?.name ?? "");
    setSlug(competency?.slug ?? "");
    setCategory(competency?.category ?? "technical");
    setDescription(competency?.description ?? "");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCompetency({ name, slug, category, description })
          : await updateCompetency({
              id: competency!.id,
              name,
              slug,
              category,
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
            Add competency
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
            {mode === "create" ? "Add competency" : "Edit competency"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comp-name">Name</Label>
            <Input
              id="comp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Programming"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comp-slug">Slug</Label>
            <Input
              id="comp-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="programming"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comp-cat">Category</Label>
            <Input
              id="comp-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="technical | creative | analytical | communication"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comp-desc">Description</Label>
            <Textarea
              id="comp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}