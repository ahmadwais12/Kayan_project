import { TaxonomyEditorPage } from "@/components/admin/taxonomy-editor-page";

export const dynamic = "force-dynamic";

export default async function NewTaxonomyPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { entity } = await params;
  return <TaxonomyEditorPage entityName={entity} searchParams={searchParams} />;
}
