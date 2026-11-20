import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { RoleForm } from "@/components/admin/role-form";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("users.manage");
  const { id } = await params;
  const role = await prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } });
  if (!role) notFound();
  return <div><PageHeader title={`Edit ${role.name}`} description="Update this role’s name, description, and permissions." breadcrumb={[{ label: "User Management", href: "/admin/users" }, { label: "Roles", href: "/admin/users/roles" }, { label: "Edit" }]} /><RoleForm role={{ ...role, keys: role.permissions.map((entry) => entry.permission.key) }} /></div>;
}
