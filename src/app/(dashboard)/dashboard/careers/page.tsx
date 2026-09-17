import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function CareersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // FIX: filter is_active dihapus (kolom belum tentu ada di tabel careers).
  // Kalau nanti lu tambahin kolom is_active di Supabase, tinggal
  // tambahin lagi: .eq("is_active", true)
  const { data: careers } = await supabase
    .from("careers")
    .select("id, name, slug, description")
    .order("name");

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Career Library</h2>
        <p className="text-muted-foreground mt-1">
          Explore careers and run a readiness classification against your profile.
        </p>
      </div>

      {!careers?.length ? (
        <p className="text-sm text-muted-foreground">No careers available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {careers.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">{c.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {c.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  render={<Link href={`/dashboard/careers/${c.slug}`} />}
                  nativeButton={false}
                >
                  View & Assess
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}