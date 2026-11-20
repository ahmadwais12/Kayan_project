"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, UserRound } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { AdminAvatar } from "@/components/admin/admin-avatar";
import { ADMIN_NAV, type AdminNavItem } from "@/components/admin/nav-items";
import { SiteLogo } from "@/components/site-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { hasPermission } from "@/lib/auth/permissions";

type Viewer = {
  name: string;
  email: string;
  avatarUrl?: string | null;
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
  const profileActive = pathname === "/admin/profile" || pathname.startsWith("/admin/profile/");

  const isItemActive = (item: AdminNavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-border/60",
          collapsed ? "flex-col gap-2 px-2 py-4" : "gap-2 px-3.5 py-4",
        )}
      >
        <SiteLogo
          name={siteName}
          logoUrl={logoUrl}
          compact={collapsed}
          hideTagline
          className={cn(collapsed ? "justify-center" : "min-w-0")}
        />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
              !collapsed && "ml-auto",
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
          </button>
        )}
      </div>

      <nav
        aria-label="Admin navigation"
        className={cn(
          "admin-scroll flex-1 overflow-y-auto overflow-x-hidden py-3",
          collapsed ? "px-2" : "px-2.5",
        )}
      >
        {ADMIN_NAV.map((group, index) => {
          const items = group.items.filter(
            (item) => !item.permission || hasPermission(sessionShape, item.permission),
          );
          if (!items.length) return null;

          return (
            <div
              key={group.label}
              className={cn(
                collapsed
                  ? index > 0 && "mt-2.5 border-t border-border/60 pt-2.5"
                  : "mb-4 last:mb-0",
              )}
            >
              {!collapsed && (
                <p className="px-2 pb-1.5 text-[0.56rem] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
                  {group.label}
                </p>
              )}

              <ul className={cn(collapsed ? "flex flex-col items-center gap-1" : "space-y-0.5")}>
                {items.map((item) => {
                  const active = isItemActive(item);
                  const Icon = item.icon;
                  const badge = item.href === "/admin/notifications" ? unreadCount : 0;
                  return (
                    <li key={item.href} className={cn(collapsed && "w-full")}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                          collapsed
                            ? "mx-auto size-10 justify-center rounded-lg"
                            : "gap-2.5 rounded-lg py-2 pl-2 pr-2.5 text-[0.86rem]",
                          active
                            ? "bg-secondary font-semibold text-ink"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-ink",
                          collapsed && active && "bg-accent/15 text-accent ring-1 ring-accent/40",
                        )}
                      >
                        {!collapsed && (
                          <span
                            aria-hidden
                            className={cn(
                              "absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity",
                              active ? "opacity-100" : "opacity-0",
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            "grid shrink-0 place-items-center rounded-md transition-colors",
                            !collapsed && "size-7",
                            active
                              ? "bg-accent/15 text-accent"
                              : "text-muted-foreground/80 group-hover:text-ink",
                          )}
                        >
                          <Icon className="size-[1.05rem]" />
                        </span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {badge > 0 &&
                          (collapsed ? (
                            <span className="absolute right-1 top-1 size-2 rounded-full bg-accent ring-2 ring-card" />
                          ) : (
                            <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[0.56rem] font-bold leading-none text-primary">
                              {badge > 99 ? "99+" : badge}
                            </span>
                          ))}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className={cn("shrink-0 border-t border-border/60", collapsed ? "px-2 py-3" : "p-3")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/admin/profile"
              onClick={onNavigate}
              title="Profile"
              aria-label="Profile"
              className={cn(
                "grid size-10 place-items-center rounded-full transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                profileActive ? "ring-2 ring-accent" : "ring-2 ring-border hover:ring-accent/60",
              )}
            >
              <AdminAvatar
                name={viewer.name}
                avatarUrl={viewer.avatarUrl}
                className="size-full rounded-full bg-primary text-primary-foreground"
              />
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Log out"
                aria-label="Log out"
                className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 bg-background/70 p-1.5">
            <Link
              href="/admin/profile"
              onClick={onNavigate}
              className={cn(
                "flex min-w-0 items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                profileActive ? "bg-secondary" : "hover:bg-secondary/60",
              )}
            >
              <AdminAvatar
                name={viewer.name}
                avatarUrl={viewer.avatarUrl}
                className="size-8 shrink-0 rounded-full bg-primary text-[0.62rem] font-semibold text-primary-foreground"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-ink">{viewer.name}</span>
                <span className="block truncate text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
                  {viewer.role.name}
                </span>
              </span>
            </Link>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <Link
                href="/admin/profile"
                onClick={onNavigate}
                className="flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[0.66rem] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <UserRound className="size-3.5" /> Profile
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[0.66rem] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  <LogOut className="size-3.5" /> Log out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
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
        "fixed bottom-4 left-4 top-4 z-40 hidden overflow-hidden rounded-2xl border border-border/80 bg-card text-foreground shadow-[0_24px_60px_-32px_rgba(23,43,53,0.45)] transition-[width] duration-300 lg:block dark:border-white/10 dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]",
        collapsed ? "w-[76px]" : "w-[272px]",
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
      <SheetContent className="w-[300px] border-border bg-card p-0 text-foreground [&>button]:text-muted-foreground [&>button:hover]:bg-secondary [&>button:hover]:text-ink">
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
