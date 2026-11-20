import Link from "next/link";
import { HelpCircle, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { deleteFaq } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function FaqsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;

  const items = await prisma.fAQ.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="FAQs"
        description="Frequently asked questions appear on the FAQ page and, when enabled, beside services."
        breadcrumb={[{ label: "FAQs" }]}
        actions={<div className="flex items-center gap-2"><Button asChild variant="outline"><Link href="/admin/faqs/categories">Categories</Link></Button><Button asChild><Link href="/admin/faqs/new"><Plus className="size-4" /> Add FAQ</Link></Button></div>}
      />

      <AdminFlash {...flashFromQuery(query)} />

      <Card className="overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <HelpCircle className="size-5" />
              </span>
              <p className="text-sm font-medium text-primary">No FAQs yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Answer the questions clients ask most often during enquiries.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-primary">{item.question}</p>
                      {!item.isActive && <Badge variant="secondary">Hidden</Badge>}
                      {item.showOnService && <Badge variant="info">Service</Badge>}
                    </div>
                    <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">{item.answer}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.category?.name || "Uncategorised"} · order {item.sortOrder}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <ViewButton href={`/admin/records/faq/${item.id}`} name={item.question} />
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/faqs/${item.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton
                      id={item.id}
                      action={deleteFaq}
                      title="Delete this FAQ?"
                      description="This permanently removes the question and answer."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
      </Card>
    </div>
  );
}
