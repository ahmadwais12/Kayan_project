import { z } from "zod";

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || "");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address").max(190)),
  password: z.string().trim().min(8, "Password must be at least 8 characters").max(200),
  next: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.email("Enter a valid email address").max(190),
  phone: optionalText(40),
  subject: z.string().trim().min(2, "Please add a subject").max(180),
  message: z.string().trim().min(10, "Please tell us a little more").max(5000),
  company: z.string().max(0).optional().or(z.literal("")),
});

export const quoteSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.email("Enter a valid email address").max(190),
  phone: z.string().trim().min(6, "Please enter a phone number").max(40),
  projectType: z.string().trim().min(2, "Select a project type").max(120),
  location: z.string().trim().min(2, "Please add the project location").max(180),
  budget: optionalText(80),
  startDate: optionalText(30),
  description: z.string().trim().min(20, "Please describe your project").max(8000),
  company: z.string().max(0).optional().or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email address").max(190),
  name: optionalText(120),
  company: z.string().max(0).optional().or(z.literal("")),
});

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(190)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(180),
  slug: slugSchema,
  categoryId: z.string().min(1, "Choose a category"),
  clientName: optionalText(180),
  location: z.string().trim().min(2, "Location is required").max(180),
  year: optionalText(20),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]),
  duration: optionalText(80),
  budget: optionalText(80),
  description: z.string().trim().min(10, "Description is required"),
  challenges: optionalText(20000),
  solutions: optionalText(20000),
  architecturalDetails: optionalText(20000),
  constructionDetails: optionalText(20000),
  coverImage: optionalText(500),
  beforeImage: optionalText(500),
  afterImage: optionalText(500),
  showBeforeAfter: z.boolean(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
  seoTitle: optionalText(180),
  seoDescription: optionalText(400),
  ogImage: optionalText(500),
  tags: z.string().optional().default(""),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(180),
  slug: slugSchema,
  categoryId: optionalText(40),
  shortDescription: z.string().trim().min(10, "Short description is required").max(500),
  description: z.string().trim().min(20, "Full description is required"),
  mainImage: optionalText(500),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
  seoTitle: optionalText(180),
  seoDescription: optionalText(400),
  ogImage: optionalText(500),
});

export const blogSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(180),
  slug: slugSchema,
  excerpt: z.string().trim().min(10, "Excerpt is required").max(500),
  content: z.string().trim().min(20, "Content is required"),
  featuredImage: optionalText(500),
  authorId: optionalText(40),
  categoryId: optionalText(40),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]),
  publishedAt: optionalText(40),
  readingTime: z.number().int().min(1).max(120),
  isFeatured: z.boolean(),
  seoTitle: optionalText(180),
  seoDescription: optionalText(400),
  ogImage: optionalText(500),
  tags: z.string().optional().default(""),
});

export const teamSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(160),
  slug: slugSchema,
  jobTitle: z.string().trim().min(2, "Job title is required").max(160),
  departmentId: optionalText(40),
  imageUrl: optionalText(500),
  bio: optionalText(20000),
  skills: optionalText(1000),
  education: optionalText(1000),
  experience: optionalText(1000),
  email: optionalText(190),
  linkedinUrl: optionalText(500),
  instagramUrl: optionalText(500),
  facebookUrl: optionalText(500),
  websiteUrl: optionalText(500),
  sortOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export const testimonialSchema = z.object({
  clientName: z.string().trim().min(2, "Client name is required").max(160),
  clientTitle: optionalText(160),
  clientCompany: optionalText(160),
  photoUrl: optionalText(500),
  content: z.string().trim().min(10, "Testimonial is required").max(3000),
  rating: z.number().int().min(1).max(5),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export const faqSchema = z.object({
  question: z.string().trim().min(4, "Question is required").max(500),
  answer: z.string().trim().min(4, "Answer is required").max(8000),
  categoryId: optionalText(40),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
  showOnService: z.boolean(),
});

export const gallerySchema = z.object({
  title: optionalText(180),
  caption: optionalText(500),
  categoryId: optionalText(40),
  url: z.string().min(1, "Upload or paste an image"),
  type: z.enum(["IMAGE", "VIDEO"]),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export async function parseForm<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): Promise<{ data: z.infer<T>; error: null } | { data: null; error: string }> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") raw[key] = value;
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    return { data: null, error: first?.message || "Please check the form fields." };
  }
  return { data: result.data as z.infer<T>, error: null };
}
