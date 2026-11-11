import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SubmitButton } from "@/components/admin/form-kit";
import { saveAdminUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function NewAdminUserPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("users.manage");
  const query = await searchParams;
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Add new user"
        description="Create an account and assign one of the configured roles."
        breadcrumb={[{ label: "User Management", href: "/admin/users" }, { label: "New user" }]}
      />
      <AdminFlash {...flashFromQuery(query)} />

      <form action={saveAdminUser} className="mx-auto max-w-2xl space-y-5">
        <Card>
          <CardHeader><CardTitle>Account details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required maxLength={120} autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" required maxLength={200} autoComplete="off" />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Used to sign in and to receive password reset links.
              </p>
            </div>
            <div>
              <Label htmlFor="roleId">Role</Label>
              <NativeSelect id="roleId" name="roleId" required defaultValue="">
                <option value="" disabled>Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label htmlFor="password">Initial password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                At least 12 characters. Share it over a secure channel and ask the user to change it after signing in.
              </p>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
              <span>
                <span className="block text-sm">Active</span>
                <span className="block text-xs text-muted-foreground">Inactive accounts cannot sign in.</span>
              </span>
              <input type="checkbox" name="isActive" defaultChecked className="size-4 accent-[#172B35]" />
            </label>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <SubmitButton>Create user</SubmitButton>
          <Button asChild variant="outline">
            <Link href="/admin/users">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
