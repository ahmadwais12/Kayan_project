import { describe, expect, it } from "vitest";
import { PERMISSIONS, ROLE_PRESETS, hasPermission } from "@/lib/auth/permissions";

function session(slug: string, permissions: string[]) {
  return { user: { role: { slug, permissions } } };
}

describe("hasPermission", () => {
  it("denies anonymous requests", () => {
    expect(hasPermission(null, "dashboard.view")).toBe(false);
  });

  it("grants every permission to the super admin role", () => {
    const superAdmin = session("super-admin", []);
    for (const permission of PERMISSIONS) {
      expect(hasPermission(superAdmin, permission.key)).toBe(true);
    }
  });

  it("honours explicit grants and denials", () => {
    const editor = session("editor", ROLE_PRESETS.editor);
    expect(hasPermission(editor, "blog.manage")).toBe(true);
    expect(hasPermission(editor, "users.manage")).toBe(false);
  });

  it("supports the wildcard grant", () => {
    expect(hasPermission(session("custom", ["*"]), "settings.manage")).toBe(true);
  });
});

describe("role presets", () => {
  it("keeps content managers out of administration", () => {
    const preset = ROLE_PRESETS["content-manager"];
    expect(preset).toContain("projects.manage");
    expect(preset).not.toContain("users.manage");
    expect(preset).not.toContain("settings.manage");
  });

  it("only lists known permission keys", () => {
    const known = new Set(PERMISSIONS.map((permission) => permission.key));
    for (const preset of Object.values(ROLE_PRESETS)) {
      for (const key of preset) expect(known.has(key)).toBe(true);
    }
  });
});
