import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  CAREER_READY: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  READY_WITH_GAPS: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  DEVELOPING: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  EXPLORING: "bg-muted text-muted-foreground border-border",
};

const labels: Record<string, string> = {
  CAREER_READY: "Career Ready",
  READY_WITH_GAPS: "Ready With Gaps",
  DEVELOPING: "Developing",
  EXPLORING: "Exploring",
};

export function ClassificationBadge({
  classification,
  className,
}: {
  classification: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-medium",
        styles[classification] || styles.EXPLORING,
        className
      )}
    >
      {labels[classification] || classification}
    </Badge>
  );
}