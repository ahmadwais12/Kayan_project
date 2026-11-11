import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { SiteLogo } from "@/components/site-logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const settings = await getSettings();

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <Image
          src="/images/hero.jpg"
          alt="Modern architectural residence at dusk"
          fill
          priority
          className="object-cover opacity-80"
          sizes="55vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/25 to-primary/10" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <SiteLogo logoUrl={settings.logoUrl} light />
          <div className="max-w-lg">
            <p className="eyebrow">Kayan Land Studio</p>
            <p className="mt-5 font-display text-4xl leading-[1.15] text-white">
              {settings.tagline}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-white/65">
              Content management for the Kayan Land public website — projects,
              services, media, inquiries, and studio settings.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <SiteLogo logoUrl={settings.logoUrl} />
          </div>

          <div className="mt-10 lg:mt-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">
              Administration
            </p>
            <h1 className="mt-3 font-display text-4xl text-primary">Welcome back.</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sign in to manage the Kayan Land website.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm next={next} />
          </div>

          <Link
            href="/"
            className="mt-10 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            Back to the website
          </Link>
        </div>
      </div>
    </div>
  );
}
