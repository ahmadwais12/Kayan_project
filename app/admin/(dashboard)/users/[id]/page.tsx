import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SubmitButton } from "@/components/admin/form-kit";
import { saveAdminUser, deleteAdminUser } from "@/actions/users";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditAdminUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requirePermission("users.manage");
  const { id } = await params;
  const query = await searchParams;

  const [user, roles] = await Promise.all([
    prisma.adminUser.findFirst({
      where: { id, deletedAt: null },
      include: { role: true },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!user) notFound();

  const isSelf = user.id === session.user.id;

  return (
    <div>
      <PageHeader
        title={user.name}
        description={`Administrator since ${formatDateTime(user.createdAt)} · last sign-in ${
          user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "never"
        }`}
        breadcrumb={[{ label: "User Management", href: "/admin/users" }, { label: user.name }]}
        actions={
          !isSelf ? (
            <DeleteButton
              id={user.id}
              action={deleteAdminUser}
              label="Delete user"
              iconOnly={false}
              title={`Delete ${user.name}?`}
              description="Their sessions end immediately and the account can no longer sign in. Audit history is preserved."
            />
          ) : undefined
        }
      />
      <AdminFlash {...flashFromQuery(query)} />

      {isSelf && (
        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This is your own account. You cannot deactivate yourself or change your own role.
        </div>
      )}

      <form action={saveAdminUser} className="mx-auto max-w-2xl space-y-5">
        <input type="hidden" name="id" value={user.id} />
        <Card>
          <CardHeader><CardTitle>Account details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={user.name} required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email} required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="roleId">Role</Label>
              <NativeSelect id="roleId" name="roleId" defaultValue={user.roleId} disabled={isSelf}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </NativeSelect>
              {isSelf && <input type="hidden" name="roleId" value={user.roleId} />}
              <p className="mt-1.5 text-xs text-muted-foreground">
                Permissions are defined on the role.{" "}
                <Link href="/admin/users/roles" className="text-accent hover:underline">
                  Manage roles
                </Link>
              </p>
            </div>
            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={12}
                autoComplete="new-password"
                placeholder="Leave blank to keep the current password"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Setting a password signs this administrator out of all active sessions.
              </p>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
              <span>
                <span className="block text-sm">Active</span>
                <span className="block text-xs text-muted-foreground">Inactive accounts cannot sign in.</span>
              </span>
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={user.isActive}
                disabled={isSelf}
                className="size-4 accent-[#172B35]"
              />
            </label>
            {isSelf && <input type="hidden" name="isActive" value="on" />}
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <SubmitButton>Save changes</SubmitButton>
          <Button asChild variant="outline">
            <Link href="/admin/users">Back to list</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
