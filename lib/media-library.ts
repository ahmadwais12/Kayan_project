import { prisma } from "@/lib/prisma";

export async function getMediaLibrary(take = 48) {
  try {
    return await prisma.media.findMany({
      take,
      orderBy: { createdAt: "desc" },
      select: { id: true, url: true, alt: true, thumbnailUrl: true },
    });
  } catch {
    return [];
  }
}
