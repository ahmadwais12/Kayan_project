import Link from "next/link";
import { Milestone, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { deleteMilestone } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TimelinePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [milestones, query] = await Promise.all([
    prisma.companyMilestone.findMany({ orderBy: [{ sortOrder: "asc" }, { year: "asc" }] }),
    searchParams,
  ]);

  return (
    <div>
      <PageHeader title="Company timeline" description="Milestones shown on the About page. Only add verified company history." breadcrumb={[{ label: "Company Timeline" }]} actions={<Button asChild><Link href="/admin/timeline/new"><Plus className="size-4" /> Add milestone</Link></Button>} />
      <AdminFlash {...flashFromQuery(query)} />
      <div className="space-y-3">
        {milestones.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary"><Milestone className="size-5" /></span><p className="text-sm font-medium text-primary">No milestones yet</p><p className="max-w-sm text-sm text-muted-foreground">Add factual company milestones when they are confirmed.</p></Card>
        ) : milestones.map((item) => (
          <Card key={item.id}><CardContent className="flex items-start gap-4 p-5"><span className="rounded bg-secondary px-2.5 py-1 font-display text-sm font-semibold text-primary">{item.year}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-primary">{item.title}</p>{!item.isPublished && <Badge variant="secondary">Hidden</Badge>}</div>{item.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>}</div><div className="flex shrink-0 items-center gap-1"><ViewButton href={`/admin/records/milestone/${item.id}`} name={item.title} /><Button asChild variant="ghost" size="sm"><Link href={`/admin/timeline/${item.id}/edit`}>Edit</Link></Button><DeleteButton id={item.id} action={deleteMilestone} title="Delete this milestone?" description="This permanently removes the milestone from the timeline." /></div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
