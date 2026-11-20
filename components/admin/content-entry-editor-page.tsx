import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { ContentEntryForm, type ContentEntryKind } from "@/components/admin/content-entry-form";

const KINDS = ["stats", "values", "process", "why"] as const;
const LABELS: Record<ContentEntryKind, string> = { stats: "statistic", values: "core value", process: "process step", why: "reason" };

async function findEntry(kind: ContentEntryKind, id: string) {
  switch (kind) {
    case "stats": return prisma.companyStatistic.findUnique({ where: { id } });
    case "values": return prisma.coreValue.findUnique({ where: { id } });
    case "process": return prisma.processStep.findUnique({ where: { id } });
    case "why": return prisma.whyChooseItem.findUnique({ where: { id } });
  }
}

export async function ContentEntryEditorPage({
  kindName,
  id,
  searchParams,
}: {
  kindName: string;
  id?: string;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const kind = KINDS.find((value) => value === kindName);
  if (!kind) notFound();
  await requirePermission("content.manage");
  const [item, query, media] = await Promise.all([
    id ? findEntry(kind, id) : Promise.resolve(undefined),
    searchParams,
    kind === "process"
      ? prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } })
      : Promise.resolve([]),
  ]);
  if (id && !item) notFound();
  return (
    <div>
      <PageHeader
        title={`${item ? "Edit" : "Add"} ${LABELS[kind]}`}
        description="Update this content block and its display settings."
        breadcrumb={[{ label: "Process & values", href: "/admin/content" }, { label: item ? "Edit item" : "New item" }]}
      />
      <AdminFlash {...flashFromQuery(query)} />
      <ContentEntryForm kind={kind} item={item || undefined} media={media} />
    </div>
  );
}
