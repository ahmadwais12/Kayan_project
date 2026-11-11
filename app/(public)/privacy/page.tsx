import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LegalDocument } from "@/components/public/legal-document";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const section = await prisma.homepageSection.findUnique({ where: { key: "privacy" } });
  const [localized] = section
    ? await withTranslations("homepage", [section], locale, ["title", "subtitle"])
    : [];
  return buildMetadata({
    title: localized?.title || t.privacyTitle,
    description: localized?.subtitle || t.legalContactDesc,
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return <LegalDocument sectionKey="privacy" fallbackTitle="Privacy Policy" currentPath="/privacy" />;
}
