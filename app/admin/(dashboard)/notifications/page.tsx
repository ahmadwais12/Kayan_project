import Link from "next/link";
import { Bell, CheckCheck, FileText, Inbox, Sparkles, Trash2, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import {
  clearReadNotifications,
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
  openNotification,
} from "@/actions/notifications";

export const dynamic = "force-dynamic";

function iconFor(type: string) {
  if (type === "inquiry") return Inbox;
  if (type === "quote") return FileText;
  return Sparkles;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireAdmin();
  const query = await searchParams;
  const unreadOnly = query.filter === "unread";

  const [items, unreadCount, total, todayCount] = await Promise.all([
    prisma.adminNotification.findMany({
      where: { userId: session.user.id, ...(unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.adminNotification.count({ where: { userId: session.user.id, readAt: null } }),
    prisma.adminNotification.count({ where: { userId: session.user.id } }),
    prisma.adminNotification.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="In-app alerts for new inquiries, quote requests and account activity."
        breadcrumb={[{ label: "Notifications" }]}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
              <Button asChild variant={unreadOnly ? "ghost" : "secondary"} size="sm" className={cn(!unreadOnly && "bg-primary text-white hover:bg-primary/90")}>
                <Link href="/admin/notifications">All</Link>
              </Button>
              <Button asChild variant={unreadOnly ? "secondary" : "ghost"} size="sm" className={cn(unreadOnly && "bg-primary text-white hover:bg-primary/90")}>
                <Link href="/admin/notifications?filter=unread">Unread</Link>
              </Button>
            </div>
            {unreadCount > 0 && (
              <form action={markAllNotificationsRead}>
                <Button type="submit" variant="outline" size="sm">
                  <CheckCheck className="size-3.5" /> Mark all read
                </Button>
              </form>
            )}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Unread", value: unreadCount, hint: "Waiting for your attention" },
          { label: "Today", value: todayCount, hint: "Received since midnight" },
          { label: "All time", value: total, hint: "Kept in this inbox" },
        ].map((stat) => (
          <div key={stat.label} className="border border-border/80 bg-card px-5 py-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-3xl text-primary">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden border border-border/80 bg-card">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
              <Bell className="size-5" />
            </span>
            <p className="font-medium text-primary">
              {unreadOnly ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              When someone submits a contact inquiry or quote request, it will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((item) => {
              const Icon = iconFor(item.type);
              return (
                <li
                  key={item.id}
                  className={cn("flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start", !item.readAt && "bg-accent/[0.05]")}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full",
                      item.readAt ? "bg-secondary text-muted-foreground" : "bg-accent/15 text-accent",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-primary">{item.title}</p>
                      {!item.readAt && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-accent">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.message}</p>
                    <p className="mt-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground/70">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 self-start">
                    <form action={openNotification}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Open <ArrowUpRight className="size-3.5" />
                      </Button>
                    </form>
                    {!item.readAt && (
                      <form action={markNotificationRead}>
                        <input type="hidden" name="id" value={item.id} />
                        <Button type="submit" size="sm" variant="ghost" title="Mark as read">
                          <CheckCheck className="size-3.5" />
                        </Button>
                      </form>
                    )}
                    <form action={deleteNotification}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        title="Delete"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {total > 0 && (
        <form action={clearReadNotifications} className="mt-4">
          <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
            <Trash2 className="size-3.5" /> Clear read notifications
          </Button>
        </form>
      )}
    </div>
  );
}
