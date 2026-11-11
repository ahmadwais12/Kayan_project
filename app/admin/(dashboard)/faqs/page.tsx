import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/form-kit";
import { saveFaq, deleteFaq } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function FaqsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;

  const [items, categories] = await Promise.all([
    prisma.fAQ.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: { select: { name: true } } },
    }),
    prisma.faqCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  const editing = query.edit ? items.find((item) => item.id === query.edit) : undefined;

  return (
    <div>
      <PageHeader
        title="FAQs"
        description="Frequently asked questions appear on the FAQ page and, when enabled, beside services."
        breadcrumb={[{ label: "FAQs" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/faqs/categories">Categories</Link>
          </Button>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.5fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit FAQ" : "Add FAQ"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveFaq} className="space-y-4">
              <input type="hidden" name="id" value={editing?.id || ""} />
              <div>
                <Label htmlFor="question">Question</Label>
                <Input id="question" name="question" defaultValue={editing?.question || ""} required maxLength={500} />
              </div>
              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea id="answer" name="answer" defaultValue={editing?.answer || ""} rows={6} required maxLength={8000} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <NativeSelect id="categoryId" name="categoryId" defaultValue={editing?.categoryId || ""}>
                    <option value="">Uncategorised</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </NativeSelect>
                </div>
                <div>
                  <Label htmlFor="sortOrder">Display order</Label>
                  <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={editing?.sortOrder ?? 0} />
                </div>
              </div>
              <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
                <span className="text-sm">Active</span>
                <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} className="size-4 accent-[#172B35]" />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
                <span className="text-sm">Show with services</span>
                <input type="checkbox" name="showOnService" defaultChecked={editing?.showOnService ?? false} className="size-4 accent-[#172B35]" />
              </label>
              <div className="flex items-center gap-2 pt-1">
                <SubmitButton>{editing ? "Save changes" : "Add FAQ"}</SubmitButton>
                {editing && (
                  <Button asChild variant="outline">
                    <Link href="/admin/faqs">Cancel</Link>
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

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
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/faqs?edit=${item.id}`}>Edit</Link>
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
    </div>
  );
}
