import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield } from "lucide-react";
import { RoleSelect } from "@/components/admin/role-select";

export default async function AdminUsersPage() {
  // Butuh tahu siapa yang sedang login (pakai client biasa, bukan
  // service-role) supaya kita bisa disable role-select di baris admin
  // itu sendiri — service-role client tidak punya sesi user.
  const supabaseSession = await createClient();
  const {
    data: { user: currentUser },
  } = await supabaseSession.auth.getUser();

  const supabase = createAdminClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <Header />
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            Failed to load users: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  const counts = {
    admin: users?.filter((u) => u.role === "admin").length ?? 0,
    counselor: users?.filter((u) => u.role === "counselor").length ?? 0,
    student: users?.filter((u) => u.role === "student").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <Header />

      <div className="flex flex-wrap gap-3 text-sm">
        <Badge variant="secondary">{users?.length ?? 0} total</Badge>
        <Badge variant="default">{counts.admin} admin</Badge>
        <Badge variant="secondary">{counts.counselor} counselor</Badge>
        <Badge variant="outline">{counts.student} student</Badge>
      </div>

      <div className="grid gap-3">
        {users?.map((user) => (
          <Card key={user.id} className="hover:bg-muted/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {(user.full_name || user.email || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-base">
                    {user.full_name || "No name"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <RoleSelect
                  userId={user.id}
                  currentRole={user.role}
                  isSelf={user.id === currentUser?.id}
                />
              </div>
            </CardHeader>
            <CardContent className="pl-12">
              <p className="text-xs text-muted-foreground">
                Joined{" "}
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!users || users.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">No users found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
      <p className="text-muted-foreground mt-1">
        Manage platform roles: student / counselor / admin.
      </p>
    </div>
  );
}