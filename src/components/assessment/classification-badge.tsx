import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  CAREER_READY: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  READY_WITH_GAPS: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  DEVELOPING: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  EXPLORING: "bg-muted text-muted-foreground border-border",
  // lowercase variants (kalau DB simpan lowercase)
  career_ready: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  ready_with_gaps: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  developing: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  exploring: "bg-muted text-muted-foreground border-border",
};

const labels: Record<string, string> = {
  CAREER_READY: "Career Ready",
  READY_WITH_GAPS: "Ready With Gaps",
  DEVELOPING: "Developing",
  EXPLORING: "Exploring",
  career_ready: "Career Ready",
  ready_with_gaps: "Ready With Gaps",
  developing: "Developing",
  exploring: "Exploring",
};

export function ClassificationBadge({
  classification,
  className,
}: {
  classification: string;
  className?: string;
}) {
  const key = classification ?? "EXPLORING";
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-medium",
        styles[key] || styles.EXPLORING,
        className
      )}
    >
      {labels[key] || classification}
    </Badge>
  );
}