import { TaxonomyEditorPage } from "@/components/admin/taxonomy-editor-page";

export const dynamic = "force-dynamic";

export default async function EditTaxonomyPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string; id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { entity, id } = await params;
  return <TaxonomyEditorPage entityName={entity} id={id} searchParams={searchParams} />;
}
