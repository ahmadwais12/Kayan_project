"use client";

import Link from "next/link";
import { Bell, CheckCheck, FileText, Inbox, Sparkles } from "lucide-react";
import { openNotification, markAllNotificationsRead } from "@/actions/notifications";
import type { NotificationItem } from "@/lib/notifications";
import { cn, formatDateTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function NotificationIcon({ type }: { type: string }) {
  if (type === "inquiry") return <Inbox className="size-4" />;
  if (type === "quote") return <FileText className="size-4" />;
  return <Sparkles className="size-4" />;
}

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}
          className="relative grid size-10 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[0.58rem] font-semibold leading-4 text-primary ring-2 ring-card">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium text-primary">Notifications</p>
            <p className="text-[0.68rem] text-muted-foreground">
              {unreadCount ? `${unreadCount} unread` : "You are all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[0.68rem] font-medium text-primary transition-colors hover:bg-secondary"
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            </form>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
              <Bell className="size-4" />
            </span>
            <p className="text-sm font-medium text-primary">Nothing new</p>
            <p className="text-xs text-muted-foreground">
              New inquiries, quote requests and account updates will appear here.
            </p>
          </div>
        ) : (
          <ul className="max-h-[22rem] divide-y divide-border/60 overflow-y-auto">
            {notifications.map((item) => (
              <li key={item.id}>
                <form action={openNotification}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                      !item.isRead && "bg-accent/[0.06]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                        item.isRead ? "bg-secondary text-muted-foreground" : "bg-accent/15 text-accent",
                      )}
                    >
                      <NotificationIcon type={item.type} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[0.8rem] font-medium text-primary">
                          {item.title}
                        </span>
                        {!item.isRead && <span className="size-1.5 shrink-0 rounded-full bg-accent" />}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                        {item.message}
                      </span>
                      <span className="mt-1 block text-[0.62rem] uppercase tracking-wide text-muted-foreground/70">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <DropdownMenuSeparator className="m-0" />
        <Link
          href="/admin/notifications"
          className="block px-4 py-3 text-center text-xs font-medium text-primary transition-colors hover:bg-secondary/60"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
