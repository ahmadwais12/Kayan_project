import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const SETTING_DEFAULTS = {
  siteName: "Kayan Land",
  siteLegalName: "Kayan Land Architecture & Construction Company",
  tagline: "Where Beauty and Functionality Unite in Design.",
  siteDescription:
    "Kayan Land is an architecture and construction company creating considered spaces where beauty and functionality meet.",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  workingHours: "",
  mapEmbedUrl: "",
  footerAbout:
    "Architecture and construction studio creating enduring spaces through thoughtful design and disciplined delivery.",
  copyright: "Kayan Land Architecture & Construction Company. All rights reserved.",
  logoUrl: "/brand/kayan-mark.png",
  faviconUrl: "/brand/kayan-favicon.png",
  instagramUrl: "https://www.instagram.com/kayanland.acc/",
  facebookUrl: "",
  linkedinUrl: "",
  whatsappUrl: "",
  primaryColor: "#172B35",
  secondaryColor: "#343B3D",
  accentColor: "#C49A68",
  backgroundColor: "#F3F0E9",
  mutedColor: "#E7E3DA",
  whiteColor: "#FFFFFF",
} as const;

export type CompanySettings = Record<keyof typeof SETTING_DEFAULTS, string>;

export const getSettings = cache(async (): Promise<CompanySettings> => {
  try {
    const rows = await prisma.companySetting.findMany();
    const values = { ...SETTING_DEFAULTS } as Record<string, string>;
    for (const row of rows) {
      if (row.key in values) values[row.key] = row.value;
    }
    return values as CompanySettings;
  } catch {
    return { ...SETTING_DEFAULTS };
  }
});

export const getSeoSettings = cache(async () => {
  const fallback = {
    siteTitle: "Kayan Land — Architecture & Construction",
    defaultDescription:
      "Kayan Land Architecture & Construction Company. Where beauty and functionality unite in design.",
    ogImage: "/images/hero.jpg",
    canonicalBase: process.env.APP_URL || "http://localhost:3333",
    robotsPolicy: "index, follow",
    googleVerification: "",
    bingVerification: "",
  };
  try {
    const row = await prisma.sEOSetting.findUnique({ where: { id: "global" } });
    if (!row) return fallback;
    return {
      siteTitle: row.siteTitle || fallback.siteTitle,
      defaultDescription: row.defaultDescription || fallback.defaultDescription,
      ogImage: row.ogImage || fallback.ogImage,
      canonicalBase:
        row.canonicalBase || process.env.APP_URL || "http://localhost:3333",
      robotsPolicy: row.robotsPolicy || fallback.robotsPolicy,
      googleVerification: row.googleVerification || "",
      bingVerification: row.bingVerification || "",
    };
  } catch {
    return fallback;
  }
});
