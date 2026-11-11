import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TaxonomyManager, type TaxonomyItem } from "@/components/admin/taxonomy-manager";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BlogTagsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("blog.manage");
  const query = await searchParams;

  const [tags, counts] = await Promise.all([
    prisma.blogTag.findMany({ orderBy: { name: "asc" } }),
    prisma.blogPostTag.groupBy({ by: ["tagId"], _count: { _all: true } }),
  ]);
  const usage = new Map(counts.map((row) => [row.tagId, row._count._all]));

  const items: TaxonomyItem[] = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    usage: usage.get(tag.id) || 0,
  }));

  return (
    <div>
      <PageHeader
        title="Blog tags"
        description="Tags are created as you type them on an article. Rename or clean them up here."
        breadcrumb={[{ label: "Blog", href: "/admin/blog" }, { label: "Tags" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/blog">
              <ArrowLeft className="size-4" /> Back to blog
            </Link>
          </Button>
        }
      />
      <AdminFlash {...flashFromQuery(query)} />
      <TaxonomyManager
        entity="blogTag"
        noun="tag"
        simple
        items={items}
        editId={query.edit}
        description="Renaming a tag updates it everywhere it is used. Tags still attached to articles cannot be deleted."
      />
    </div>
  );
}
