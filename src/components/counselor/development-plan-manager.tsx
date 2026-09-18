// src/components/counselor/development-plan-manager.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addDevelopmentItem,
  updateDevelopmentItemStatus,
  deleteDevelopmentItem,
} from "@/lib/actions/counselor";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DevPlanItem {
  id: string;
  competency_name: string;
  current_level: number;
  target_level: number;
  action: string;
  status: string;
  due_date: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const statusSelectClass: Record<string, string> = {
  todo: "bg-muted",
  in_progress: "bg-amber-500/15 text-amber-700",
  done: "bg-emerald-500/15 text-emerald-600",
};

export function DevelopmentPlanManager({
  assessmentId,
  items,
}: {
  assessmentId: string;
  items: DevPlanItem[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [cur, setCur] = useState(1);
  const [tgt, setTgt] = useState(2);
  const [action, setAction] = useState("");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await addDevelopmentItem({
      assessmentId,
      competencyName: name,
      currentLevel: cur,
      targetLevel: tgt,
      action,
      dueDate: due || null,
    });
    setSaving(false);
    if (res.error) {
      setError(res.error);
    } else {
      setName("");
      setAction("");
      setDue("");
      setCur(1);
      setTgt(2);
      setShowForm(false);
    }
  }

  async function handleStatus(itemId: string, status: string) {
    setError(null);
    const res = await updateDevelopmentItemStatus({
      itemId,
      assessmentId,
      status,
    });
    if (res.error) setError(res.error);
  }

  async function handleDelete(itemId: string) {
    setError(null);
    const res = await deleteDevelopmentItem({ itemId, assessmentId });
    if (res.error) setError(res.error);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Development Plan</CardTitle>
          <CardDescription>
            Action items yang kamu susun untuk siswa ini, berdasarkan gap
            analysis.
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add item
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleAdd}
            className="space-y-3 rounded-lg border border-border p-3"
          >
            <div className="space-y-2">
              <Label htmlFor="compName">Competency</Label>
              <Input
                id="compName"
                placeholder="e.g. Backend Development"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cur">Current level</Label>
                <select
                  id="cur"
                  value={cur}
                  onChange={(e) => setCur(Number(e.target.value))}
                  className="flex h-8 w-full rounded-lg border border-border bg-background px-2 text-sm"
                  disabled={saving}
                >
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tgt">Target level</Label>
                <select
                  id="tgt"
                  value={tgt}
                  onChange={(e) => setTgt(Number(e.target.value))}
                  className="flex h-8 w-full rounded-lg border border-border bg-background px-2 text-sm"
                  disabled={saving}
                >
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionText">Suggested action</Label>
              <Textarea
                id="actionText"
                placeholder="e.g. Build a REST API project with authentication and deploy it…"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                rows={2}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date (opsional)</Label>
              <Input
                id="due"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                disabled={saving}
              />
            </div>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving…" : "Save item"}
            </Button>
          </form>
        )}

        {items.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground">
            Belum ada item. Klik “Add item” untuk mulai menyusun rencana
            pengembangan.
          </p>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium">
                  <span className="text-muted-foreground">{idx + 1}. </span>
                  {item.competency_name}{" "}
                  <span className="text-muted-foreground font-normal">
                    (Lv {item.current_level} → {item.target_level})
                  </span>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.action}
                </p>
                {item.due_date && (
                  <p className="text-xs text-muted-foreground">
                    Due: {item.due_date}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={item.status}
                  onChange={(e) => handleStatus(item.id, e.target.value)}
                  className={cn(
                    "h-7 rounded-md border border-border px-2 text-xs font-medium",
                    statusSelectClass[item.status] ?? ""
                  )}
                >
                  {Object.entries(STATUS_LABEL).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}