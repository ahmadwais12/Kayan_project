import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";
import { getSeoSettings } from "@/lib/settings";

type SeoInput = {
  title?: string;
  description?: string;
  image?: string | null;
  path?: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
};

export async function buildMetadata({
  title,
  description,
  image,
  path,
  noindex,
  type = "website",
  publishedTime,
}: SeoInput = {}): Promise<Metadata> {
  const seo = await getSeoSettings();
  const resolvedTitle = title || seo.siteTitle;
  const resolvedDescription = description || seo.defaultDescription;
  const resolvedImage = image || seo.ogImage;
  const canonical = path ? absoluteUrl(path) : undefined;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: canonical ? { canonical } : undefined,
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: "Kayan Land",
      type,
      images: resolvedImage ? [{ url: resolvedImage }] : undefined,
      publishedTime,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
