import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { saveVideo } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session, "content.manage")) {
    return Response.json({ error: "You do not have permission to upload videos." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "No file was provided." }, { status: 400 });
    }

    const stored = await saveVideo(file);

    await logAudit({
      userId: session.user.id,
      action: "video.upload",
      entity: "ShowcaseVideo",
      meta: { url: stored.url, size: stored.size },
    });

    return Response.json({ url: stored.url, size: stored.size, mimeType: stored.mimeType });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The upload could not be completed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
