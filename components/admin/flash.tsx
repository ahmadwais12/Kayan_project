import { CircleCheck, TriangleAlert } from "lucide-react";

export function AdminFlash({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  if (!success && !error) return null;
  return (
    <div
      role="status"
      className={
        error
          ? "mb-5 flex items-start gap-2.5 rounded-md border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          : "mb-5 flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
      }
    >
      {error ? (
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CircleCheck className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{error || success}</span>
    </div>
  );
}

export function flashFromQuery(query: Record<string, string | undefined>) {
  if (query.error) return { error: query.error };
  if (query.deleted) return { success: "The item was removed from the website." };
  if (query.saved) return { success: "Changes saved." };
  return {};
}
