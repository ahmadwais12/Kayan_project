import { getSession } from "@/lib/auth/session";
import { hasPermission, type PermissionKey } from "@/lib/auth/permissions";

export async function isPreviewRequest(
  searchParams: Record<string, string | undefined> | undefined,
  permission: PermissionKey,
) {
  if (searchParams?.preview !== "1") return false;
  return hasPermission(await getSession(), permission);
}
