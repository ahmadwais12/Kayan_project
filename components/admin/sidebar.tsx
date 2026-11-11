"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { ADMIN_NAV } from "@/components/admin/nav-items";
import { SiteLogo } from "@/components/site-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { hasPermission } from "@/lib/auth/permissions";

type Viewer = {
  name: string;
  email: string;
  role: { slug: string; name: string; permissions: string[] };
};

function NavContent({
  viewer,
  siteName,
  logoUrl,
  onNavigate,
  collapsed = false,
  onToggle,
  unreadCount = 0,
}: {
  viewer: Viewer;
  siteName: string;
  logoUrl?: string | null;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const sessionShape = { user: { role: viewer.role } };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "relative flex shrink-0 border-b border-white/10",
          collapsed
            ? "flex-col items-center justify-center gap-3 px-2 py-4"
            : "items-center gap-3 px-5 py-5",
        )}
      >
        <SiteLogo
          name={siteName}
          logoUrl={logoUrl}
          light
          compact={collapsed}
          hideTagline
        />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "grid size-7 place-items-center rounded-md border border-white/15 text-white/55 transition-colors hover:border-accent/60 hover:text-accent",
              !collapsed && "absolute right-3 top-4",
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        )}
      </div>

      <nav className="admin-scroll flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
        {ADMIN_NAV.map((group, groupIndex) => {
          const items = group.items.filter(
            (item) => !item.permission || hasPermission(sessionShape, item.permission),
          );
          if (!items.length) return null;
          return (
            <div key={group.label} className={collapsed ? "mb-3" : "mb-6"}>
              {collapsed ? (
                groupIndex > 0 && <div className="mx-auto mb-3 h-px w-6 bg-white/10" />
              ) : (
                <p className="px-2.5 pb-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/35">
                  {group.label}
                </p>
              )}
              <ul className="space-y-1">
                {items.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const badge = item.href === "/admin/notifications" ? unreadCount : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center rounded-md py-2 text-[0.82rem] transition-colors",
                          collapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
                          active
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 h-4 w-px -translate-y-1/2 bg-accent transition-opacity",
                            active ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="relative">
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              active ? "text-accent" : "text-white/40 group-hover:text-white/70",
                            )}
                          />
                          {collapsed && badge > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 size-2 rounded-full bg-accent ring-2 ring-primary" />
                          )}
                        </span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && badge > 0 && (
                          <span className="ml-auto rounded-full bg-accent/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-accent">
                            {badge > 99 ? "99+" : badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {collapsed ? (
        <div className="border-t border-white/10 px-2 py-4">
          <span
            title={`${viewer.name} · ${viewer.role.name}`}
            className="mx-auto grid size-9 place-items-center rounded-full bg-accent text-[0.65rem] font-semibold text-primary"
          >
            {initials(viewer.name)}
          </span>
        </div>
      ) : (
        <div className="border-t border-white/10 px-5 py-4">
          <p className="truncate text-xs font-medium text-white/85">{viewer.name}</p>
          <p className="mt-0.5 truncate text-[0.7rem] text-white/40">{viewer.role.name}</p>
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({
  viewer,
  siteName,
  logoUrl,
  collapsed = false,
  onToggle,
  unreadCount = 0,
}: {
  viewer: Viewer;
  siteName: string;
  logoUrl?: string | null;
  collapsed?: boolean;
  onToggle?: () => void;
  unreadCount?: number;
}) {
  return (
    <aside
      className={cn(
        "fixed bottom-4 left-4 top-4 z-40 hidden overflow-hidden rounded-2xl bg-primary shadow-2xl shadow-primary/20 transition-[width] duration-300 lg:block",
        collapsed ? "w-[84px]" : "w-[268px]",
      )}
    >
      <NavContent
        viewer={viewer}
        siteName={siteName}
        logoUrl={logoUrl}
        collapsed={collapsed}
        onToggle={onToggle}
        unreadCount={unreadCount}
      />
    </aside>
  );
}

export function AdminMobileNav({
  viewer,
  siteName,
  logoUrl,
  unreadCount = 0,
}: {
  viewer: Viewer;
  siteName: string;
  logoUrl?: string | null;
  unreadCount?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-card text-primary lg:hidden"
        aria-label="Open admin menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>
        <NavContent
          viewer={viewer}
          siteName={siteName}
          logoUrl={logoUrl}
          onNavigate={() => setOpen(false)}
          unreadCount={unreadCount}
        />
      </SheetContent>
    </Sheet>
  );
}
