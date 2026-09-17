// src/app/(dashboard)/admin/error.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full border-destructive/30">
        <CardHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Admin panel error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || "Something went wrong while loading this admin page."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Digest: {error.digest}
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" onClick={reset}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Try again
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = "/admin")}
            >
              <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
              Back to overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}