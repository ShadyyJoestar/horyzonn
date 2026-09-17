import { Progress } from "@/components/ui/progress";

export function ReadinessScore({
  score,
  classification,
}: {
  score: number;
  classification: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Readiness Score</p>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {score}
            <span className="text-lg text-muted-foreground font-normal">/100</span>
          </p>
        </div>
      </div>
      <Progress value={score} className="h-2.5" />
      <p className="text-xs text-muted-foreground">
        Based on weighted competency matching against the selected career.
        This is decision support, not a prediction of job success.
      </p>
    </div>
  );
}