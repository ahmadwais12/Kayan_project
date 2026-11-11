import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { SiteLogo } from "@/components/site-logo";
import { ResetPasswordForm } from "@/components/admin/password-forms";

export const metadata = { title: "Choose a New Password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const settings = await getSettings();
  return (
    <div className="flex min-h-svh items-center justify-center bg-sand px-6 py-12">
      <div className="w-full max-w-md">
        <SiteLogo logoUrl={settings.logoUrl} />
        <div className="mt-10 rounded-lg border bg-card p-7 shadow-sm sm:p-9">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">
            Account recovery
          </p>
          <h1 className="mt-3 font-display text-3xl text-primary">Choose a new password</h1>
          {token ? (
            <div className="mt-7">
              <ResetPasswordForm token={String(token)} />
            </div>
          ) : (
            <p className="mt-5 rounded-md bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              This reset link is missing its token. Request a new link from the{" "}
              <Link href="/admin/forgot-password" className="underline">
                recovery page
              </Link>
              .
            </p>
          )}
        </div>
        <Link
          href="/admin/login"
          className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
