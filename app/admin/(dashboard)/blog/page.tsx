import Link from "next/link";
import Image from "next/image";
import { Newspaper, Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TableFooter } from "@/components/admin/pagination";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { FiltersPopover } from "@/components/admin/filters-popover";
import { FiltersForm } from "@/components/admin/filters-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { deleteBlogPost } from "@/actions/blog";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { parseRows } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const DEFAULT_ROWS = 10;
const STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED"];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("blog.manage");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const rows = parseRows(query.rows, DEFAULT_ROWS);
  const q = (query.q || "").trim();
  const status = STATUSES.includes(query.status || "") ? query.status! : "";
  const category = query.category || "";
  const activeFilterCount = [q, status, category].filter(Boolean).length;

  const where: Prisma.BlogPostWhereInput = {
    deletedAt: null,
    ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] } : {}),
    ...(status ? { status: status as "DRAFT" | "SCHEDULED" | "PUBLISHED" } : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const [posts, total, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * rows,
      take: rows,
      include: { category: { select: { name: true } }, author: { select: { name: true } } },
    }),
    prisma.blogPost.count({ where }),
    prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Write and schedule articles. Drafts stay private until published or scheduled."
        breadcrumb={[{ label: "Blog" }]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/blog/categories">Categories</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/blog/tags">Tags</Link>
            </Button>
            <FiltersPopover activeCount={activeFilterCount}>
              <FiltersForm resetHref="/admin/blog">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input name="q" defaultValue={q} placeholder="Search articles" className="pl-9" />
                </div>
                <NativeSelect name="status" defaultValue={status} aria-label="Status">
                  <option value="">All statuses</option>
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>{item.toLowerCase()}</option>
                  ))}
                </NativeSelect>
                <NativeSelect name="category" defaultValue={category} aria-label="Category">
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </NativeSelect>
              </FiltersForm>
            </FiltersPopover>
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus className="size-4" /> New article
              </Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <Card className="overflow-hidden">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Newspaper className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No articles yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Share thinking on design, materials and construction through the blog.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/blog/new">Write an article</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                        {post.featuredImage ? (
                          <Image src={post.featuredImage} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <span className="flex size-full items-center justify-center text-muted-foreground">
                            <Newspaper className="size-4" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <Link href={`/admin/blog/${post.id}`} className="block truncate font-medium text-primary hover:underline">
                          {post.title}
                        </Link>
                        <span className="block truncate text-xs text-muted-foreground">
                          {post.author?.name || "Studio editorial"} · {post.readingTime} min read
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{post.category?.name || "—"}</TableCell>
                  <TableCell><StatusBadge status={post.status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ViewButton href={`/admin/records/post/${post.id}`} name={post.title} />
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/blog/${post.id}`}>Edit</Link>
                      </Button>
                      <DeleteButton
                        id={post.id}
                        action={deleteBlogPost}
                        title={`Delete “${post.title}”?`}
                        description="The article will be removed from the public website. The record is kept for audit purposes."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          page={page}
          pageSize={rows}
          total={total}
          basePath="/admin/blog"
          params={{ q, status, category }}
          noun={total === 1 ? "article" : "articles"}
        />
      </Card>
    </div>
  );
}
