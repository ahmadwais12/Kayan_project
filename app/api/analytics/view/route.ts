import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { cleanPath, cleanText, getAnalyticsContext, PAGE_TYPES } from "@/lib/analytics";

export async function POST(request: Request) {
  const context = await getAnalyticsContext(request);
  if (!context) return new Response(null, { status: 204 });

  let body: { path?: string; referrer?: string; title?: string; pageType?: string; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const path = cleanPath(body.path);
  if (!path) return new Response(null, { status: 204 });

  const limit = rateLimit(`view:${context.visitorId}`, 60, 60 * 1000);
  if (!limit.allowed) return new Response(null, { status: 204 });

  const pageType = PAGE_TYPES.includes(body.pageType as never) ? body.pageType! : "page";

  try {
    await prisma.pageView.create({
      data: {
        path,
        visitorId: context.visitorId,
        sessionId: cleanText(body.sessionId, 100) || null,
        title: cleanText(body.title, 200) || null,
        pageType,
        userId: context.userId,
        userName: context.userName,
        ipHash: context.ipHash,
        referrer: cleanText(body.referrer, 500) || null,
        device: context.device,
        country: context.country,
      },
    });
  } catch {
    // Analytics must never break a page load.
  }

  return new Response(null, { status: 204 });
}
