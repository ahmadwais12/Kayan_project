import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { saveImage } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session, "media.manage")) {
    return Response.json({ error: "You do not have permission to upload media." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "No file was provided." }, { status: 400 });
    }

    const folderValue = formData.get("folderId");
    const folderId =
      typeof folderValue === "string" && folderValue
        ? (await prisma.mediaFolder.findUnique({ where: { id: folderValue }, select: { id: true } }))?.id
        : null;

    const stored = await saveImage(file);
    const media = await prisma.media.create({
      data: {
        fileName: file.name.slice(0, 180),
        url: stored.url,
        thumbnailUrl: stored.thumbnailUrl,
        mimeType: stored.mimeType,
        size: stored.size,
        width: stored.width,
        height: stored.height,
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        folderId: folderId || null,
        uploadedById: session.user.id,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "media.upload",
      entity: "Media",
      entityId: media.id,
      meta: { fileName: media.fileName },
    });

    return Response.json({
      id: media.id,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      width: media.width,
      height: media.height,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The upload could not be completed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
