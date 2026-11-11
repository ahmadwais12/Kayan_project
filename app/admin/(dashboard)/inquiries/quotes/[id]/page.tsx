import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { InquiryDetail } from "@/components/admin/inquiry-detail";
import { Button } from "@/components/ui/button";
import { formatDate, toDateTimeInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QuoteRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("inquiries.manage");
  const { id } = await params;
  const query = await searchParams;

  const [request, staff] = await Promise.all([
    prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
        attachments: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.adminUser.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!request) notFound();

  return (
    <div>
      <PageHeader
        title={request.name}
        description={`${request.projectType} · ${request.location}`}
        breadcrumb={[
          { label: "Quote Requests", href: "/admin/inquiries/quotes" },
          { label: "Request" },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/inquiries/quotes">
              <ArrowLeft className="size-4" /> Back to quotes
            </Link>
          </Button>
        }
      />
      <AdminFlash {...flashFromQuery(query)} />
      <InquiryDetail
        kind="quote"
        id={request.id}
        name={request.name}
        email={request.email}
        phone={request.phone}
        status={request.status}
        assignedToId={request.assignedToId || ""}
        followUpAt={toDateTimeInput(request.followUpAt)}
        createdAt={request.createdAt}
        ip={request.ip}
        userAgent={request.userAgent}
        details={[
          { label: "Project type", value: request.projectType },
          { label: "Location", value: request.location },
          { label: "Budget", value: request.budget || "" },
          { label: "Preferred start", value: formatDate(request.startDate) },
        ]}
        message={request.description}
        messageLabel="Project description"
        notes={request.notes.map((note) => ({
          id: note.id,
          body: note.body,
          createdAt: note.createdAt,
          author: note.author?.name || null,
        }))}
        attachments={request.attachments}
        staff={staff}
      />
    </div>
  );
}
