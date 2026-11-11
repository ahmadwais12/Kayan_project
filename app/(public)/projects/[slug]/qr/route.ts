import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getSeoSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSession();
  const canPreview = hasPermission(session, "projects.manage");
  const project = await prisma.project.findFirst({
    where: { slug, deletedAt: null, ...(canPreview ? {} : { isPublished: true }) },
    select: { slug: true },
  });

  if (!project) {
    return new Response("Project not found", { status: 404 });
  }

  const seo = await getSeoSettings();
  const base = (seo.canonicalBase || process.env.APP_URL || "http://localhost:3333").replace(/\/$/, "");
  const url = `${base}/projects/${project.slug}`;

  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    width: 360,
    errorCorrectionLevel: "M",
    color: { dark: "#172B35", light: "#FFFFFF" },
  });

  const download = new URL(request.url).searchParams.get("download") === "1";

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      ...(download
        ? { "Content-Disposition": `attachment; filename="${project.slug}-qr.svg"` }
        : {}),
    },
  });
}
