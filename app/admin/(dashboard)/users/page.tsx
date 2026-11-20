import Link from "next/link";
import { Plus, Search, ShieldCheck } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TableFooter } from "@/components/admin/pagination";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { FiltersPopover } from "@/components/admin/filters-popover";
import { FiltersForm } from "@/components/admin/filters-form";
import { deleteAdminUser } from "@/actions/users";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, initials } from "@/lib/utils";
import { parseRows } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const DEFAULT_ROWS = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requirePermission("users.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const rows = parseRows(query.rows, DEFAULT_ROWS);
  const q = (query.q || "").trim();
  const roleId = (query.role || "").trim();
  const status = ["active", "inactive"].includes(query.status || "") ? query.status : "";
  const activeFilterCount = [q, roleId, status].filter(Boolean).length;

  const where: Prisma.AdminUserWhereInput = {
    deletedAt: null,
    ...(q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] }
      : {}),
    ...(roleId ? { roleId } : {}),
    ...(status ? { isActive: status === "active" } : {}),
  };

  const [users, roles, total] = await Promise.all([
    prisma.adminUser.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      skip: (page - 1) * rows,
      take: rows,
      include: { role: true },
    }),
    prisma.role.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { users: { where: { deletedAt: null } } } } },
    }),
    prisma.adminUser.count({ where }),
  ]);

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Create and manage the people who can sign in to the admin console, and the role each one holds."
        breadcrumb={[{ label: "User Management" }]}
        actions={
          <>
            <FiltersPopover activeCount={activeFilterCount}>
              <FiltersForm resetHref="/admin/users">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input name="q" defaultValue={q} placeholder="Search name or email" className="pl-9" />
                </div>
                <NativeSelect name="role" defaultValue={roleId} aria-label="Role">
                  <option value="">All roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </NativeSelect>
                <NativeSelect name="status" defaultValue={status} aria-label="Status">
                  <option value="">Any status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </NativeSelect>
              </FiltersForm>
            </FiltersPopover>
            <Button asChild variant="accent">
              <Link href="/admin/users/new">
                <Plus className="size-4" /> Add new user
              </Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last sign-in</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-[0.65rem] font-semibold uppercase text-muted-foreground">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                      ) : (
                        initials(user.name)
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-primary">{user.name}</span>
                      <span className="block text-xs text-muted-foreground">{user.email}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-primary">
                    {user.role.slug === "super-admin" && <ShieldCheck className="size-3" />}
                    {user.role.name}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      user.isActive
                        ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[0.68rem] font-medium text-emerald-700"
                        : "rounded-full bg-muted px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <ViewButton href={`/admin/records/user/${user.id}`} name={user.name} />
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/users/${user.id}`}>Edit</Link>
                    </Button>
                    {user.id !== session.user.id && (
                      <DeleteButton
                        id={user.id}
                        action={deleteAdminUser}
                        label="Delete"
                        title={`Delete ${user.name}?`}
                        description="Their sessions end immediately and the account can no longer sign in. Audit history is preserved."
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No users match this view.
          </p>
        )}

        <TableFooter
          page={page}
          pageSize={rows}
          total={total}
          basePath="/admin/users"
          params={{ q, role: roleId, status }}
          noun={total === 1 ? "user" : "users"}
        />
      </Card>

      <p className="mt-3 text-xs text-muted-foreground">
        Passwords are stored as Argon2id hashes.
      </p>
    </div>
  );
}
