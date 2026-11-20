import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { BlogForm } from "@/components/admin/blog-form";
import { Button } from "@/components/ui/button";
import { loadFormTranslations } from "@/lib/i18n/form-translations";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function toDateTimeLocal(date: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("blog.manage");
  const { id } = await params;
  const query = await searchParams;

  const [post, categories, authors, media, translations] = await Promise.all([
    prisma.blogPost.findFirst({
      where: { id, deletedAt: null },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.blogAuthor.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    loadFormTranslations("blog", id, ["title", "excerpt", "content"]),
  ]);

  if (!post) notFound();

  return (
    <div>
      <PageHeader
        title={post.title}
        description={`Last updated ${formatDateTime(post.updatedAt)}`}
        breadcrumb={[{ label: "Blog", href: "/admin/blog" }, { label: post.title }]}
        actions={
          <>
            {post.status === "PUBLISHED" && (
              <Button asChild variant="outline">
                <Link href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                  View live <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/admin/blog">All articles</Link>
            </Button>
          </>
        }
      />

      <AdminFlash {...flashFromQuery(query)} />

      <BlogForm
        categories={categories}
        authors={authors}
        library={media}
        translations={translations}
        values={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          featuredImage: post.featuredImage || "",
          authorId: post.authorId || "",
          categoryId: post.categoryId || "",
          status: post.status,
          publishedAt: toDateTimeLocal(post.publishedAt),
          readingTime: post.readingTime,
          isFeatured: post.isFeatured,
          seoTitle: post.seoTitle || "",
          seoDescription: post.seoDescription || "",
          ogImage: post.ogImage || "",
          tags: post.tags.map((relation) => relation.tag.name).join(", "),
        }}
      />
    </div>
  );
}
