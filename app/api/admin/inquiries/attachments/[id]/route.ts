import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { readPrivateFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!hasPermission(session, "inquiries.manage")) {
    return new Response("Forbidden", { status: 403 });
  }

  const { id } = await params;
  const attachment = await prisma.inquiryAttachment.findUnique({ where: { id } });
  if (!attachment) return new Response("Not found", { status: 404 });

  const file = await readPrivateFile(attachment.filePath);
  if (!file) return new Response("File is no longer available", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": attachment.mimeType || file.contentType,
      "Content-Length": String(attachment.size),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
