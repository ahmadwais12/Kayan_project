import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { toNotificationItem } from "@/lib/notifications";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [settings, store, notifications, unreadCount] = await Promise.all([
    getSettings(),
    cookies(),
    prisma.adminNotification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.adminNotification.count({
      where: { userId: session.user.id, readAt: null },
    }),
  ]);

  const viewer = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };

  return (
    <AdminShell
      viewer={viewer}
      siteName={settings.siteName}
      logoUrl={settings.logoUrl}
      notifications={notifications.map(toNotificationItem)}
      unreadCount={unreadCount}
      initialCollapsed={store.get("kayan_admin_sidebar")?.value === "collapsed"}
    >
      {children}
    </AdminShell>
  );
}
