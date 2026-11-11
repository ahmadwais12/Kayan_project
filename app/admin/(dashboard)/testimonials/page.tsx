import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/form-kit";
import { ImageInput } from "@/components/admin/image-input";
import { saveTestimonial, deleteTestimonial } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;

  const [items, media] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  const editing = query.edit ? items.find((item) => item.id === query.edit) : undefined;

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Publish only real client feedback with permission. Placeholders are not shown on the public website."
        breadcrumb={[{ label: "Testimonials" }]}
      />

      <AdminFlash {...flashFromQuery(query)} />

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.5fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit testimonial" : "Add testimonial"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveTestimonial} className="space-y-4">
              <input type="hidden" name="id" value={editing?.id || ""} />
              <div>
                <Label htmlFor="clientName">Client name</Label>
                <Input id="clientName" name="clientName" defaultValue={editing?.clientName || ""} required maxLength={160} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="clientTitle">Role / title</Label>
                  <Input id="clientTitle" name="clientTitle" defaultValue={editing?.clientTitle || ""} maxLength={160} />
                </div>
                <div>
                  <Label htmlFor="clientCompany">Company</Label>
                  <Input id="clientCompany" name="clientCompany" defaultValue={editing?.clientCompany || ""} maxLength={160} />
                </div>
              </div>
              <div>
                <Label htmlFor="content">Testimonial</Label>
                <Textarea id="content" name="content" defaultValue={editing?.content || ""} rows={5} required maxLength={3000} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <NativeSelect id="rating" name="rating" defaultValue={String(editing?.rating ?? 5)}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>
                    ))}
                  </NativeSelect>
                </div>
                <div>
                  <Label htmlFor="sortOrder">Display order</Label>
                  <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={editing?.sortOrder ?? 0} />
                </div>
              </div>
              <ImageInput
                name="photoUrl"
                defaultValue={editing?.photoUrl || ""}
                library={media}
                label="Client photo (optional)"
                help="Only upload a photo the client has agreed to share."
              />
              <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
                <span className="text-sm">Published</span>
                <input type="checkbox" name="isPublished" defaultChecked={editing?.isPublished ?? true} className="size-4 accent-[#172B35]" />
              </label>
              <div className="flex items-center gap-2 pt-1">
                <SubmitButton>{editing ? "Save changes" : "Add testimonial"}</SubmitButton>
                {editing && (
                  <Button asChild variant="outline">
                    <Link href="/admin/testimonials">Cancel</Link>
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {items.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <MessageSquare className="size-5" />
              </span>
              <p className="text-sm font-medium text-primary">No testimonials yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add feedback once you have the client&apos;s permission. The homepage section stays hidden until at least one is published.
              </p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex gap-4 p-5">
                  <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-primary">
                    {item.photoUrl ? (
                      <Image src={item.photoUrl} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      item.clientName.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-primary">{item.clientName}</p>
                      <Badge variant={item.isPublished ? "success" : "secondary"}>
                        {item.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {[item.clientTitle, item.clientCompany].filter(Boolean).join(" · ") || "Client"}
                    </p>
                    <div className="mt-1 flex items-center gap-0.5 text-accent-foreground">
                      {Array.from({ length: item.rating }).map((_, index) => (
                        <Star key={index} className="size-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{item.content}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/testimonials?edit=${item.id}`}>Edit</Link>
                      </Button>
                      <DeleteButton
                        id={item.id}
                        action={deleteTestimonial}
                        title={`Delete testimonial from ${item.clientName}?`}
                        description="This permanently removes the testimonial."
                      />
                    </div>
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
