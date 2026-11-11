import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { SiteLogo } from "@/components/site-logo";
import { ForgotPasswordForm } from "@/components/admin/password-forms";

export const metadata = { title: "Password Reset", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const settings = await getSettings();
  return (
    <div className="flex min-h-svh items-center justify-center bg-sand px-6 py-12">
      <div className="w-full max-w-md">
        <SiteLogo logoUrl={settings.logoUrl} />
        <div className="mt-10 rounded-lg border bg-card p-7 shadow-sm sm:p-9">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">
            Account recovery
          </p>
          <h1 className="mt-3 font-display text-3xl text-primary">Reset your password</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Enter the email address linked to your administrator account. A
            one-hour reset link will be issued if the account exists.
          </p>
          <div className="mt-7">
            <ForgotPasswordForm />
          </div>
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
