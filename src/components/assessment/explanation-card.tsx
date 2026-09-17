import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Explanation {
  summary?: string;
  strongestAreas?: string[];
  mainGaps?: string[];
  contributingFactors?: string[];
}

export function ExplanationCard({ explanation }: { explanation: Explanation }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Why this classification?</CardTitle>
        <CardDescription>
          Explanation is derived from your actual competency data — not random scores.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {explanation.summary && (
          <p className="text-sm leading-relaxed">{explanation.summary}</p>
        )}

        {explanation.strongestAreas && explanation.strongestAreas.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Strongest areas
            </p>
            <ul className="list-disc list-inside text-sm space-y-0.5">
              {explanation.strongestAreas.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {explanation.mainGaps && explanation.mainGaps.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Main gaps
            </p>
            <ul className="list-disc list-inside text-sm space-y-0.5">
              {explanation.mainGaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}