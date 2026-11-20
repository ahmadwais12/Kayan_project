import Link from "next/link";
import { Gauge, ListChecks, Plus, Sparkles, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { deleteCompanyStat, deleteCoreValue, deleteProcessStep, deleteWhyItem } from "@/actions/content";

export const dynamic = "force-dynamic";

function EmptyState({ icon: Icon, title, body }: { icon: typeof Gauge; title: string; body: string }) {
  return <div className="flex flex-col items-center gap-3 px-6 py-12 text-center"><span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary"><Icon className="size-5" /></span><p className="text-sm font-medium text-primary">{title}</p><p className="max-w-sm text-sm text-muted-foreground">{body}</p></div>;
}

function SectionHeader({ title, kind, icon: Icon }: { title: string; kind: string; icon: typeof Gauge }) {
  return <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Icon className="size-5 text-accent-foreground" /><h2 className="font-display text-2xl text-primary">{title}</h2></div><Button asChild size="sm"><Link href={`/admin/content/${kind}/new`}><Plus className="size-4" /> Add</Link></Button></div>;
}

function RecordActions({ href, viewHref, name, id, action, title, description }: { href: string; viewHref: string; name: string; id: string; action: (data: FormData) => void | Promise<void>; title: string; description: string }) {
  return <div className="flex shrink-0 items-center gap-1"><ViewButton href={viewHref} name={name} /><Button asChild variant="ghost" size="sm"><Link href={href}>Edit</Link></Button><DeleteButton id={id} action={action} title={title} description={description} /></div>;
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [query, stats, values, process, why] = await Promise.all([
    searchParams,
    prisma.companyStatistic.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
    prisma.coreValue.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
    prisma.processStep.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
    prisma.whyChooseItem.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader title="Process & values" description="Manage the content blocks used across the homepage and About page." breadcrumb={[{ label: "Process & Values" }]} />
      <AdminFlash {...flashFromQuery(query)} />

      <section>
        <SectionHeader title="Company statistics" kind="stats" icon={Gauge} />
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">Statistics are only displayed when a real value is provided. Seeded placeholders use an em dash and stay hidden from the public site.</p>
        <Card className="overflow-hidden">{stats.length === 0 ? <EmptyState icon={Gauge} title="No statistics yet" body="Add verified figures only." /> : <div className="divide-y divide-border/70">{stats.map((item) => <div key={item.id} className="flex items-center gap-3 px-5 py-3.5"><div className="min-w-0 flex-1"><p className="font-medium text-primary">{item.value}{item.suffix}</p><p className="text-xs text-muted-foreground">{item.label}</p></div>{!item.isActive && <Badge variant="secondary">Hidden</Badge>}<RecordActions href={`/admin/content/stats/${item.id}/edit`} viewHref={`/admin/records/stat/${item.id}`} name={`${item.value}${item.suffix ?? ""}`} id={item.id} action={deleteCompanyStat} title="Delete this statistic?" description="This permanently removes the statistic." /></div>)}</div>}</Card>
      </section>

      <section>
        <SectionHeader title="Core values" kind="values" icon={Star} />
        <Card className="overflow-hidden">{values.length === 0 ? <EmptyState icon={Star} title="No values yet" body="Describe the principles that guide the studio." /> : <div className="divide-y divide-border/70">{values.map((item) => <div key={item.id} className="flex items-center gap-3 px-5 py-3.5"><div className="min-w-0 flex-1"><p className="font-medium text-primary">{item.title}</p><p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p></div>{!item.isActive && <Badge variant="secondary">Hidden</Badge>}<RecordActions href={`/admin/content/values/${item.id}/edit`} viewHref={`/admin/records/value/${item.id}`} name={item.title} id={item.id} action={deleteCoreValue} title="Delete this value?" description="This permanently removes the value." /></div>)}</div>}</Card>
      </section>

      <section>
        <SectionHeader title="Process steps" kind="process" icon={ListChecks} />
        <Card className="overflow-hidden">{process.length === 0 ? <EmptyState icon={ListChecks} title="No process steps yet" body="Outline how a project moves from first conversation to handover." /> : <div className="divide-y divide-border/70">{process.map((item, index) => <div key={item.id} className="flex items-center gap-3 px-5 py-3.5"><span className="font-display text-lg text-accent-foreground">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><p className="font-medium text-primary">{item.title}</p><p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p></div>{!item.isActive && <Badge variant="secondary">Hidden</Badge>}<RecordActions href={`/admin/content/process/${item.id}/edit`} viewHref={`/admin/records/process-step/${item.id}`} name={item.title} id={item.id} action={deleteProcessStep} title="Delete this process step?" description="This permanently removes the step." /></div>)}</div>}</Card>
      </section>

      <section>
        <SectionHeader title="Why choose us" kind="why" icon={Sparkles} />
        <Card className="overflow-hidden">{why.length === 0 ? <EmptyState icon={Sparkles} title="No items yet" body="Explain what distinguishes the studio's approach." /> : <div className="divide-y divide-border/70">{why.map((item) => <div key={item.id} className="flex items-center gap-3 px-5 py-3.5"><div className="min-w-0 flex-1"><p className="font-medium text-primary">{item.title}</p><p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p></div>{!item.isActive && <Badge variant="secondary">Hidden</Badge>}<RecordActions href={`/admin/content/why/${item.id}/edit`} viewHref={`/admin/records/why/${item.id}`} name={item.title} id={item.id} action={deleteWhyItem} title="Delete this item?" description="This permanently removes the item." /></div>)}</div>}</Card>
      </section>
    </div>
  );
}
