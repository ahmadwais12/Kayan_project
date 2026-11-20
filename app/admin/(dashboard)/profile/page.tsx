import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock,
  KeyRound,
  Laptop,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SubmitButton } from "@/components/admin/form-kit";
import { AvatarInput } from "@/components/admin/avatar-input";
import { saveProfile, changeOwnPassword, revokeOtherSessions } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn, formatDateTime, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "profile.update": "Profile details updated",
  "profile.password_change": "Password changed",
  "profile.revoke_sessions": "Other sessions signed out",
  "user.create": "Administrator created",
  "user.update": "Administrator updated",
  "settings.update": "Website settings updated",
};

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "details", label: "Personal details", icon: UserRound },
  { key: "security", label: "Security", icon: KeyRound },
  { key: "activity", label: "Activity", icon: Activity },
] as const;

function actionLabel(action: string) {
  return ACTION_LABELS[action] || action.replaceAll(".", " · ").replaceAll("_", " ");
}

function tabHref(key: string) {
  return key === "overview" ? "/admin/profile" : `/admin/profile?tab=${key}`;
}

function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <h3 className="font-display text-lg text-primary">{title}</h3>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireAdmin();
  const query = await searchParams;
  const tab = TABS.find((item) => item.key === query.tab)?.key ?? "overview";

  const [user, sessions, recentActivity, auditCount] = await Promise.all([
    prisma.adminUser.findUnique({
      where: { id: session.user.id },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    }),
    prisma.adminSession.findMany({
      where: { userId: session.user.id, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: "desc" },
    }),
    prisma.auditLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.auditLog.count({ where: { userId: session.user.id } }),
  ]);

  if (!user) return null;
  const permissionKeys = user.role.permissions.map((item) => item.permission.key);
  const overviewActivity = recentActivity.slice(0, 5);

  const activityList = (entries: typeof recentActivity) =>
    entries.length === 0 ? (
      <div className="px-6 py-10 text-center">
        <Clock className="mx-auto size-5 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No account activity recorded yet.</p>
      </div>
    ) : (
      <ol className="px-6 py-5">
        {entries.map((entry, index) => (
          <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
            {index < entries.length - 1 && (
              <span className="absolute left-[5px] top-3 h-full w-px bg-border" aria-hidden="true" />
            )}
            <span className="relative mt-1.5 size-2.5 shrink-0 rounded-full border border-accent bg-card" />
            <div className="min-w-0">
              <p className="text-sm capitalize text-primary">{actionLabel(entry.action)}</p>
              <p className="mt-0.5 text-[0.65rem] text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
            </div>
          </li>
        ))}
      </ol>
    );

  return (
    <div>
      <PageHeader
        title="My profile"
        description="Your identity, sign-in security and recent account activity."
        breadcrumb={[{ label: "Profile" }]}
      />
      <AdminFlash {...flashFromQuery(query)} />

      <nav
        aria-label="Profile sections"
        className="mb-6 -mx-1 overflow-x-auto rounded-xl border border-border/80 bg-card p-1.5 shadow-sm"
      >
        <div className="flex min-w-max items-center gap-1">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = item.key === tab;
            return (
              <Link
                key={item.key}
                href={tabHref(item.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-primary",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {tab === "overview" && (
        <>
          <section className="relative overflow-hidden rounded-xl bg-primary text-white">
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, transparent 0 38px, rgba(196,154,104,0.55) 38px 39px)",
              }}
              aria-hidden="true"
            />
            <div className="absolute -right-24 -top-24 size-72 rounded-full border border-white/10" aria-hidden="true" />
            <div className="absolute -bottom-32 right-16 size-80 rounded-full border border-accent/20" aria-hidden="true" />

            <div className="relative flex flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-accent/50 bg-white/5 font-display text-3xl text-accent">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
                  ) : (
                    initials(user.name)
                  )}
                  <span className="absolute bottom-1.5 right-1.5 size-3.5 rounded-full border-2 border-primary bg-emerald-400" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-accent">
                    <Sparkles className="size-3" /> Signed in
                  </p>
                  <h2 className="mt-2 font-display text-3xl leading-tight text-white sm:text-4xl">{user.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/55">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5 text-accent/80" /> {user.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-accent/80" /> {user.role.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-accent/80" /> Joined {formatDateTime(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="light" size="sm" className="bg-accent text-primary hover:bg-accent/90">
                  <Link href={tabHref("details")}>
                    <UserRound className="size-3.5" /> Edit details
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/25 text-white hover:border-white hover:bg-white hover:text-primary"
                >
                  <Link href={tabHref("security")}>
                    <KeyRound className="size-3.5" /> Security
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
              {[
                { label: "Role", value: user.role.name },
                { label: "Permissions", value: user.role.slug === "super-admin" ? "All access" : String(permissionKeys.length) },
                { label: "Devices", value: String(sessions.length) },
                { label: "Sign-ins logged", value: String(auditCount) },
              ].map((stat) => (
                <div key={stat.label} className="border-r border-white/10 px-5 py-4 last:border-r-0">
                  <p className="text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-white/35">{stat.label}</p>
                  <p className="mt-1 truncate font-display text-lg text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
            <SectionCard
              icon={Activity}
              title="Recent activity"
              description="Your latest actions in the admin console."
              action={
                <Link href={tabHref("activity")} className="text-xs font-medium text-accent hover:underline">
                  View all
                </Link>
              }
            >
              {activityList(overviewActivity)}
            </SectionCard>

            <div className="space-y-6">
              <SectionCard icon={ShieldCheck} title="Access" description="Your role and granted permissions.">
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-primary text-accent">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium text-primary">{user.role.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.role.slug === "super-admin"
                          ? "Full access to every module"
                          : `${permissionKeys.length} permission${permissionKeys.length === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-border/70 px-3 py-2.5">
                      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Last sign-in</p>
                      <p className="mt-1 text-sm text-primary">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}</p>
                    </div>
                    <div className="rounded-md border border-border/70 px-3 py-2.5">
                      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Member since</p>
                      <p className="mt-1 text-sm text-primary">{formatDateTime(user.createdAt)}</p>
                    </div>
                  </div>
                  {user.role.slug !== "super-admin" && permissionKeys.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {permissionKeys.map((key) => (
                        <span key={key} className="rounded bg-secondary px-2 py-0.5 font-mono text-[0.62rem] text-primary">
                          {key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>

              <section className="rounded-xl border border-accent/30 bg-accent/[0.07] px-6 py-5">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-accent">Account safety</p>
                <p className="mt-2 text-sm leading-relaxed text-primary/80">
                  Keep your password private and review signed-in devices regularly. If you notice a device you do
                  not recognise, change your password immediately.
                </p>
              </section>
            </div>
          </div>
        </>
      )}

      {tab === "details" && (
        <div className="max-w-3xl">
          <SectionCard
            icon={UserRound}
            title="Personal details"
            description="The name, photo and email shown across the admin console."
            action={
              <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-medium text-emerald-700 sm:inline">
                Verified account
              </span>
            }
          >
            <form action={saveProfile} className="px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" defaultValue={user.name} required maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" defaultValue={user.email} required maxLength={200} />
                </div>
              </div>
              <div className="mt-5">
                <AvatarInput
                  name="avatarUrl"
                  defaultValue={user.avatarUrl || ""}
                  help="Optional. Upload a square image (JPG, PNG, WebP or AVIF, up to 8 MB) or paste an external URL."
                />
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-5">
                <p className="text-xs text-muted-foreground">Changes are recorded in the audit log.</p>
                <SubmitButton>Save details</SubmitButton>
              </div>
            </form>
          </SectionCard>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-4xl space-y-6">
          <SectionCard
            icon={KeyRound}
            title="Password & security"
            description="Use at least 12 characters. Changing it signs out every other device."
          >
            <form action={changeOwnPassword} className="px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" name="current" type="password" required autoComplete="current-password" />
                </div>
                <div>
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Your current session stays signed in.
                </p>
                <SubmitButton variant="accent">Update password</SubmitButton>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            icon={Laptop}
            title="Signed-in devices"
            description="Active sessions expire automatically after seven days."
            action={
              sessions.length > 1 ? (
                <form action={revokeOtherSessions}>
                  <Button type="submit" variant="outline" size="sm">
                    Sign out others
                  </Button>
                </form>
              ) : undefined
            }
          >
            <ul className="divide-y divide-border/60">
              {sessions.map((item) => {
                const current = item.id === session.sessionId;
                return (
                  <li key={item.id} className="flex items-start gap-3 px-6 py-4">
                    <span
                      className={cn(
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full",
                        current ? "bg-emerald-50 text-emerald-700" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      <Laptop className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-primary">
                        {item.userAgent ? item.userAgent.slice(0, 90) : "Unknown device"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {current ? "This device" : `Last active ${formatDateTime(item.lastSeenAt)}`}
                        {item.ip ? ` · ${item.ip}` : ""}
                      </p>
                    </div>
                    {current && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-medium text-emerald-700">
                        Current
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>
      )}

      {tab === "activity" && (
        <div className="grid items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
          <SectionCard
            icon={Activity}
            title="Recent activity"
            description="Your latest actions in the admin console."
            action={
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.6rem] font-medium text-muted-foreground">
                Latest {overviewActivity.length} of {auditCount}
              </span>
            }
          >
            {activityList(overviewActivity)}
          </SectionCard>

          <section className="rounded-xl border border-accent/30 bg-accent/[0.07] px-6 py-5">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-accent">Account safety</p>
            <p className="mt-2 text-sm leading-relaxed text-primary/80">
              Keep your password private and review signed-in devices regularly. If you notice a device you do
              not recognise, change your password immediately.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={tabHref("security")}>
                <KeyRound className="size-3.5" /> Review security
              </Link>
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}
