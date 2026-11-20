"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import type { NotificationItem } from "@/lib/notifications";
import type { Locale } from "@/lib/i18n/config";

type Viewer = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: { slug: string; name: string; permissions: string[] };
};

export function AdminShell({
  viewer,
  siteName,
  logoUrl,
  notifications,
  unreadCount,
  initialCollapsed,
  locale,
  children,
}: {
  viewer: Viewer;
  siteName: string;
  logoUrl?: string | null;
  notifications: NotificationItem[];
  unreadCount: number;
  initialCollapsed: boolean;
  locale: Locale;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `kayan_admin_sidebar=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <div className="min-h-svh bg-background">
      <AdminSidebar
        viewer={viewer}
        siteName={siteName}
        logoUrl={logoUrl}
        collapsed={collapsed}
        onToggle={toggleSidebar}
        unreadCount={unreadCount}
      />
      <div
        className="min-w-0 transition-[padding] duration-300 lg:pl-[var(--admin-shell-pad)]"
        style={{ "--admin-shell-pad": collapsed ? "108px" : "304px" } as CSSProperties}
      >
        <AdminHeader
          viewer={viewer}
          siteName={siteName}
          logoUrl={logoUrl}
          notifications={notifications}
          unreadCount={unreadCount}
          locale={locale}
        />
        <main className="mx-auto w-full max-w-[1500px] px-4 pb-8 pt-2 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
