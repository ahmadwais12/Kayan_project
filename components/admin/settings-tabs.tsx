import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "General", href: "/admin/settings" },
  { label: "Branding", href: "/admin/settings/branding" },
  { label: "Contact", href: "/admin/settings/contact" },
  { label: "Navigation", href: "/admin/settings/navigation" },
  { label: "Footer", href: "/admin/settings/footer" },
  { label: "Social", href: "/admin/settings/social" },
  { label: "SEO", href: "/admin/settings/seo" },
  { label: "Redirects", href: "/admin/settings/redirects" },
  { label: "Theme", href: "/admin/settings/theme" },
];

export function SettingsTabs({ active }: { active: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-1 rounded-lg border border-border/70 bg-card p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            active === tab.href
              ? "bg-primary text-white"
              : "text-muted-foreground hover:bg-secondary hover:text-primary",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
