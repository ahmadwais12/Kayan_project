import { describe, expect, it } from "vitest";
import { contactSchema, newsletterSchema, projectSchema, quoteSchema } from "@/lib/validations";

const contact = {
  name: "Amina Yusuf",
  email: "amina@example.com",
  phone: "",
  subject: "New courtyard house",
  message: "We would like to discuss a courtyard house in Kabul.",
  company: "",
};

const quote = {
  name: "Amina Yusuf",
  email: "amina@example.com",
  phone: "+93 700 000 000",
  projectType: "Residential",
  location: "Kabul",
  budget: "",
  startDate: "",
  description: "A two-storey family home with a planted courtyard and a small studio.",
  company: "",
};

const project = {
  title: "Courtyard House",
  slug: "courtyard-house",
  categoryId: "category-1",
  clientName: "",
  location: "Kabul",
  year: "",
  status: "COMPLETED" as const,
  duration: "",
  budget: "",
  description: "A family house arranged around a planted courtyard.",
  challenges: "",
  solutions: "",
  architecturalDetails: "",
  constructionDetails: "",
  coverImage: "",
  beforeImage: "",
  afterImage: "",
  showBeforeAfter: false,
  isFeatured: false,
  isPublished: false,
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  tags: "",
};

describe("contactSchema", () => {
  it("accepts a valid inquiry", () => {
    expect(contactSchema.safeParse(contact).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ ...contact, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    expect(contactSchema.safeParse({ ...contact, message: "Hello" }).success).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    expect(contactSchema.safeParse({ ...contact, company: "spam" }).success).toBe(false);
  });
});

describe("quoteSchema", () => {
  it("accepts a valid brief with optional fields empty", () => {
    const parsed = quoteSchema.safeParse(quote);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.budget).toBe("");
      expect(parsed.data.startDate).toBe("");
    }
  });

  it("rejects a short phone number", () => {
    expect(quoteSchema.safeParse({ ...quote, phone: "123" }).success).toBe(false);
  });

  it("rejects a brief under twenty characters", () => {
    expect(quoteSchema.safeParse({ ...quote, description: "Small house" }).success).toBe(false);
  });
});

describe("newsletterSchema", () => {
  it("accepts an email without a name", () => {
    expect(newsletterSchema.safeParse({ email: "reader@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(newsletterSchema.safeParse({ email: "reader" }).success).toBe(false);
  });
});

describe("projectSchema slugs", () => {
  it("accepts a lowercase hyphenated slug", () => {
    expect(projectSchema.safeParse(project).success).toBe(true);
  });

  it("rejects uppercase and spaced slugs", () => {
    expect(projectSchema.safeParse({ ...project, slug: "Courtyard House" }).success).toBe(false);
  });

  it("requires a category", () => {
    expect(projectSchema.safeParse({ ...project, categoryId: "" }).success).toBe(false);
  });
});
