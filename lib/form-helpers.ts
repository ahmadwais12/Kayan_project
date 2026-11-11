import { toInt } from "@/lib/utils";

export function field(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

export function checked(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true";
}

export function numberField(formData: FormData, key: string, fallback = 0) {
  return toInt(formData.get(key), fallback);
}

export function jsonArray<T>(
  formData: FormData,
  key: string,
  validate: (value: unknown) => T[] = (value) => (Array.isArray(value) ? (value as T[]) : []),
) {
  const raw = formData.get(key);
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return validate(parsed);
  } catch {
    return [];
  }
}

export function redirectWith(path: string, type: "saved" | "error" | "deleted", message?: string) {
  const params = new URLSearchParams();
  params.set(type, message || "1");
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${params.toString()}`;
}
