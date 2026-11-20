const priceFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function formatPrice(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? priceFormatter.format(value) : "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d+(?:,\d{3})*(?:\.\d{1,2})?$/.test(raw)) {
    return priceFormatter.format(Number(raw.replace(/,/g, "")));
  }
  return raw;
}

export function toE164(phone: string | null | undefined) {
  if (!phone) return "";
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return "";
  return `${trimmed.startsWith("+") ? "+" : ""}${digits}`;
}

export function telHref(phone: string | null | undefined) {
  const value = toE164(phone);
  return value ? `tel:${value}` : "";
}
