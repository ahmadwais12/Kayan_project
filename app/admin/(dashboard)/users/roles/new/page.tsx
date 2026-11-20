import { PageHeader } from "@/components/admin/page-header";
import { RoleForm } from "@/components/admin/role-form";
import { requirePermission } from "@/lib/auth/guards";

export default async function NewRolePage() {
  await requirePermission("users.manage");
  return <div><PageHeader title="Create a role" description="Choose a name and grant the permissions this role needs." breadcrumb={[{ label: "User Management", href: "/admin/users" }, { label: "Roles", href: "/admin/users/roles" }, { label: "Create" }]} /><RoleForm /></div>;
}
