import { ContentEntryEditorPage } from "@/components/admin/content-entry-editor-page";

export const dynamic = "force-dynamic";

export default async function EditContentEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { kind, id } = await params;
  return <ContentEntryEditorPage kindName={kind} id={id} searchParams={searchParams} />;
}
