import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth/session.constants";

export { SESSION_COOKIE };
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionContext = Awaited<ReturnType<typeof loadSession>>;

async function loadSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;
  if (!session.user.isActive || session.user.deletedAt) return null;

  return {
    sessionId: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      avatarUrl: session.user.avatarUrl,
      role: {
        id: session.user.role.id,
        name: session.user.role.name,
        slug: session.user.role.slug,
        permissions: session.user.role.permissions.map((item) => item.permission.key),
      },
    },
  };
}

export const getSession = cache(loadSession);

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  let ip: string | undefined;
  let userAgent: string | undefined;
  try {
    const requestHeaders = await headers();
    ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    userAgent = requestHeaders.get("user-agent") || undefined;
  } catch {
    // Headers are unavailable outside a request scope.
  }

  await prisma.adminSession.create({
    data: { tokenHash: hashToken(token), userId, expiresAt, ip, userAgent },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return { expiresAt };
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

export async function requestMeta() {
  try {
    const requestHeaders = await headers();
    return {
      ip: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      userAgent: requestHeaders.get("user-agent") || null,
    };
  } catch {
    return { ip: null, userAgent: null };
  }
}
