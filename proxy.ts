import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth/session.constants";

const PUBLIC_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

type CachedRedirect = { toPath: string; statusCode: number };

let redirectCache: { entries: Map<string, CachedRedirect>; expiresAt: number } | null = null;

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

async function activeRedirects() {
  if (redirectCache && redirectCache.expiresAt > Date.now()) return redirectCache.entries;
  try {
    const rows = await prisma.redirect.findMany({
      where: { isActive: true },
      select: { fromPath: true, toPath: true, statusCode: true },
    });
    const entries = new Map(
      rows.map((row) => [
        normalizePath(row.fromPath),
        { toPath: row.toPath, statusCode: row.statusCode },
      ]),
    );
    redirectCache = { entries, expiresAt: Date.now() + 15_000 };
    return entries;
  } catch {
    return redirectCache?.entries ?? new Map<string, CachedRedirect>();
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    if (!hasSession && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (request.method === "GET" || request.method === "HEAD") {
    const entries = await activeRedirects();
    const match = entries.get(normalizePath(pathname));
    if (match && normalizePath(match.toPath) !== normalizePath(pathname)) {
      const destination = match.toPath.startsWith("/")
        ? new URL(match.toPath, request.url)
        : new URL(match.toPath);
      return NextResponse.redirect(destination, match.statusCode as 301 | 302 | 307 | 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
