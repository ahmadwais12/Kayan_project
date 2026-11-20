import { ContentEntryEditorPage } from "@/components/admin/content-entry-editor-page";

export const dynamic = "force-dynamic";

export default async function NewContentEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { kind } = await params;
  return <ContentEntryEditorPage kindName={kind} searchParams={searchParams} />;
}
