"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/guards";
import { field, redirectWith } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";

const STATUSES = ["NEW", "CONTACTED", "IN_PROGRESS", "QUOTATION_SENT", "APPROVED", "REJECTED", "COMPLETED"] as const;
type Status = (typeof STATUSES)[number];

type Kind = "contact" | "quote";

function basePath(kind: Kind) {
  return kind === "quote" ? "/admin/inquiries/quotes" : "/admin/inquiries";
}

function detailPath(kind: Kind, id: string) {
  return `${basePath(kind)}/${id}`;
}

export async function updateInquiryStatus(formData: FormData) {
  const gate = await authorize("inquiries.manage");
  const kind: Kind = field(formData, "kind") === "quote" ? "quote" : "contact";
  const id = field(formData, "id");
  if (gate.error || !gate.session) redirect(redirectWith(detailPath(kind, id), "error", gate.error || "Unauthorized"));

  const status = field(formData, "status") as Status;
  if (!STATUSES.includes(status)) redirect(redirectWith(detailPath(kind, id), "error", "Unknown status"));

  const assignee = field(formData, "assignedToId");
  const followUpRaw = field(formData, "followUpAt");
  let followUpAt: Date | null = null;
  if (followUpRaw) {
    const date = new Date(followUpRaw);
    if (Number.isNaN(date.getTime())) redirect(redirectWith(detailPath(kind, id), "error", "The follow-up date is not valid"));
    followUpAt = date;
  }

  const data = {
    status,
    assignedToId: assignee || null,
    followUpAt,
  };

  if (kind === "quote") {
    await prisma.quoteRequest.update({ where: { id }, data });
  } else {
    await prisma.contactInquiry.update({ where: { id }, data });
  }

  await logAudit({
    userId: gate.session.user.id,
    action: "inquiry.status",
    entity: kind === "quote" ? "QuoteRequest" : "ContactInquiry",
    entityId: id,
    meta: { status, assignedToId: assignee || null },
  });

  revalidatePath(basePath(kind));
  revalidatePath(detailPath(kind, id));
  revalidatePath("/admin");
  redirect(`${detailPath(kind, id)}?saved=1`);
}

export async function addInquiryNote(formData: FormData) {
  const gate = await authorize("inquiries.manage");
  const kind: Kind = field(formData, "kind") === "quote" ? "quote" : "contact";
  const id = field(formData, "id");
  if (gate.error || !gate.session) redirect(redirectWith(detailPath(kind, id), "error", gate.error || "Unauthorized"));

  const body = field(formData, "body");
  if (body.length < 2) redirect(redirectWith(detailPath(kind, id), "error", "Write a note before saving"));

  await prisma.inquiryNote.create({
    data: {
      body: body.slice(0, 8000),
      authorId: gate.session.user.id,
      contactInquiryId: kind === "contact" ? id : null,
      quoteRequestId: kind === "quote" ? id : null,
    },
  });

  await logAudit({
    userId: gate.session.user.id,
    action: "inquiry.note",
    entity: kind === "quote" ? "QuoteRequest" : "ContactInquiry",
    entityId: id,
  });

  revalidatePath(detailPath(kind, id));
  redirect(`${detailPath(kind, id)}?saved=1#notes`);
}

export async function setNewsletterState(formData: FormData) {
  const gate = await authorize("inquiries.manage");
  if (gate.error || !gate.session) redirect(redirectWith("/admin/newsletter", "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const active = field(formData, "active") === "1";
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!subscriber) redirect(redirectWith("/admin/newsletter", "error", "Subscriber not found"));

  await prisma.newsletterSubscriber.update({ where: { id }, data: { isActive: active } });
  await logAudit({
    userId: gate.session.user.id,
    action: active ? "newsletter.activate" : "newsletter.deactivate",
    entity: "NewsletterSubscriber",
    entityId: id,
    meta: { email: subscriber.email },
  });

  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?saved=1");
}

export async function deleteNewsletterSubscriber(formData: FormData) {
  const gate = await authorize("inquiries.manage");
  if (gate.error || !gate.session) redirect(redirectWith("/admin/newsletter", "error", gate.error || "Unauthorized"));

  const id = field(formData, "id");
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!subscriber) redirect(redirectWith("/admin/newsletter", "error", "Subscriber not found"));

  await prisma.newsletterSubscriber.delete({ where: { id } });
  await logAudit({
    userId: gate.session.user.id,
    action: "newsletter.delete",
    entity: "NewsletterSubscriber",
    entityId: id,
    meta: { email: subscriber.email },
  });

  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?deleted=1");
}
