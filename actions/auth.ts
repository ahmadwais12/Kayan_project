"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSession, requestMeta } from "@/lib/auth/session";
import { loginSchema, parseForm } from "@/lib/validations";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { sendMail, escapeHtml } from "@/lib/mail";

export type AuthState = { error?: string; success?: string; resetUrl?: string };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = await parseForm(loginSchema, formData);
  if (!parsed.data) return { error: parsed.error };

  const { email, password, next } = parsed.data;
  const meta = await requestMeta();
  const limitKey = `login:${meta.ip || "unknown"}:${email}`;
  const limit = rateLimit(limitKey, 5, 15 * 60 * 1000, false);
  if (!limit.allowed) {
    return { error: `Too many attempts. Try again in ${limit.retryAfter} seconds.` };
  }

  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });

  if (!user || user.deletedAt || !user.isActive) {
    rateLimit(limitKey, 5, 15 * 60 * 1000);
    await logAudit({
      action: "auth.login.failed",
      entity: "AdminUser",
      meta: { email },
      ip: meta.ip,
    });
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    rateLimit(limitKey, 5, 15 * 60 * 1000);
    await logAudit({
      userId: user.id,
      action: "auth.login.failed",
      entity: "AdminUser",
      entityId: user.id,
      ip: meta.ip,
    });
    return { error: "Invalid email or password." };
  }

  resetRateLimit(limitKey);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await createSession(user.id);
  await logAudit({
    userId: user.id,
    action: "auth.login",
    entity: "AdminUser",
    entityId: user.id,
    ip: meta.ip,
  });

  const destination =
    next && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
  redirect(destination);
}

export async function logoutAction() {
  const session = await getSession();
  if (session) {
    await logAudit({
      userId: session.user.id,
      action: "auth.logout",
      entity: "AdminUser",
      entityId: session.user.id,
    });
  }
  await destroySession();
  redirect("/admin/login");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const parsed = z.email().safeParse(email);
  if (!parsed.success) return { error: "Enter a valid email address." };

  const meta = await requestMeta();
  const limit = rateLimit(`reset:${meta.ip || "unknown"}`, 5, 30 * 60 * 1000);
  if (!limit.allowed) {
    return { error: `Too many reset requests. Try again in ${limit.retryAfter} seconds.` };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const generic = {
    success: "If an administrator account exists for that email, a reset link has been issued.",
  };

  if (!user || !user.isActive || user.deletedAt) return generic;

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const base = process.env.APP_URL || "http://localhost:3333";
  const resetUrl = `${base}/admin/reset-password?token=${token}`;

  const result = await sendMail({
    to: user.email,
    subject: "Reset your Kayan Land admin password",
    html: `<p>Use the link below to choose a new password. It expires in one hour.</p><p><a href="${resetUrl}">${escapeHtml(resetUrl)}</a></p>`,
  });

  if (!result.sent && process.env.NODE_ENV !== "production") {
    return { ...generic, resetUrl };
  }

  return generic;
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!token) return { error: "The reset link is invalid." };
  if (password.length < 12) return { error: "Use at least 12 characters for the new password." };
  if (password !== confirm) return { error: "The passwords do not match." };

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { error: "This reset link has expired or already been used." };
  }

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.adminSession.deleteMany({ where: { userId: record.userId } }),
  ]);

  await logAudit({
    userId: record.userId,
    action: "auth.password_reset",
    entity: "AdminUser",
    entityId: record.userId,
  });

  return { success: "Password updated. You can now sign in with the new password." };
}
