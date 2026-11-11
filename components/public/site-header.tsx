"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, LogIn, Menu } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale, Theme } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export type PublicNavItem = {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
  children: PublicNavItem[];
};

function isActive(pathname: string, url: string) {
  if (url === "/") return pathname === "/";
  if (url.startsWith("http") || url.startsWith("#")) return false;
  return pathname === url || pathname.startsWith(`${url}/`);
}

function NavLink({
  item,
  pathname,
  mobile,
  onNavigate,
}: {
  item: PublicNavItem;
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, item.url);
  const external = item.openInNewTab || item.url.startsWith("http");

  if (mobile) {
    return (
      <div className="border-b border-white/8">
        <Link
          href={item.url}
          onClick={onNavigate}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className={cn(
            "flex items-center justify-between py-3.5 text-[0.95rem]",
            active ? "text-accent" : "text-white/80",
          )}
        >
          {item.label}
        </Link>
        {item.children.length > 0 && (
          <ul className="pb-3 ps-4">
            {item.children.map((child) => (
              <li key={child.id}>
                <SheetClose asChild>
                  <Link
                    href={child.url}
                    className="block py-1.5 text-sm text-white/50 hover:text-white/85"
                  >
                    {child.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={item.url}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className={cn(
          "relative flex items-center gap-1 py-1.5 text-[0.78rem] font-medium tracking-[0.04em] transition-colors",
          active ? "text-primary" : "text-foreground/70 hover:text-primary",
        )}
      >
        {item.label}
        {item.children.length > 0 && <ChevronDown className="size-3 opacity-60" />}
        <span
          className={cn(
            "absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300",
            active ? "w-full" : "w-0 group-hover:w-full",
          )}
        />
      </Link>
      {item.children.length > 0 && (
        <div className="invisible absolute start-0 top-full z-50 w-56 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <div className="border border-border bg-card py-2 shadow-xl">
            {item.children.map((child) => (
              <Link
                key={child.id}
                href={child.url}
                target={child.openInNewTab || child.url.startsWith("http") ? "_blank" : undefined}
                rel={child.openInNewTab ? "noreferrer" : undefined}
                className="block px-4 py-2 text-[0.8rem] text-foreground/70 transition-colors hover:bg-secondary/60 hover:text-primary"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader({
  siteName,
  logoUrl,
  items,
  email,
  phone,
  locale,
  theme,
}: {
  siteName: string;
  logoUrl?: string | null;
  items: PublicNavItem[];
  email?: string;
  phone?: string;
  locale: Locale;
  theme?: Theme;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const t = getDictionary(locale);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cn(
          "border-b transition-all duration-300",
          scrolled
            ? "border-border/80 bg-background/95 shadow-[0_1px_0_rgba(23,43,53,0.04)] backdrop-blur-md"
            : "border-transparent bg-background",
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <SiteLogo name={siteName} logoUrl={logoUrl} hideTagline />

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Main navigation">
            {items.map((item) => (
              <NavLink key={item.id} item={item} pathname={pathname} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <ThemeToggle
              theme={theme}
              labels={{ light: t.lightMode, dark: t.darkMode }}
            />
            <Link
              href="/admin/login"
              className="hidden items-center gap-2 border border-primary/20 px-4 py-3 text-[0.72rem] font-semibold tracking-[0.12em] text-primary uppercase transition-colors hover:border-primary hover:bg-primary hover:text-white xl:flex"
            >
              <LogIn className="size-3.5" /> {t.login}
            </Link>
            <Link
              href="/quote"
              className="btn-shine hidden items-center gap-2 bg-primary px-5 py-3 text-[0.72rem] font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-accent hover:text-primary md:inline-flex"
            >
              {t.startProject} <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="inline-flex size-10 items-center justify-center border border-primary/20 text-primary lg:hidden"
                aria-label={t.openMenu}
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent>
                <SheetTitle className="sr-only">{t.openMenu}</SheetTitle>
                <div className="flex h-full min-h-0 flex-col">
                  <div className="border-b border-white/10 px-5 py-5">
                    <SiteLogo name={siteName} logoUrl={logoUrl} light hideTagline />
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {items.map((item) => (
                      <NavLink
                        key={item.id}
                        item={item}
                        pathname={pathname}
                        mobile
                        onNavigate={() => setOpen(false)}
                      />
                    ))}
                  </div>
                  <div className="border-t border-white/10 px-5 py-5">
                    <SheetClose asChild>
                      <Link
                        href="/admin/login"
                        className="mb-2.5 flex w-full items-center justify-center gap-2 border border-white/25 px-4 py-3 text-[0.72rem] font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:border-accent hover:text-accent"
                      >
                        <LogIn className="size-3.5" /> {t.login}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/quote"
                        className="flex w-full items-center justify-center gap-2 bg-accent px-4 py-3 text-[0.72rem] font-semibold tracking-[0.12em] text-primary uppercase"
                      >
                        {t.startProject} <ArrowRight className="size-3.5 rtl:rotate-180" />
                      </Link>
                    </SheetClose>
                    {(email || phone) && (
                      <div className="mt-4 space-y-1.5 text-xs text-white/55">
                        {email && (
                          <a href={`mailto:${email}`} className="block hover:text-white">
                            {email}
                          </a>
                        )}
                        {phone && (
                          <a href={`tel:${phone.replace(/\s+/g, "")}`} className="block hover:text-white">
                            {phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
