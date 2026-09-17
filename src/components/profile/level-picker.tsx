// src/components/profile/level-picker.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GENERAL_RUBRIC, suggestLevel, type RubricLevel } from "@/lib/classification/level-rubric";
import { HelpCircle, CheckCircle2 } from "lucide-react";

export function LevelPicker({
  rubrics,
  value,
  onSelect,
}: {
  rubrics?: RubricLevel[] | null;
  value: number;
  onSelect: (level: number) => void;
}) {
  const levels = rubrics && rubrics.length > 0 ? rubrics : GENERAL_RUBRIC;
  const [open, setOpen] = useState(false);
  const [quiz, setQuiz] = useState({
    practiced: false,
    independent: false,
    mentorOthers: false,
  });
  const suggested = suggestLevel(quiz);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setOpen(true)}
        >
          <span>
            Level {value} — {levels.find((l) => l.level === value)?.label}
          </span>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How do I pick my level?</DialogTitle>
          <DialogDescription>
            Be honest — the classification is only useful if your self-rating
            matches reality. Pick the level whose description fits you best.
          </DialogDescription>
        </DialogHeader>

        {/* Mini self-assessment */}
        <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
          <p className="text-sm font-medium">
            Not sure? Answer these honestly:
          </p>
          {(
            [
              ["practiced", "I have actually practiced this (not just watched/read)."],
              ["independent", "I can complete a small real task on my own, without a tutorial."],
              ["mentorOthers", "Others ask me for help / I handle complex cases confidently."],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-start gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4"
                checked={quiz[key]}
                onChange={(e) =>
                  setQuiz((p) => ({ ...p, [key]: e.target.checked }))
                }
              />
              <span>{label}</span>
            </label>
          ))}
          <p className="text-sm text-muted-foreground pt-1">
            Suggested:{" "}
            <Badge variant="secondary">
              Level {suggested} — {levels.find((l) => l.level === suggested)?.label}
            </Badge>{" "}
            <span className="text-xs">
              (Level 5 is reserved for public recognition / leadership — pick it
              manually only with strong evidence.)
            </span>
          </p>
        </div>

        {/* Level list */}
        <div className="space-y-2">
          {levels.map((l) => {
            const active = l.level === value;
            return (
              <button
                key={l.level}
                type="button"
                onClick={() => {
                  onSelect(l.level);
                  setOpen(false);
                }}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  active
                    ? "border-foreground bg-muted/50"
                    : "border-border hover:border-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">
                    Level {l.level} — {l.label}
                  </p>
                  {active && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  {l.level === suggested && !active && (
                    <Badge variant="outline" className="text-xs">
                      suggested
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {l.description}
                </p>
                <p className="text-xs mt-1.5">
                  <span className="font-medium">Evidence example: </span>
                  <span className="text-muted-foreground">
                    {l.exampleEvidence}
                  </span>
                </p>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}