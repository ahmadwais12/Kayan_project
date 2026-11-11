import { prisma } from "@/lib/prisma";

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
};

export function toNotificationItem(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    href: row.href,
    isRead: Boolean(row.readAt),
    createdAt: row.createdAt.toISOString(),
  };
}

type NotifyInput = {
  type?: string;
  title: string;
  message: string;
  href?: string | null;
};

export async function notifyAdmins(input: NotifyInput) {
  try {
    const users = await prisma.adminUser.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (!users.length) return;
    await prisma.adminNotification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: input.type || "system",
        title: input.title.slice(0, 200),
        message: input.message.slice(0, 2000),
        href: input.href || null,
      })),
    });
  } catch (error) {
    console.error("[notifications] could not queue notification", error);
  }
}

export async function notifyUser(userId: string, input: NotifyInput) {
  try {
    await prisma.adminNotification.create({
      data: {
        userId,
        type: input.type || "system",
        title: input.title.slice(0, 200),
        message: input.message.slice(0, 2000),
        href: input.href || null,
      },
    });
  } catch (error) {
    console.error("[notifications] could not queue notification", error);
  }
}
