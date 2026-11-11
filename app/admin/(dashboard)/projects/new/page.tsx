import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/admin/project-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requirePermission("projects.manage");

  const [categories, media] = await Promise.all([
    prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="New project"
        description="Create a portfolio case study. You can save it as a draft and publish when the content is ready."
        breadcrumb={[{ label: "Projects", href: "/admin/projects" }, { label: "New" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/projects">Back to projects</Link>
          </Button>
        }
      />

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 py-10">
            <p className="font-medium text-primary">Create a project category first</p>
            <p className="max-w-lg text-sm text-muted-foreground">
              Every project belongs to a category such as Residential or Commercial. Add at least one
              category, then return to create your first project.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/projects/categories">Manage categories</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ProjectForm
          categories={categories}
          library={media}
          values={{
            title: "",
            slug: "",
            categoryId: categories[0]?.id || "",
            clientName: "",
            location: "",
            year: "",
            status: "COMPLETED",
            duration: "",
            budget: "",
            description: "",
            challenges: "",
            solutions: "",
            architecturalDetails: "",
            constructionDetails: "",
            coverImage: "",
            beforeImage: "",
            afterImage: "",
            showBeforeAfter: false,
            isFeatured: false,
            isPublished: true,
            sortOrder: 0,
            seoTitle: "",
            seoDescription: "",
            ogImage: "",
            tags: "",
            images: [],
            specifications: [],
            features: [],
          }}
        />
      )}
    </div>
  );
}
