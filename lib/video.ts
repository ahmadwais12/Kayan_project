const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const value = url.trim();
  if (!value) return null;
  if (ID_PATTERN.test(value)) return value;

  let parsed: URL;
  try {
    parsed = new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");
  const segments = parsed.pathname.split("/").filter(Boolean);

  const fromPath = (prefix: string) =>
    segments[0] === prefix && segments[1] && ID_PATTERN.test(segments[1]) ? segments[1] : null;

  if (host === "youtu.be") {
    return segments[0] && ID_PATTERN.test(segments[0]) ? segments[0] : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const candidate = parsed.searchParams.get("v");
    if (candidate && ID_PATTERN.test(candidate)) return candidate;
    return fromPath("embed") || fromPath("shorts") || fromPath("live") || fromPath("v");
  }
  return null;
}

export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

export function youtubeThumbnailUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
