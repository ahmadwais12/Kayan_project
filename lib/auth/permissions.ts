export type PermissionKey =
  | "dashboard.view"
  | "content.manage"
  | "projects.manage"
  | "services.manage"
  | "team.manage"
  | "blog.manage"
  | "gallery.manage"
  | "media.manage"
  | "inquiries.manage"
  | "settings.manage"
  | "users.manage"
  | "audit.view"
  | "analytics.view";

export const PERMISSIONS: { key: PermissionKey; label: string; group: string }[] = [
  { key: "dashboard.view", label: "View dashboard", group: "Administration" },
  { key: "content.manage", label: "Manage website content", group: "Content" },
  { key: "projects.manage", label: "Manage projects", group: "Content" },
  { key: "services.manage", label: "Manage services", group: "Content" },
  { key: "team.manage", label: "Manage team", group: "Content" },
  { key: "blog.manage", label: "Manage blog", group: "Content" },
  { key: "gallery.manage", label: "Manage gallery", group: "Content" },
  { key: "media.manage", label: "Upload images for content", group: "Content" },
  { key: "inquiries.manage", label: "Manage inquiries", group: "Customers" },
  { key: "settings.manage", label: "Manage settings", group: "Administration" },
  { key: "users.manage", label: "Manage administrators and roles", group: "Administration" },
  { key: "audit.view", label: "View audit log", group: "Administration" },
  { key: "analytics.view", label: "View analytics", group: "Administration" },
];

export const ROLE_PRESETS: Record<string, PermissionKey[]> = {
  "super-admin": PERMISSIONS.map((permission) => permission.key),
  admin: [
    "dashboard.view",
    "content.manage",
    "projects.manage",
    "services.manage",
    "team.manage",
    "blog.manage",
    "gallery.manage",
    "media.manage",
    "inquiries.manage",
    "analytics.view",
  ],
  "content-manager": [
    "dashboard.view",
    "content.manage",
    "projects.manage",
    "services.manage",
    "team.manage",
    "blog.manage",
    "gallery.manage",
    "media.manage",
  ],
  editor: ["dashboard.view", "blog.manage", "projects.manage"],
};

export function hasPermission(
  session: { user: { role: { slug: string; permissions: string[] } } } | null,
  permission: PermissionKey,
) {
  if (!session) return false;
  if (session.user.role.slug === "super-admin") return true;
  return (
    session.user.role.permissions.includes("*") ||
    session.user.role.permissions.includes(permission)
  );
}
