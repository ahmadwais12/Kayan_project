"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, KeyRound, LogOut, User } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { ADMIN_NAV } from "@/components/admin/nav-items";
import { AdminMobileNav } from "@/components/admin/sidebar";
import { NotificationBell } from "@/components/admin/notification-bell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { NotificationItem } from "@/lib/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminAvatar } from "@/components/admin/admin-avatar";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import type { Locale } from "@/lib/i18n/config";

type Viewer = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: { slug: string; name: string; permissions: string[] };
};

export function AdminHeader({
  viewer,
  siteName,
  logoUrl,
  notifications = [],
  unreadCount = 0,
  locale,
}: {
  viewer: Viewer;
  siteName: string;
  logoUrl?: string | null;
  notifications?: NotificationItem[];
  unreadCount?: number;
  locale: Locale;
}) {
  const pathname = usePathname();
  const flat = ADMIN_NAV.flatMap((group) => group.items);
  const current =
    [...flat]
      .sort((a, b) => b.href.length - a.href.length)
      .find(
        (item) =>
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)),
      ) || flat[0];

  return (
    <header className="sticky top-4 z-30 mx-4 mt-4 flex h-16 items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/95 px-3 shadow-sm shadow-primary/5 backdrop-blur sm:mx-6 sm:px-4 lg:mx-8">
      <div className="flex min-w-0 items-center gap-3">
        <AdminMobileNav
          viewer={viewer}
          siteName={siteName}
          logoUrl={logoUrl}
          unreadCount={unreadCount}
        />
        <div className="min-w-0">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Content management
          </p>
          <p className="truncate text-sm font-medium text-primary">{current?.label}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher locale={locale} compact />
        <ThemeToggle className="size-9 rounded-md border-border" />
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View website"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary sm:px-3"
        >
          <span className="hidden sm:inline">View website</span>
          <ExternalLink className="size-3.5" />
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-3 transition-colors hover:border-primary/25"
              aria-label="Account menu"
            >
              <AdminAvatar
                name={viewer.name}
                avatarUrl={viewer.avatarUrl}
                className="size-8 bg-primary text-[0.7rem] font-semibold text-white"
              />
              <span className="hidden text-left sm:block">
                <span className="block max-w-32 truncate text-xs font-medium text-primary">
                  {viewer.name}
                </span>
                <span className="block text-[0.6rem] uppercase tracking-wide text-muted-foreground">
                  {viewer.role.name}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>{viewer.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile">
                <User className="size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/profile?tab=security">
                <KeyRound className="size-4" /> Change password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/5"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
