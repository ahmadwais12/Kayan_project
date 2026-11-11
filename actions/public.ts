"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { contactSchema, newsletterSchema, quoteSchema } from "@/lib/validations";
import { parseForm } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { saveAttachment } from "@/lib/storage";
import { getSettings } from "@/lib/settings";
import { sendMail, escapeHtml } from "@/lib/mail";
import { notifyAdmins } from "@/lib/notifications";
import type { PublicFormState } from "@/lib/public-forms";

async function requestInfo() {
  try {
    const store = await headers();
    return {
      ip: store.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      userAgent: store.get("user-agent")?.slice(0, 500) || null,
    };
  } catch {
    return { ip: null, userAgent: null };
  }
}

function fail(message: string): PublicFormState {
  return { status: "error", message };
}

async function collectAttachments(formData: FormData) {
  const files = formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length > 3) throw new Error("Attach no more than three files.");
  const stored = [];
  for (const file of files) {
    const result = await saveAttachment(file);
    if (result) stored.push(result);
  }
  return stored;
}

async function notify(subject: string, lines: [string, string][], replyTo: string) {
  try {
    const settings = await getSettings();
    const to = process.env.INQUIRY_NOTIFICATION_EMAIL || settings.email;
    if (!to) return;
    const rows = lines
      .map(
        ([label, value]) =>
          `<tr><td style="padding:4px 12px 4px 0;color:#5f6a6d;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0;color:#172b35">${escapeHtml(value).replaceAll("\n", "<br />")}</td></tr>`,
      )
      .join("");
    await sendMail({
      to,
      subject,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px"><h2 style="color:#172b35">${escapeHtml(subject)}</h2><table>${rows}</table><p style="color:#5f6a6d;font-size:12px">Reply directly to ${escapeHtml(replyTo)}.</p></div>`,
    });
  } catch (error) {
    console.error("[inquiry] notification failed", error);
  }
}

export async function submitContact(
  _prev: PublicFormState,
  formData: FormData,
): Promise<PublicFormState> {
  if (String(formData.get("company") || "").trim()) {
    return { status: "success", message: "Thank you — your message has been received." };
  }

  const meta = await requestInfo();
  const limit = rateLimit(`contact:${meta.ip || "unknown"}`, 4, 15 * 60 * 1000);
  if (!limit.allowed) {
    return fail(`Too many messages were sent from this connection. Please try again in ${limit.retryAfter} seconds.`);
  }

  const parsed = await parseForm(contactSchema, formData);
  if (!parsed.data) return fail(parsed.error);

  try {
    const attachments = await collectAttachments(formData);
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        ip: meta.ip,
        userAgent: meta.userAgent,
        ...(attachments.length
          ? {
              attachments: {
                create: attachments.map((file) => ({
                  fileName: file.fileName,
                  filePath: file.filePath,
                  mimeType: file.mimeType,
                  size: file.size,
                })),
              },
            }
          : {}),
      },
    });

    await notifyAdmins({
      type: "inquiry",
      title: "New contact inquiry",
      message: `${parsed.data.name} — ${parsed.data.subject}`,
      href: `/admin/inquiries/${inquiry.id}`,
    });

    await notify(
      `New contact inquiry: ${parsed.data.subject}`,
      [
        ["Name", parsed.data.name],
        ["Email", parsed.data.email],
        ["Phone", parsed.data.phone || "—"],
        ["Message", parsed.data.message],
        ["Attachments", attachments.length ? `${attachments.length} file(s)` : "None"],
      ],
      inquiry.email,
    );

    return {
      status: "success",
      message:
        "Thank you — your message has been received. The studio will reply using the contact details you provided.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Attachment") || message.includes("attachments") || message.includes("PDF") || message.includes("image")) {
      return fail(message);
    }
    console.error("[contact] submission failed", error);
    return fail("The message could not be sent right now. Please try again, or contact the studio directly.");
  }
}

export async function submitQuote(
  _prev: PublicFormState,
  formData: FormData,
): Promise<PublicFormState> {
  if (String(formData.get("company") || "").trim()) {
    return { status: "success", message: "Thank you — your request has been received." };
  }

  const meta = await requestInfo();
  const limit = rateLimit(`quote:${meta.ip || "unknown"}`, 4, 15 * 60 * 1000);
  if (!limit.allowed) {
    return fail(`Too many requests were sent from this connection. Please try again in ${limit.retryAfter} seconds.`);
  }

  const parsed = await parseForm(quoteSchema, formData);
  if (!parsed.data) return fail(parsed.error);

  const startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : null;
  if (startDate && Number.isNaN(startDate.getTime())) {
    return fail("Enter a valid preferred start date, or leave it empty.");
  }

  try {
    const attachments = await collectAttachments(formData);
    const request = await prisma.quoteRequest.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        projectType: parsed.data.projectType,
        location: parsed.data.location,
        budget: parsed.data.budget || null,
        startDate,
        description: parsed.data.description,
        ip: meta.ip,
        userAgent: meta.userAgent,
        ...(attachments.length
          ? {
              attachments: {
                create: attachments.map((file) => ({
                  fileName: file.fileName,
                  filePath: file.filePath,
                  mimeType: file.mimeType,
                  size: file.size,
                })),
              },
            }
          : {}),
      },
    });

    await notifyAdmins({
      type: "quote",
      title: "New quote request",
      message: `${parsed.data.name} — ${parsed.data.projectType} in ${parsed.data.location}`,
      href: `/admin/inquiries/quotes/${request.id}`,
    });

    await notify(
      `New quote request: ${parsed.data.projectType} in ${parsed.data.location}`,
      [
        ["Name", parsed.data.name],
        ["Email", parsed.data.email],
        ["Phone", parsed.data.phone],
        ["Project type", parsed.data.projectType],
        ["Location", parsed.data.location],
        ["Budget", parsed.data.budget || "Not stated"],
        ["Preferred start", parsed.data.startDate || "Not stated"],
        ["Brief", parsed.data.description],
        ["Attachments", attachments.length ? `${attachments.length} file(s)` : "None"],
      ],
      request.email,
    );

    return {
      status: "success",
      message:
        "Thank you — your project brief has been received. The studio will review it and respond using the contact details you provided.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Attachment") || message.includes("attachments") || message.includes("PDF") || message.includes("image")) {
      return fail(message);
    }
    console.error("[quote] submission failed", error);
    return fail("The request could not be sent right now. Please try again, or contact the studio directly.");
  }
}

export async function subscribeNewsletter(
  _prev: PublicFormState,
  formData: FormData,
): Promise<PublicFormState> {
  if (String(formData.get("company") || "").trim()) {
    return { status: "success", message: "Thank you for subscribing." };
  }

  const meta = await requestInfo();
  const limit = rateLimit(`newsletter:${meta.ip || "unknown"}`, 6, 60 * 60 * 1000);
  if (!limit.allowed) {
    return fail("Too many subscription attempts. Please try again later.");
  }

  const parsed = await parseForm(newsletterSchema, formData);
  if (!parsed.data) return fail(parsed.error);

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      update: { isActive: true, ...(parsed.data.name ? { name: parsed.data.name } : {}) },
      create: {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name || null,
        source: "footer",
      },
    });
    return {
      status: "success",
      message: "You are subscribed. Studio notes will arrive occasionally — unsubscribe at any time.",
    };
  } catch (error) {
    console.error("[newsletter] subscription failed", error);
    return fail("The subscription could not be saved right now. Please try again later.");
  }
}
