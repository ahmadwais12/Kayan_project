"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PhaseSteps } from "@/components/admin/phase-steps";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type AboutPhase = { label: string; hint: string; title: string; description: string };

export function AboutWorkflow({
  phases,
  current,
  content,
}: {
  phases: AboutPhase[];
  current: number;
  content: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const index = Math.max(0, Math.min(phases.length - 1, current));
  const phase = phases[index];
  const go = (next: number) => startTransition(() => router.push(`/admin/about?phase=${next}`));

  return (
    <div className="space-y-5">
      <PhaseSteps steps={phases.map(({ label, hint }) => ({ label, hint }))} current={index} />
      <Card>
        <CardContent className="space-y-5 p-5 sm:p-7">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Phase {index + 1} of {phases.length}
            </p>
            <h2 className="mt-2 font-display text-2xl text-primary">{phase.title}</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{phase.description}</p>
          </header>
          <div className="border-t border-border/70 pt-5">{content}</div>
          <footer className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
            <Button type="button" variant="outline" onClick={() => go(index - 1)} disabled={index === 0 || pending}>
              <ArrowLeft className="size-4" />
              Previous
            </Button>
            {index === phases.length - 1 ? (
              <Button asChild variant="outline">
                <Link href="/about" target="_blank">
                  Open About page
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button type="button" onClick={() => go(index + 1)} disabled={pending}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            )}
          </footer>
        </CardContent>
      </Card>
    </div>
  );
}
