import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/utils";

export const runtime = "nodejs";

function cell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!hasPermission(session, "inquiries.manage")) {
    return new Response("Forbidden", { status: 403 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 20000 });
  const rows = [
    ["Email", "Name", "State", "Source", "Joined"],
    ...subscribers.map((item) => [
      item.email,
      item.name || "",
      item.isActive ? "Active" : "Inactive",
      item.source || "",
      formatDateTime(item.createdAt),
    ]),
  ];
  const body = `\uFEFF${rows.map((row) => row.map(cell).join(",")).join("\r\n")}\r\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
