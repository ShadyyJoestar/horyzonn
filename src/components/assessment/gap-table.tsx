import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Gap {
  competency_name: string;
  current_level: number;
  required_level: number;
  weight: number;
  status: string;
  gap_size: number;
}

const statusStyle: Record<string, string> = {
  EXCEEDS: "bg-emerald-500/15 text-emerald-600",
  MEETS: "bg-emerald-500/10 text-emerald-700",
  GAP: "bg-amber-500/15 text-amber-700",
  MAJOR_GAP: "bg-red-500/15 text-red-600",
};

export function GapTable({ gaps }: { gaps: Gap[] }) {
  if (!gaps.length) {
    return (
      <p className="text-sm text-muted-foreground">No competency gaps recorded.</p>
    );
  }

  const sorted = [...gaps].sort((a, b) => Number(b.weight) - Number(a.weight));

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left">
            <th className="px-4 py-2.5 font-medium">Competency</th>
            <th className="px-4 py-2.5 font-medium text-center">Current</th>
            <th className="px-4 py-2.5 font-medium text-center">Required</th>
            <th className="px-4 py-2.5 font-medium text-center">Weight</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((g, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 font-medium">{g.competency_name}</td>
              <td className="px-4 py-2.5 text-center tabular-nums">
                {g.current_level}
              </td>
              <td className="px-4 py-2.5 text-center tabular-nums">
                {g.required_level}
              </td>
              <td className="px-4 py-2.5 text-center tabular-nums text-muted-foreground">
                {(Number(g.weight) * 100).toFixed(0)}%
              </td>
              <td className="px-4 py-2.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "border-0 font-medium",
                    statusStyle[g.status] || ""
                  )}
                >
                  {g.status.replace("_", " ")}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}