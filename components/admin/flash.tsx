import { AdminSnackbarToast } from "@/components/admin/admin-snackbar-toast";

export function AdminFlash({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  if (!success && !error) return null;
  return <AdminSnackbarToast message={error || success} variant={error ? "error" : "success"} />;
}

export function flashFromQuery(query: Record<string, string | undefined>) {
  if (query.error) return { error: query.error };
  if (query.deleted) return { success: "The item was removed from the website." };
  if (query.saved) return { success: "Changes saved." };
  return {};
}
