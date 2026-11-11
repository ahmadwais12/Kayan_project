import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  CARD_ENTITY_TYPES,
  CARD_EVENT_TYPES,
  cleanPath,
  cleanText,
  getAnalyticsContext,
  type CardEntityType,
  type CardEventType,
} from "@/lib/analytics";

type IncomingEvent = {
  eventType?: unknown;
  entityType?: unknown;
  entityId?: unknown;
  entityTitle?: unknown;
  path?: unknown;
  sessionId?: unknown;
};

const MAX_EVENTS = 25;

export async function POST(request: Request) {
  const context = await getAnalyticsContext(request);
  if (!context) return new Response(null, { status: 204 });

  let body: { events?: IncomingEvent[] };
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const incoming = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : [];
  if (!incoming.length) return new Response(null, { status: 204 });

  const limit = rateLimit(`card:${context.visitorId}`, 240, 60 * 1000);
  if (!limit.allowed) return new Response(null, { status: 204 });

  const rows: Prisma.CardEventCreateManyInput[] = [];
  for (const item of incoming) {
    if (!CARD_EVENT_TYPES.includes(item.eventType as never)) continue;
    if (!CARD_ENTITY_TYPES.includes(item.entityType as never)) continue;

    const entityId = cleanText(item.entityId, 100);
    const entityTitle = cleanText(item.entityTitle, 200);
    const path = cleanPath(item.path);
    if (!entityId || !entityTitle || !path) continue;

    rows.push({
      eventType: item.eventType as CardEventType,
      entityType: item.entityType as CardEntityType,
      entityId,
      entityTitle,
      path,
      visitorId: context.visitorId,
      sessionId: cleanText(item.sessionId, 100) || null,
      userId: context.userId,
      userName: context.userName,
      ipHash: context.ipHash,
    });
  }

  if (!rows.length) return new Response(null, { status: 204 });

  try {
    await prisma.cardEvent.createMany({ data: rows });
  } catch {
    // Analytics must never break a page load.
  }

  return new Response(null, { status: 204 });
}
