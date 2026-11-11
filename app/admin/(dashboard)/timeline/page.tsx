import Link from "next/link";
import { Milestone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/form-kit";
import { ImageInput } from "@/components/admin/image-input";
import { saveMilestone, deleteMilestone } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;

  const [milestones, media] = await Promise.all([
    prisma.companyMilestone.findMany({ orderBy: [{ sortOrder: "asc" }, { year: "asc" }] }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  const editing = query.edit ? milestones.find((item) => item.id === query.edit) : undefined;

  return (
    <div>
      <PageHeader
        title="Company timeline"
        description="Milestones shown on the About page. Only add verified company history."
        breadcrumb={[{ label: "Company Timeline" }]}
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit milestone" : "Add milestone"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveMilestone} className="space-y-4">
              <input type="hidden" name="id" value={editing?.id || ""} />
              <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" defaultValue={editing?.year || ""} required maxLength={20} />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editing?.title || ""} required maxLength={180} />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editing?.description || ""} rows={4} maxLength={4000} />
              </div>
              <div>
                <Label htmlFor="sortOrder">Display order</Label>
                <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={editing?.sortOrder ?? 0} />
              </div>
              <ImageInput name="imageUrl" defaultValue={editing?.imageUrl || ""} library={media} label="Image (optional)" />
              <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
                <span className="text-sm">Published</span>
                <input type="checkbox" name="isPublished" defaultChecked={editing?.isPublished ?? true} className="size-4 accent-[#172B35]" />
              </label>
              <div className="flex items-center gap-2 pt-1">
                <SubmitButton>{editing ? "Save changes" : "Add milestone"}</SubmitButton>
                {editing && (
                  <Button asChild variant="outline">
                    <Link href="/admin/timeline">Cancel</Link>
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {milestones.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Milestone className="size-5" />
              </span>
              <p className="text-sm font-medium text-primary">No milestones yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add factual company milestones when they are confirmed.
              </p>
            </Card>
          ) : (
            milestones.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="rounded bg-secondary px-2.5 py-1 font-display text-sm font-semibold text-primary">
                    {item.year}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-primary">{item.title}</p>
                      {!item.isPublished && <Badge variant="secondary">Hidden</Badge>}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/timeline?edit=${item.id}`}>Edit</Link>
                    </Button>
                    <DeleteButton
                      id={item.id}
                      action={deleteMilestone}
                      title="Delete this milestone?"
                      description="This permanently removes the milestone from the timeline."
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
