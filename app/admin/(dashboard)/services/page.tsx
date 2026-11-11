import Link from "next/link";
import Image from "next/image";
import { Layers, Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { Pagination } from "@/components/admin/pagination";
import { DeleteButton } from "@/components/admin/delete-button";
import { PublishBadge } from "@/components/admin/status-badge";
import { deleteService } from "@/actions/services";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("services.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const q = (query.q || "").trim();
  const category = query.category || "";

  const where: Prisma.ServiceWhereInput = {
    deletedAt: null,
    ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }] } : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const [services, total, categories] = await Promise.all([
    prisma.service.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: { select: { name: true } } },
    }),
    prisma.service.count({ where }),
    prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  const flash = flashFromQuery(query);

  return (
    <div>
      <PageHeader
        title="Services"
        description="Describe what the studio offers. Published services appear in the services menu and detail pages."
        breadcrumb={[{ label: "Services" }]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/services/categories">Categories</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/services/new">
                <Plus className="size-4" /> New service
              </Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flash} />

      <Card className="overflow-hidden">
        <form method="get" className="grid gap-3 border-b border-border/70 p-4 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="Search services" className="pl-9" />
          </div>
          <NativeSelect name="category" defaultValue={category} className="sm:w-52">
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </NativeSelect>
          <Button type="submit" variant="secondary">Filter</Button>
        </form>

        {services.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Layers className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No services yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add the services you offer so visitors understand how the studio can help.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/services/new">Add a service</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="relative block size-12 overflow-hidden rounded-md bg-secondary">
                        {service.mainImage ? (
                          <Image src={service.mainImage} alt="" fill sizes="48px" className="object-cover" />
                        ) : (
                          <span className="flex size-full items-center justify-center text-muted-foreground">
                            <Layers className="size-4" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <Link href={`/admin/services/${service.id}`} className="block truncate font-medium text-primary hover:underline">
                          {service.title}
                        </Link>
                        <span className="block truncate text-xs text-muted-foreground">/{service.slug}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{service.category?.name || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <PublishBadge published={service.isPublished} />
                      {service.isFeatured && <span className="text-[0.68rem] font-medium uppercase tracking-wide text-accent-foreground">Featured</span>}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(service.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {service.isPublished && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/services/${service.slug}`} target="_blank" rel="noreferrer">
                            View
                          </Link>
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/services/${service.id}`}>Edit</Link>
                      </Button>
                      <DeleteButton
                        id={service.id}
                        action={deleteService}
                        title={`Delete “${service.title}”?`}
                        description="The service will be unpublished and removed from the public website. This is a soft delete."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/services" params={{ q, category }} />
      </Card>

      <p className="mt-3 text-xs text-muted-foreground">
        {total} service{total === 1 ? "" : "s"} in this view.
      </p>
    </div>
  );
}
