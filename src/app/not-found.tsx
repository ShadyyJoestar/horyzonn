// src/app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Compass className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        The page you are looking for does not exist, or the shared link was
        revoked / expired.
      </p>
      <Button size="sm" render={<Link href="/" />} nativeButton={false}>
        Back to home
      </Button>
    </div>
  );
}