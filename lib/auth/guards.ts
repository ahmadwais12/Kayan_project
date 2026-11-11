import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission, type PermissionKey } from "@/lib/auth/permissions";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requirePermission(permission: PermissionKey) {
  const session = await requireAdmin();
  if (!hasPermission(session, permission)) redirect("/admin?denied=1");
  return session;
}

export async function authorize(permission: PermissionKey) {
  const session = await getSession();
  if (!session) return { session: null, error: "Your session has expired. Please sign in again." };
  if (!hasPermission(session, permission)) {
    return { session: null, error: "You do not have permission to perform this action." };
  }
  return { session, error: null };
}
