// src/components/assessment/career-compare-form.tsx
"use client";

import { useMemo, useState } from "react";
import { compareCareerScenarios } from "@/lib/classification/compare";
import { ClassificationBadge } from "@/components/assessment/classification-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCompareArrows } from "lucide-react";

export interface CompareCareerInput {
  id: string;
  name: string;
  description: string;
  requirements: {
    competencyId: string;
    competencyName: string;
    requiredLevel: number;
    weight: number;
    isCore: boolean;
  }[];
}

export function CareerCompareForm({
  careers,
  userSkills,
  userSkillNames,
}: {
  careers: CompareCareerInput[];
  userSkills: { competencyId: string; level: number }[];
  userSkillNames: Record<string, string>;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev; // max 3 biar tabel responsive
      return [...prev, id];
    });
  }

  const result = useMemo(() => {
    if (selected.length < 2) return null;
    const chosen = selected
      .map((id) => careers.find((c) => c.id === id)!)
      .filter(Boolean)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.id,
        description: c.description,
        competencyRequirements: c.requirements.map((r) => ({
          competencyId: r.competencyId,
          requiredLevel: r.requiredLevel as 1 | 2 | 3 | 4 | 5,
          weight: r.weight,
          isCore: r.isCore,
        })),
        recommendedLearningAreas: [],
      }));
    return compareCareerScenarios(
      userSkills.map((s) => ({
        competencyId: s.competencyId,
        level: s.level as 1 | 2 | 3 | 4 | 5,
      })),
      chosen,
      userSkillNames
    );
  }, [selected, careers, userSkills, userSkillNames]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pick 2–3 careers to compare</CardTitle>
          <CardDescription>
            This is a Decision Explorer (§15) — it shows trade-offs, it does NOT
            tell you which career to choose.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {careers.map((c) => {
              const active = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          {result.limitedData && (
            <p className="text-sm text-amber-600">
              ⚠ Limited data — you cover less than half of the required
              competencies. Complete your{" "}
              <Badge variant="secondary">skills</Badge> for a fairer comparison.
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.comparisons.map((c) => (
              <Card key={c.careerId} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{c.careerName}</CardTitle>
                    <ClassificationBadge classification={c.classification} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm mt-auto">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground">Readiness</span>
                      <span className="text-xl font-semibold tabular-nums">
                        {c.readinessScore}
                        <span className="text-xs text-muted-foreground font-normal">
                          /100
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-foreground transition-all"
                        style={{ width: `${c.readinessScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="text-emerald-600">{c.metCount} met</span>
                    <span className="text-amber-600">{c.gapCount} gaps</span>
                    <span className="text-destructive">
                      {c.majorGapCount} major
                    </span>
                  </div>
                  {c.strongest.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Strong areas</p>
                      <div className="flex flex-wrap gap-1">
                        {c.strongest.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.topGaps.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Top gaps</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {c.topGaps.map((g) => (
                          <li key={g.competencyName}>
                            {g.competencyName} (+{g.gapSize} level
                            {g.gapSize > 1 ? "s" : ""})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GitCompareArrows className="h-4 w-4" />
                Trade-offs
              </CardTitle>
              <CardDescription>
                Understanding differences — not picking a “winner” (§15, §30).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                {result.tradeoffs.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
              <div className="mt-4">
                <Button size="sm" variant="outline" onClick={() => setSelected([])}>
                  Reset scenarios
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}