import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { TAXONOMY_KEYS, TAXONOMY_META, type TaxonomyEntity } from "@/lib/taxonomy";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { TaxonomyForm } from "@/components/admin/taxonomy-form";
import { loadFormTranslations } from "@/lib/i18n/form-translations";

async function findTaxonomy(entity: TaxonomyEntity, id: string) {
  switch (entity) {
    case "projectCategory": return prisma.projectCategory.findUnique({ where: { id } });
    case "serviceCategory": return prisma.serviceCategory.findUnique({ where: { id } });
    case "blogCategory": return prisma.blogCategory.findUnique({ where: { id } });
    case "blogTag": return prisma.blogTag.findUnique({ where: { id } });
    case "projectTag": return prisma.projectTag.findUnique({ where: { id } });
    case "department": return prisma.department.findUnique({ where: { id } });
    case "galleryCategory": return prisma.galleryCategory.findUnique({ where: { id } });
    case "faqCategory": return prisma.faqCategory.findUnique({ where: { id } });
  }
}

export async function TaxonomyEditorPage({
  entityName,
  id,
  searchParams,
}: {
  entityName: string;
  id?: string;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const entity = TAXONOMY_KEYS.find((key) => key === entityName);
  if (!entity) notFound();
  const meta = TAXONOMY_META[entity];
  await requirePermission(meta.permission);
  const [item, query, translations] = await Promise.all([
    id ? findTaxonomy(entity, id) : Promise.resolve(undefined),
    searchParams,
    id ? loadFormTranslations(entity, id, ["name", "description"]) : Promise.resolve(undefined),
  ]);
  if (id && !item) notFound();

  return (
    <div>
      <PageHeader
        title={`${item ? "Edit" : "Add"} ${meta.label}`}
        description={`${item ? "Update" : "Create"} this ${meta.label}.`}
        breadcrumb={[{ label: meta.path.split("/").at(-1) || "Items", href: meta.path }, { label: item ? "Edit" : "New" }]}
      />
      <AdminFlash {...flashFromQuery(query)} />
      <TaxonomyForm entity={entity} item={item || undefined} noun={meta.label} simple={meta.simple} translations={translations} />
    </div>
  );
}
