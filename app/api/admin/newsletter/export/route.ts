import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/utils";
import { createAdminExport, parseExportFormat } from "@/lib/admin-export";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!hasPermission(session, "inquiries.manage")) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const state = url.searchParams.get("state");
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: {
      ...(q ? { OR: [{ email: { contains: q } }, { name: { contains: q } }] } : {}),
      ...(state === "active" ? { isActive: true } : state === "inactive" ? { isActive: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 20000,
  });
  const rows: string[][] = [
    ["Email", "Name", "State", "Source", "Joined"],
    ...subscribers.map((item) => [
      item.email,
      item.name || "",
      item.isActive ? "Active" : "Inactive",
      item.source || "",
      formatDateTime(item.createdAt),
    ]),
  ];
  const format = parseExportFormat(url.searchParams.get("format"));
  return createAdminExport(rows, "newsletter", format);
}
