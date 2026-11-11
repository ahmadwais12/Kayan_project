import type { PermissionKey } from "@/lib/auth/permissions";

export const TAXONOMY_KEYS = [
  "projectCategory",
  "serviceCategory",
  "blogCategory",
  "blogTag",
  "projectTag",
  "department",
  "galleryCategory",
  "faqCategory",
] as const;

export type TaxonomyEntity = (typeof TAXONOMY_KEYS)[number];

export const TAXONOMY_META: Record<
  TaxonomyEntity,
  {
    permission: PermissionKey;
    label: string;
    path: string;
    entity: string;
    simple?: boolean;
  }
> = {
  projectCategory: {
    permission: "projects.manage",
    label: "project category",
    path: "/admin/projects/categories",
    entity: "ProjectCategory",
  },
  serviceCategory: {
    permission: "services.manage",
    label: "service category",
    path: "/admin/services/categories",
    entity: "ServiceCategory",
  },
  blogCategory: {
    permission: "blog.manage",
    label: "blog category",
    path: "/admin/blog/categories",
    entity: "BlogCategory",
  },
  blogTag: {
    permission: "blog.manage",
    label: "blog tag",
    path: "/admin/blog/tags",
    entity: "BlogTag",
    simple: true,
  },
  projectTag: {
    permission: "projects.manage",
    label: "project tag",
    path: "/admin/projects/categories",
    entity: "ProjectTag",
    simple: true,
  },
  department: {
    permission: "team.manage",
    label: "department",
    path: "/admin/team/departments",
    entity: "Department",
  },
  galleryCategory: {
    permission: "gallery.manage",
    label: "gallery category",
    path: "/admin/gallery/categories",
    entity: "GalleryCategory",
  },
  faqCategory: {
    permission: "content.manage",
    label: "FAQ category",
    path: "/admin/faqs/categories",
    entity: "FaqCategory",
  },
};
