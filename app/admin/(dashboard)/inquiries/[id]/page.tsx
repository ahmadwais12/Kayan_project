import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { InquiryDetail } from "@/components/admin/inquiry-detail";
import { Button } from "@/components/ui/button";
import { toDateTimeInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContactInquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("inquiries.manage");
  const { id } = await params;
  const query = await searchParams;

  const [inquiry, staff] = await Promise.all([
    prisma.contactInquiry.findUnique({
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

  if (!inquiry) notFound();

  return (
    <div>
      <PageHeader
        title={inquiry.name}
        description={inquiry.subject}
        breadcrumb={[
          { label: "Contact Inquiries", href: "/admin/inquiries" },
          { label: "Inquiry" },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/inquiries">
              <ArrowLeft className="size-4" /> Back to inquiries
            </Link>
          </Button>
        }
      />
      <AdminFlash {...flashFromQuery(query)} />
      <InquiryDetail
        kind="contact"
        id={inquiry.id}
        name={inquiry.name}
        email={inquiry.email}
        phone={inquiry.phone}
        status={inquiry.status}
        assignedToId={inquiry.assignedToId || ""}
        followUpAt={toDateTimeInput(inquiry.followUpAt)}
        createdAt={inquiry.createdAt}
        ip={inquiry.ip}
        userAgent={inquiry.userAgent}
        details={[
          { label: "Subject", value: inquiry.subject },
          { label: "Phone", value: inquiry.phone || "" },
        ]}
        message={inquiry.message}
        messageLabel="Message"
        notes={inquiry.notes.map((note) => ({
          id: note.id,
          body: note.body,
          createdAt: note.createdAt,
          author: note.author?.name || null,
        }))}
        attachments={inquiry.attachments}
        staff={staff}
      />
    </div>
  );
}
