"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addCareerCompetency,
  updateCareerCompetency,
  removeCareerCompetency,
} from "@/lib/actions/admin";
import { Plus, Trash2, Save } from "lucide-react";

type CompetencyOption = {
  id: string;
  name: string;
  category: string | null;
};

type Requirement = {
  id: string;
  competency_id: string;
  required_level: number;
  weight: number;
  is_core: boolean;
  competencies?: { id: string; name: string; category?: string } | null;
};

export function CareerRequirementsManager({
  careerId,
  careerName,
  requirements: initialRequirements,
  allCompetencies,
}: {
  careerId: string;
  careerName: string;
  requirements: Requirement[];
  allCompetencies: CompetencyOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // form tambah
  const [competencyId, setCompetencyId] = useState("");
  const [requiredLevel, setRequiredLevel] = useState(3);
  const [weight, setWeight] = useState(1);
  const [isCore, setIsCore] = useState(true);

  // edit inline state: id -> draft
  const [drafts, setDrafts] = useState<
    Record<string, { requiredLevel: number; weight: number; isCore: boolean }>
  >({});

  const linkedIds = useMemo(
    () => new Set(initialRequirements.map((r) => r.competency_id)),
    [initialRequirements]
  );

  const availableCompetencies = allCompetencies.filter(
    (c) => !linkedIds.has(c.id)
  );

  function getDraft(req: Requirement) {
    return (
      drafts[req.id] ?? {
        requiredLevel: req.required_level,
        weight: Number(req.weight),
        isCore: !!req.is_core,
      }
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!competencyId) {
      setError("Pilih competency dulu");
      return;
    }

    startTransition(async () => {
      const result = await addCareerCompetency({
        careerId,
        competencyId,
        requiredLevel,
        weight,
        isCore,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setCompetencyId("");
      setRequiredLevel(3);
      setWeight(1);
      setIsCore(true);
      setMessage("Requirement ditambahkan — engine akan memakai ini di assessment berikutnya.");
      router.refresh();
    });
  }

  function handleSave(req: Requirement) {
    const draft = getDraft(req);
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await updateCareerCompetency({
        id: req.id,
        careerId,
        requiredLevel: draft.requiredLevel,
        weight: draft.weight,
        isCore: draft.isCore,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage("Requirement diupdate.");
      router.refresh();
    });
  }

  function handleRemove(req: Requirement) {
    if (!confirm(`Hapus requirement "${req.competencies?.name || req.competency_id}"?`)) {
      return;
    }
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await removeCareerCompetency({
        id: req.id,
        careerId,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage("Requirement dihapus.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Competency requirements</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Inilah yang dibaca classification engine untuk{" "}
          <span className="font-medium text-foreground">{careerName}</span>.
          Weight menentukan seberapa besar pengaruh competency terhadap readiness score.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
          {message}
        </p>
      )}

      {/* List existing */}
      <div className="grid gap-3">
        {initialRequirements.map((req) => {
          const draft = getDraft(req);
          const name =
            req.competencies?.name ||
            allCompetencies.find((c) => c.id === req.competency_id)?.name ||
            req.competency_id;

          return (
            <Card key={req.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {req.competency_id.slice(0, 8)}…
                    </p>
                  </div>
                  {draft.isCore && <Badge>Core</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Required level (1–5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={draft.requiredLevel}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [req.id]: {
                            ...draft,
                            requiredLevel: Number(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Weight</Label>
                    <Input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={draft.weight}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [req.id]: {
                            ...draft,
                            weight: Number(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={draft.isCore}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [req.id]: {
                              ...draft,
                              isCore: e.target.checked,
                            },
                          }))
                        }
                      />
                      Core competency
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => handleSave(req)}
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => handleRemove(req)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {initialRequirements.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Belum ada requirement. Assessment untuk career ini akan gagal sampai
              minimal satu competency di-link di sini.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add requirement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Competency</Label>
              <select
                value={competencyId}
                onChange={(e) => setCompetencyId(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              >
                <option value="">Pilih competency…</option>
                {availableCompetencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.category ? ` (${c.category})` : ""}
                  </option>
                ))}
              </select>
              {availableCompetencies.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Semua competency sudah terhubung, atau master list masih kosong.
                  Tambah competency dulu di menu Competencies.
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Required level</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={requiredLevel}
                  onChange={(e) => setRequiredLevel(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  required
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isCore}
                    onChange={(e) => setIsCore(e.target.checked)}
                  />
                  Core competency
                </label>
              </div>
            </div>

            <Button type="submit" size="sm" disabled={pending || !competencyId}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {pending ? "Saving..." : "Add to career"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}