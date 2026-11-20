"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { blogSchema } from "@/lib/validations";
import { checked, field, numberField } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";
import { saveFormTranslations } from "@/lib/i18n/form-translations";
import { parseList, slugify } from "@/lib/utils";

export type BlogState = { error?: string };

export async function saveBlogPost(
  _prev: BlogState,
  formData: FormData,
): Promise<BlogState> {
  const gate = await authorize("blog.manage");
  if (gate.error || !gate.session) return { error: gate.error || "Unauthorized" };

  const id = field(formData, "id");
  const raw = {
    title: field(formData, "title"),
    slug: field(formData, "slug").toLowerCase(),
    excerpt: field(formData, "excerpt"),
    content: field(formData, "content"),
    featuredImage: field(formData, "featuredImage"),
    authorId: field(formData, "authorId"),
    categoryId: field(formData, "categoryId"),
    status: field(formData, "status", "DRAFT"),
    publishedAt: field(formData, "publishedAt"),
    readingTime: numberField(formData, "readingTime", 5),
    isFeatured: checked(formData, "isFeatured"),
    seoTitle: field(formData, "seoTitle"),
    seoDescription: field(formData, "seoDescription"),
    ogImage: field(formData, "ogImage"),
    tags: field(formData, "tags"),
  };

  const parsed = blogSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the article fields." };
  }

  const existing = id ? await prisma.blogPost.findUnique({ where: { id } }) : null;
  if (id && !existing) return { error: "Article not found." };

  const conflict = await prisma.blogPost.findFirst({
    where: id ? { slug: parsed.data.slug, NOT: { id } } : { slug: parsed.data.slug },
    select: { id: true },
  });
  if (conflict) return { error: "That URL slug is already used by another article." };

  let publishedAt: Date | null = null;
  const input = parsed.data.publishedAt;
  if (input) {
    const parsedDate = new Date(input);
    if (Number.isNaN(parsedDate.getTime())) {
      return { error: "The publish date is not valid." };
    }
    publishedAt = parsedDate;
  }

  if (parsed.data.status === "SCHEDULED") {
    if (!publishedAt || publishedAt.getTime() <= Date.now()) {
      return { error: "Scheduled articles need a future publish date." };
    }
  } else if (parsed.data.status === "PUBLISHED") {
    publishedAt = publishedAt && publishedAt.getTime() <= Date.now() ? publishedAt : existing?.publishedAt || new Date();
  } else {
    publishedAt = null;
  }

  const tags = parseList(parsed.data.tags).slice(0, 20);

  const data = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    excerpt: parsed.data.excerpt,
    content: parsed.data.content,
    featuredImage: parsed.data.featuredImage || null,
    authorId: parsed.data.authorId || null,
    categoryId: parsed.data.categoryId || null,
    status: parsed.data.status,
    publishedAt,
    readingTime: parsed.data.readingTime,
    isFeatured: parsed.data.isFeatured,
    seoTitle: parsed.data.seoTitle || null,
    seoDescription: parsed.data.seoDescription || null,
    ogImage: parsed.data.ogImage || null,
  };

  let saved;
  try {
    saved = await prisma.$transaction(async (tx) => {
      const record = id
        ? await tx.blogPost.update({ where: { id }, data })
        : await tx.blogPost.create({ data });

      await tx.blogPostTag.deleteMany({ where: { postId: record.id } });
      for (const name of tags) {
        const slug = slugify(name);
        if (!slug) continue;
        const tag = await tx.blogTag.upsert({
          where: { slug },
          update: { name },
          create: { name, slug },
        });
        await tx.blogPostTag.create({ data: { postId: record.id, tagId: tag.id } });
      }

      return record;
    });

    await saveFormTranslations("blog", saved.id, formData, ["title", "excerpt", "content"]);

    await logAudit({
      userId: gate.session.user.id,
      action: id ? "blog.update" : "blog.create",
      entity: "BlogPost",
      entityId: saved.id,
      meta: { title: saved.title, status: saved.status },
    });

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${saved.slug}`);
    revalidatePath("/admin/blog");
  } catch (error) {
    console.error(error);
    return { error: "The article could not be saved. Please try again." };
  }

  redirect(`/admin/blog/${saved.id}?saved=1`);
}

export async function deleteBlogPost(formData: FormData) {
  const gate = await authorize("blog.manage");
  if (gate.error || !gate.session) redirect("/admin/blog?error=Unauthorized");

  const id = field(formData, "id");
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) redirect("/admin/blog?error=Article%20not%20found");

  await prisma.blogPost.update({
    where: { id },
    data: { deletedAt: new Date(), status: "DRAFT", slug: `${post.slug}-deleted-${Date.now()}` },
  });

  await logAudit({
    userId: gate.session.user.id,
    action: "blog.delete",
    entity: "BlogPost",
    entityId: id,
    meta: { title: post.title },
  });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog?deleted=1");
}
