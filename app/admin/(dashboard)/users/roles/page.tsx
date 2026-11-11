import Link from "next/link";
import { Shield, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SubmitButton } from "@/components/admin/form-kit";
import { DeleteButton } from "@/components/admin/delete-button";
import { saveRole, deleteRole } from "@/actions/users";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

function groupPermissions(keys: string[]) {
  const groups = new Map<string, typeof PERMISSIONS>();
  for (const permission of PERMISSIONS) {
    const list = groups.get(permission.group) || [];
    list.push(permission);
    groups.set(permission.group, list);
  }
  return [...groups.entries()].map(([group, items]) => ({
    group,
    items,
    checked: items.filter((item) => keys.includes(item.key)).length,
  }));
}

function PermissionGrid({ granted }: { granted: string[] }) {
  const groups = groupPermissions(granted);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => (
        <fieldset key={group.group} className="rounded-md border border-border/70 p-3">
          <legend className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {group.group}
          </legend>
          <div className="mt-1 space-y-2">
            {group.items.map((permission) => (
              <label key={permission.key} className="flex items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  name="permissions"
                  value={permission.key}
                  defaultChecked={granted.includes(permission.key)}
                  className="mt-0.5 size-4 accent-[#172B35]"
                />
                <span>
                  <span className="block text-foreground/85">{permission.label}</span>
                  <span className="block font-mono text-[0.65rem] text-muted-foreground">
                    {permission.key}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("users.manage");
  const query = await searchParams;

  const roles = await prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { users: { where: { deletedAt: null } } } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Roles &amp; permissions"
        description="Roles decide which parts of the admin console an administrator can use. Module access is enforced on every page and server action."
        breadcrumb={[{ label: "User Management", href: "/admin/users" }, { label: "Roles" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/users">Manage users</Link>
          </Button>
        }
      />
      <AdminFlash {...flashFromQuery(query)} />

      <div className="grid items-start gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {roles.map((role) => {
            const keys = role.permissions.map((item) => item.permission.key);
            const isSuper = role.slug === "super-admin";
            return (
              <Card key={role.id}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/5 text-primary">
                      {isSuper ? <ShieldCheck className="size-4" /> : <Shield className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-primary">{role.name}</p>
                        {role.isSystem && <Badge variant="secondary">Built-in</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {role._count.users} user{role._count.users === 1 ? "" : "s"} ·{" "}
                        {isSuper ? PERMISSIONS.length : keys.length} permission
                        {keys.length === 1 ? "" : "s"} · {role.slug}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-accent group-open:hidden">Edit</span>
                    <span className="hidden text-xs font-medium text-accent group-open:inline">Close</span>
                  </summary>
                  <div className="border-t border-border/70 p-5">
                    <form action={saveRole} className="space-y-4">
                      <input type="hidden" name="id" value={role.id} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`name-${role.id}`}>Role name</Label>
                          <Input id={`name-${role.id}`} name="name" defaultValue={role.name} required maxLength={80} />
                        </div>
                        <div>
                          <Label htmlFor={`slug-${role.id}`}>Identifier</Label>
                          <Input id={`slug-${role.id}`} value={role.slug} disabled readOnly />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`description-${role.id}`}>Description</Label>
                        <Textarea
                          id={`description-${role.id}`}
                          name="description"
                          defaultValue={role.description || ""}
                          maxLength={500}
                          className="min-h-20"
                          placeholder="What this role is responsible for"
                        />
                      </div>
                      {isSuper ? (
                        <div className="rounded-md border border-border/70 bg-secondary/50 px-3 py-2.5 text-xs text-muted-foreground">
                          Super Admin always has every permission and cannot be restricted. The
                          role name and description can still be edited.
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-foreground/80">
                            Permissions
                          </p>
                          <PermissionGrid granted={keys} />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <SubmitButton>Save role</SubmitButton>
                        {!role.isSystem && (
                          <DeleteButton
                            id={role.id}
                            action={deleteRole}
                            label="Delete role"
                            iconOnly={false}
                            title={`Delete ${role.name}?`}
                            description="This role is removed permanently. It cannot be deleted while administrators are assigned to it."
                          />
                        )}
                      </div>
                    </form>
                  </div>
                </details>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader><CardTitle>Create a role</CardTitle></CardHeader>
          <CardContent>
            <form action={saveRole} className="space-y-4">
              <div>
                <Label htmlFor="new-role-name">Role name</Label>
                <Input id="new-role-name" name="name" required maxLength={80} placeholder="Marketing coordinator" />
              </div>
              <div>
                <Label htmlFor="new-role-description">Description</Label>
                <Textarea
                  id="new-role-description"
                  name="description"
                  maxLength={500}
                  className="min-h-20"
                  placeholder="What this role is responsible for"
                />
              </div>
              <div>
                <p className="mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-foreground/80">
                  Permissions
                </p>
                <PermissionGrid granted={[]} />
              </div>
              <SubmitButton>Create role</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
