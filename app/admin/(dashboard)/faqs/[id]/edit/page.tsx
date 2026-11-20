import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { FaqForm } from "@/components/admin/faq-form";

export const dynamic = "force-dynamic";

export default async function EditFaqPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [editing, categories] = await Promise.all([
    prisma.fAQ.findUnique({ where: { id } }),
    prisma.faqCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!editing) notFound();
  return (
    <div>
      <PageHeader title="Edit FAQ" description="Update the question, answer, and visibility." breadcrumb={[{ label: "FAQs", href: "/admin/faqs" }, { label: "Edit FAQ" }]} />
      <AdminFlash {...flashFromQuery(query)} />
      <FaqForm editing={editing} categories={categories} />
    </div>
  );
}
