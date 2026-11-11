"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { field } from "@/lib/form-helpers";

async function currentUserId() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session.user.id;
}

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/notifications");
}

export async function openNotification(formData: FormData) {
  const userId = await currentUserId();
  const id = field(formData, "id");

  const notification = await prisma.adminNotification.findFirst({
    where: { id, userId },
    select: { id: true, href: true, readAt: true },
  });

  if (!notification) redirect("/admin/notifications");

  if (!notification.readAt) {
    await prisma.adminNotification.update({
      where: { id: notification.id },
      data: { readAt: new Date() },
    });
    refresh();
  }

  const href = notification.href;
  const safe = href && href.startsWith("/") && !href.startsWith("//") ? href : "/admin/notifications";
  redirect(safe);
}

export async function markNotificationRead(formData: FormData) {
  const userId = await currentUserId();
  const id = field(formData, "id");

  await prisma.adminNotification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
  refresh();
}

export async function markAllNotificationsRead() {
  const userId = await currentUserId();
  await prisma.adminNotification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  refresh();
}

export async function deleteNotification(formData: FormData) {
  const userId = await currentUserId();
  const id = field(formData, "id");

  await prisma.adminNotification.deleteMany({ where: { id, userId } });
  refresh();
}

export async function clearReadNotifications() {
  const userId = await currentUserId();
  await prisma.adminNotification.deleteMany({ where: { userId, readAt: { not: null } } });
  refresh();
}
