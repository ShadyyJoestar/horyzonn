import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-500">Failed to load users: {error.message}</div>;
  }

  const roleColor = {
    admin: "default",
    counselor: "secondary",
    student: "outline",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="text-muted-foreground mt-1">
          Manage platform users and their roles.
        </p>
      </div>

      <div className="grid gap-3">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">
                  {user.full_name || "No name"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant={roleColor[user.role as keyof typeof roleColor] || "outline"}>
                {user.role}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Joined: {new Date(user.created_at).toLocaleDateString("id-ID")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!users || users.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">No users found.</div>
      )}
    </div>
  );
}