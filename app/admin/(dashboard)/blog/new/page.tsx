import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { BlogForm } from "@/components/admin/blog-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  await requirePermission("blog.manage");

  const [categories, authors, media] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.blogAuthor.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="New article"
        description="Write the article in Markdown. Save as a draft first, preview it, then publish or schedule."
        breadcrumb={[{ label: "Blog", href: "/admin/blog" }, { label: "New" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/blog">Back to blog</Link>
          </Button>
        }
      />
      <BlogForm
        categories={categories}
        authors={authors}
        library={media}
        values={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          featuredImage: "",
          authorId: authors[0]?.id || "",
          categoryId: categories[0]?.id || "",
          status: "DRAFT",
          publishedAt: "",
          readingTime: 5,
          isFeatured: false,
          seoTitle: "",
          seoDescription: "",
          ogImage: "",
          tags: "",
        }}
      />
    </div>
  );
}
