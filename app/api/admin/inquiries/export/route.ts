import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDate, formatDateTime } from "@/lib/utils";

export const runtime = "nodejs";

const STATUSES = ["NEW", "CONTACTED", "IN_PROGRESS", "QUOTATION_SENT", "APPROVED", "REJECTED", "COMPLETED"];

function cell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function csv(rows: unknown[][]) {
  return `\uFEFF${rows.map((row) => row.map(cell).join(",")).join("\r\n")}\r\n`;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!hasPermission(session, "inquiries.manage")) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") === "quote" ? "quote" : "contact";
  const statusParam = url.searchParams.get("status") || "";
  const status = STATUSES.includes(statusParam) ? statusParam : "";
  const q = (url.searchParams.get("q") || "").trim();
  const fromParam = url.searchParams.get("from") || "";
  const toParam = url.searchParams.get("to") || "";
  const from = /^\d{4}-\d{2}-\d{2}$/.test(fromParam) ? fromParam : "";
  const to = /^\d{4}-\d{2}-\d{2}$/.test(toParam) ? toParam : "";
  const projectType = (url.searchParams.get("projectType") || "").trim();

  let body: string;
  let filename: string;

  if (type === "quote") {
    const items = await prisma.quoteRequest.findMany({
      where: {
        ...(status ? { status: status as "NEW" | "CONTACTED" | "IN_PROGRESS" | "QUOTATION_SENT" | "APPROVED" | "REJECTED" | "COMPLETED" } : {}),
        ...(projectType ? { projectType } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { projectType: { contains: q } },
                { location: { contains: q } },
              ],
            }
          : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
                ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    body = csv([
      ["Name", "Email", "Phone", "Project type", "Location", "Budget", "Preferred start", "Status", "Received", "Description"],
      ...items.map((item) => [
        item.name,
        item.email,
        item.phone,
        item.projectType,
        item.location,
        item.budget || "",
        formatDate(item.startDate),
        item.status,
        formatDateTime(item.createdAt),
        item.description,
      ]),
    ]);
    filename = `quote-requests-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    const items = await prisma.contactInquiry.findMany({
      where: {
        ...(status ? { status: status as "NEW" | "CONTACTED" | "IN_PROGRESS" | "QUOTATION_SENT" | "APPROVED" | "REJECTED" | "COMPLETED" } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { subject: { contains: q } },
              ],
            }
          : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
                ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    body = csv([
      ["Name", "Email", "Phone", "Subject", "Status", "Received", "Message"],
      ...items.map((item) => [
        item.name,
        item.email,
        item.phone || "",
        item.subject,
        item.status,
        formatDateTime(item.createdAt),
        item.message,
      ]),
    ]);
    filename = `contact-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
