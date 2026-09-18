// src/app/(dashboard)/counselor/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function CounselorLoading() {
  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}