"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import type { NotificationItem } from "@/lib/notifications";

type Viewer = {
  name: string;
  email: string;
  role: { slug: string; name: string; permissions: string[] };
};

export function AdminShell({
  viewer,
  siteName,
  logoUrl,
  notifications,
  unreadCount,
  initialCollapsed,
  children,
}: {
  viewer: Viewer;
  siteName: string;
  logoUrl?: string | null;
  notifications: NotificationItem[];
  unreadCount: number;
  initialCollapsed: boolean;
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
        style={{ "--admin-shell-pad": collapsed ? "116px" : "300px" } as CSSProperties}
      >
        <AdminHeader
          viewer={viewer}
          siteName={siteName}
          logoUrl={logoUrl}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="mx-auto w-full max-w-[1500px] px-4 pb-8 pt-2 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
