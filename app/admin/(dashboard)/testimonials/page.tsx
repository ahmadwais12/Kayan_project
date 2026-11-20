import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Plus, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { deleteTestimonial } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;

  const [items, section] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.homepageSection.findUnique({ where: { key: "testimonials" }, select: { id: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Publish only real client feedback with permission. Placeholders are not shown on the public website."
        breadcrumb={[{ label: "Testimonials" }]}
        actions={
          <div className="flex items-center gap-2">
            {section && (
              <Button asChild variant="outline">
                <Link href={`/admin/homepage/${section.id}/edit`}>Section heading</Link>
              </Button>
            )}
            <Button asChild><Link href="/admin/testimonials/new"><Plus className="size-4" /> Add testimonial</Link></Button>
          </div>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

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
                      <ViewButton href={`/admin/records/testimonial/${item.id}`} name={item.clientName} />
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/testimonials/${item.id}/edit`}>Edit</Link>
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
  );
}
