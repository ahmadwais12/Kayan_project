import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { FaqForm } from "@/components/admin/faq-form";

export const dynamic = "force-dynamic";

export default async function NewFaqPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [categories, query] = await Promise.all([
    prisma.faqCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    searchParams,
  ]);
  return (
    <div>
      <PageHeader title="Add FAQ" description="Add a question and answer for visitors." breadcrumb={[{ label: "FAQs", href: "/admin/faqs" }, { label: "Add FAQ" }]} />
      <AdminFlash {...flashFromQuery(query)} />
      <FaqForm categories={categories} />
    </div>
  );
}
