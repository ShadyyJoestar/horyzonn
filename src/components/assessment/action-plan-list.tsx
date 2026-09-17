import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ActionItem {
  priority: number;
  competencyName: string;
  currentLevel: number;
  targetLevel: number;
  suggestedAction: string;
}

export function ActionPlanList({ items }: { items: ActionItem[] }) {
  if (!items?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Action Plan</CardTitle>
          <CardDescription>No priority actions — profile looks solid for this target.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Action Plan</CardTitle>
        <CardDescription>
          Prioritized by competency weight and gap size. Start from priority 1.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.priority}
            className="flex gap-3 rounded-lg border border-border p-3"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {item.priority}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">
                {item.competencyName}{" "}
                <span className="text-muted-foreground font-normal">
                  (Lv {item.currentLevel} → {item.targetLevel})
                </span>
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.suggestedAction}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}