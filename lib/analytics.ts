import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";

export const VISITOR_COOKIE = "kl_vid";

const BOT_PATTERN = /bot|crawler|spider|crawl|slurp|bingpreview|headless|lighthouse|gtmetrix/i;

export const CARD_ENTITY_TYPES = ["PROJECT", "PROJECT_PART", "SERVICE", "ARTICLE"] as const;
export const CARD_EVENT_TYPES = ["VIEW", "CLICK"] as const;
export const PAGE_TYPES = ["page", "project", "service", "article"] as const;

export type CardEntityType = (typeof CARD_ENTITY_TYPES)[number];
export type CardEventType = (typeof CARD_EVENT_TYPES)[number];

export type AnalyticsContext = {
  visitorId: string;
  userId: string | null;
  userName: string | null;
  ipHash: string | null;
  device: "Mobile" | "Tablet" | "Desktop";
  country: string | null;
};

export function isBot(userAgent: string | null | undefined) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

function deviceOf(userAgent: string): AnalyticsContext["device"] {
  if (/tablet|ipad/i.test(userAgent)) return "Tablet";
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function countryOf(request: Request) {
  const header =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    "";
  const normalized = header.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) && !["XX", "T1"].includes(normalized)
    ? normalized
    : null;
}

function ipHashOf(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "";
  if (!ip) return null;
  const salt = process.env.SESSION_SECRET || "kayan-analytics";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Resolves the anonymous visitor cookie, the signed-in admin (if any) and the
 * request metadata used by both analytics endpoints. Returns null for bots so
 * crawlers never pollute the report.
 */
export async function getAnalyticsContext(request: Request): Promise<AnalyticsContext | null> {
  const userAgent = request.headers.get("user-agent") || "";
  if (isBot(userAgent)) return null;

  const store = await cookies();
  let visitorId = store.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = randomUUID();
    store.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const session = await getSession();

  return {
    visitorId,
    userId: session?.user.id ?? null,
    userName: session?.user.name ?? null,
    ipHash: ipHashOf(request),
    device: deviceOf(userAgent),
    country: countryOf(request),
  };
}

export function cleanPath(value: unknown) {
  const path = typeof value === "string" ? value.trim().slice(0, 500) : "";
  if (!path.startsWith("/")) return null;
  if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) return null;
  return path;
}

export function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
