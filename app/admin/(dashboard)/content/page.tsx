import Link from "next/link";
import { Gauge, ListChecks, Sparkles, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/form-kit";
import { ImageInput } from "@/components/admin/image-input";
import {
  saveCompanyStat,
  deleteCompanyStat,
  saveCoreValue,
  deleteCoreValue,
  saveProcessStep,
  deleteProcessStep,
  saveWhyItem,
  deleteWhyItem,
} from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

function ActiveToggle({ checked }: { checked: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
      <span className="text-sm">Active</span>
      <input type="checkbox" name="isActive" defaultChecked={checked} className="size-4 accent-[#172B35]" />
    </label>
  );
}

function OrderInput({ value, id }: { value: number; id: string }) {
  return (
    <div>
      <Label htmlFor={id}>Display order</Label>
      <Input id={id} name="sortOrder" type="number" min={0} defaultValue={value} />
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: typeof Gauge; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-medium text-primary">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;

  const [stats, values, process, why, media] = await Promise.all([
    prisma.companyStatistic.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
    prisma.coreValue.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
    prisma.processStep.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
    prisma.whyChooseItem.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  const editStat = query.editStat ? stats.find((item) => item.id === query.editStat) : undefined;
  const editValue = query.editValue ? values.find((item) => item.id === query.editValue) : undefined;
  const editProcess = query.editProcess ? process.find((item) => item.id === query.editProcess) : undefined;
  const editWhy = query.editWhy ? why.find((item) => item.id === query.editWhy) : undefined;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Process & values"
        description="Content blocks used across the homepage and About page. Keep claims factual and specific."
        breadcrumb={[{ label: "Process & Values" }]}
      />

      <AdminFlash {...flashFromQuery(query)} />

      <section id="stats">
        <div className="mb-4 flex items-center gap-2">
          <Gauge className="size-5 text-accent-foreground" />
          <h2 className="font-display text-2xl text-primary">Company statistics</h2>
        </div>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Statistics are only displayed when a real value is provided. Seeded placeholders use an em dash and stay hidden from the public site.
        </p>
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader><CardTitle>{editStat ? "Edit statistic" : "Add statistic"}</CardTitle></CardHeader>
            <CardContent>
              <form action={saveCompanyStat} className="space-y-4">
                <input type="hidden" name="id" value={editStat?.id || ""} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="label">Label</Label>
                    <Input id="label" name="label" defaultValue={editStat?.label || ""} required maxLength={120} />
                  </div>
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" name="value" defaultValue={editStat?.value || ""} required maxLength={40} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="suffix">Suffix</Label>
                    <Input id="suffix" name="suffix" defaultValue={editStat?.suffix || ""} placeholder="+, m², yrs" maxLength={20} />
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon name</Label>
                    <Input id="icon" name="icon" defaultValue={editStat?.icon || ""} placeholder="Building2" maxLength={80} />
                  </div>
                </div>
                <OrderInput id="statSortOrder" value={editStat?.sortOrder ?? 0} />
                <ActiveToggle checked={editStat?.isActive ?? true} />
                <div className="flex items-center gap-2">
                  <SubmitButton>{editStat ? "Save changes" : "Add statistic"}</SubmitButton>
                  {editStat && <Button asChild variant="outline"><Link href="/admin/content#stats">Cancel</Link></Button>}
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            {stats.length === 0 ? (
              <EmptyState icon={Gauge} title="No statistics yet" body="Add verified figures only." />
            ) : (
              <div className="divide-y divide-border/70">
                {stats.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-primary">{item.value}{item.suffix}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                    {!item.isActive && <Badge variant="secondary">Hidden</Badge>}
                    <Button asChild variant="ghost" size="sm"><Link href={`/admin/content?editStat=${item.id}#stats`}>Edit</Link></Button>
                    <DeleteButton id={item.id} action={deleteCompanyStat} title="Delete this statistic?" description="This permanently removes the statistic." />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      <section id="values">
        <div className="mb-4 flex items-center gap-2">
          <Star className="size-5 text-accent-foreground" />
          <h2 className="font-display text-2xl text-primary">Core values</h2>
        </div>
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader><CardTitle>{editValue ? "Edit value" : "Add value"}</CardTitle></CardHeader>
            <CardContent>
              <form action={saveCoreValue} className="space-y-4">
                <input type="hidden" name="id" value={editValue?.id || ""} />
                <div>
                  <Label htmlFor="valueTitle">Title</Label>
                  <Input id="valueTitle" name="title" defaultValue={editValue?.title || ""} required maxLength={160} />
                </div>
                <div>
                  <Label htmlFor="valueDescription">Description</Label>
                  <Textarea id="valueDescription" name="description" defaultValue={editValue?.description || ""} rows={4} required maxLength={3000} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="valueIcon">Icon name</Label>
                    <Input id="valueIcon" name="icon" defaultValue={editValue?.icon || ""} maxLength={80} />
                  </div>
                  <OrderInput id="valueSortOrder" value={editValue?.sortOrder ?? 0} />
                </div>
                <ActiveToggle checked={editValue?.isActive ?? true} />
                <div className="flex items-center gap-2">
                  <SubmitButton>{editValue ? "Save changes" : "Add value"}</SubmitButton>
                  {editValue && <Button asChild variant="outline"><Link href="/admin/content#values">Cancel</Link></Button>}
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            {values.length === 0 ? (
              <EmptyState icon={Star} title="No values yet" body="Describe the principles that guide the studio." />
            ) : (
              <div className="divide-y divide-border/70">
                {values.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-primary">{item.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {!item.isActive && <Badge variant="secondary">Hidden</Badge>}
                    <Button asChild variant="ghost" size="sm"><Link href={`/admin/content?editValue=${item.id}#values`}>Edit</Link></Button>
                    <DeleteButton id={item.id} action={deleteCoreValue} title="Delete this value?" description="This permanently removes the value." />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      <section id="process">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="size-5 text-accent-foreground" />
          <h2 className="font-display text-2xl text-primary">Process steps</h2>
        </div>
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader><CardTitle>{editProcess ? "Edit step" : "Add step"}</CardTitle></CardHeader>
            <CardContent>
              <form action={saveProcessStep} className="space-y-4">
                <input type="hidden" name="id" value={editProcess?.id || ""} />
                <div>
                  <Label htmlFor="processTitle">Title</Label>
                  <Input id="processTitle" name="title" defaultValue={editProcess?.title || ""} required maxLength={160} />
                </div>
                <div>
                  <Label htmlFor="processDescription">Description</Label>
                  <Textarea id="processDescription" name="description" defaultValue={editProcess?.description || ""} rows={4} required maxLength={3000} />
                </div>
                <OrderInput id="processSortOrder" value={editProcess?.sortOrder ?? 0} />
                <ImageInput name="imageUrl" defaultValue={editProcess?.imageUrl || ""} library={media} label="Image (optional)" />
                <ActiveToggle checked={editProcess?.isActive ?? true} />
                <div className="flex items-center gap-2">
                  <SubmitButton>{editProcess ? "Save changes" : "Add step"}</SubmitButton>
                  {editProcess && <Button asChild variant="outline"><Link href="/admin/content#process">Cancel</Link></Button>}
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            {process.length === 0 ? (
              <EmptyState icon={ListChecks} title="No process steps yet" body="Outline how a project moves from first conversation to handover." />
            ) : (
              <div className="divide-y divide-border/70">
                {process.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="font-display text-lg text-accent-foreground">{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-primary">{item.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {!item.isActive && <Badge variant="secondary">Hidden</Badge>}
                    <Button asChild variant="ghost" size="sm"><Link href={`/admin/content?editProcess=${item.id}#process`}>Edit</Link></Button>
                    <DeleteButton id={item.id} action={deleteProcessStep} title="Delete this process step?" description="This permanently removes the step." />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      <section id="why">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-5 text-accent-foreground" />
          <h2 className="font-display text-2xl text-primary">Why choose us</h2>
        </div>
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader><CardTitle>{editWhy ? "Edit item" : "Add item"}</CardTitle></CardHeader>
            <CardContent>
              <form action={saveWhyItem} className="space-y-4">
                <input type="hidden" name="id" value={editWhy?.id || ""} />
                <div>
                  <Label htmlFor="whyTitle">Title</Label>
                  <Input id="whyTitle" name="title" defaultValue={editWhy?.title || ""} required maxLength={160} />
                </div>
                <div>
                  <Label htmlFor="whyDescription">Description</Label>
                  <Textarea id="whyDescription" name="description" defaultValue={editWhy?.description || ""} rows={4} required maxLength={3000} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="whyIcon">Icon name</Label>
                    <Input id="whyIcon" name="icon" defaultValue={editWhy?.icon || ""} maxLength={80} />
                  </div>
                  <OrderInput id="whySortOrder" value={editWhy?.sortOrder ?? 0} />
                </div>
                <ActiveToggle checked={editWhy?.isActive ?? true} />
                <div className="flex items-center gap-2">
                  <SubmitButton>{editWhy ? "Save changes" : "Add item"}</SubmitButton>
                  {editWhy && <Button asChild variant="outline"><Link href="/admin/content#why">Cancel</Link></Button>}
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            {why.length === 0 ? (
              <EmptyState icon={Sparkles} title="No items yet" body="Explain what distinguishes the studio's approach." />
            ) : (
              <div className="divide-y divide-border/70">
                {why.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-primary">{item.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {!item.isActive && <Badge variant="secondary">Hidden</Badge>}
                    <Button asChild variant="ghost" size="sm"><Link href={`/admin/content?editWhy=${item.id}#why`}>Edit</Link></Button>
                    <DeleteButton id={item.id} action={deleteWhyItem} title="Delete this item?" description="This permanently removes the item." />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
