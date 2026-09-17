import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-semibold mb-4">Career Library</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Halaman Career Library sedang dalam pengembangan.
      </p>
      <Button render={<Link href="/" />} nativeButton={false}>
        Kembali ke Beranda
      </Button>
    </div>
  );
}