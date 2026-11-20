import Link from "next/link";
import { Shield, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { deleteRole } from "@/actions/users";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RolesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("users.manage");
  const query = await searchParams;
  const roles = await prisma.role.findMany({ orderBy: [{ isSystem: "desc" }, { name: "asc" }], include: { permissions: { include: { permission: true } }, _count: { select: { users: { where: { deletedAt: null } } } } } });
  return <div>
    <PageHeader title="Roles & permissions" description="Roles decide which parts of the admin console an administrator can use. Module access is enforced on every page and server action." breadcrumb={[{ label: "User Management", href: "/admin/users" }, { label: "Roles" }]} actions={<div className="flex gap-2"><Button asChild variant="outline"><Link href="/admin/users">Manage users</Link></Button><Button asChild><Link href="/admin/users/roles/new">Create role</Link></Button></div>} />
    <AdminFlash {...flashFromQuery(query)} />
    <div className="space-y-3">{roles.map((role) => {
      const keys = role.permissions.map((entry) => entry.permission.key);
      const isSuper = role.slug === "super-admin";
      return <Card key={role.id}><CardContent className="flex flex-wrap items-center gap-4 p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/5 text-primary">{isSuper ? <ShieldCheck className="size-4" /> : <Shield className="size-4" />}</span>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-primary">{role.name}</p>{role.isSystem && <Badge variant="secondary">Built-in</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">{role._count.users} user{role._count.users === 1 ? "" : "s"} · {isSuper ? PERMISSIONS.length : keys.length} permissions · {role.slug}</p>{role.description && <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>}</div>
        <div className="flex items-center gap-2"><ViewButton href={`/admin/records/role/${role.id}`} name={role.name} /><Button asChild variant="outline" size="sm"><Link href={`/admin/users/roles/${role.id}/edit`}>Edit</Link></Button>{!role.isSystem && <DeleteButton id={role.id} action={deleteRole} label="Delete role" title={`Delete ${role.name}?`} description="This role cannot be deleted while administrators are assigned to it." />}</div>
      </CardContent></Card>;
    })}</div>
  </div>;
}
