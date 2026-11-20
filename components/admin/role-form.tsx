import { saveRole } from "@/actions/users";
import { SubmitButton } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { PERMISSIONS } from "@/lib/auth/permissions";

function groupPermissions(keys: string[]) {
  const groups = new Map<string, typeof PERMISSIONS>();
  for (const permission of PERMISSIONS) {
    const list = groups.get(permission.group) || [];
    list.push(permission);
    groups.set(permission.group, list);
  }
  return [...groups.entries()].map(([group, items]) => ({ group, items }));
}

export function RoleForm({ role }: { role?: { id: string; name: string; slug: string; description: string | null; isSystem: boolean; keys: string[] } }) {
  const groups = groupPermissions(role?.keys || []);
  const isSuper = role?.slug === "super-admin";
  return <form action={saveRole} className="mx-auto max-w-4xl space-y-5">
    {role && <input type="hidden" name="id" value={role.id} />}
    <div className="grid gap-4 sm:grid-cols-2">
      <div><Label htmlFor="role-name">Role name</Label><Input id="role-name" name="name" defaultValue={role?.name} required maxLength={80} /></div>
      {role && <div><Label htmlFor="role-slug">Identifier</Label><Input id="role-slug" value={role.slug} disabled readOnly /></div>}
    </div>
    <div><Label htmlFor="role-description">Description</Label><Textarea id="role-description" name="description" defaultValue={role?.description || ""} maxLength={500} className="min-h-20" placeholder="What this role is responsible for" /></div>
    {isSuper ? <div className="rounded-md border border-border/70 bg-secondary/50 px-3 py-2.5 text-xs text-muted-foreground">Super Admin always has every permission and cannot be restricted. The role name and description can still be edited.</div> : <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => <fieldset key={group.group} className="rounded-md border border-border/70 p-3"><legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.group}</legend><div className="mt-1 space-y-2">{group.items.map((permission) => <label key={permission.key} className="flex items-start gap-2.5 text-sm"><input type="checkbox" name="permissions" value={permission.key} defaultChecked={role?.keys.includes(permission.key)} className="mt-0.5 size-4 accent-accent" /><span><span className="block text-foreground/85">{permission.label}</span><span className="block font-mono text-[0.65rem] text-muted-foreground">{permission.key}</span></span></label>)}</div></fieldset>)}
    </div>}
    <div className="flex gap-2"><SubmitButton>{role ? "Save role" : "Create role"}</SubmitButton><Button type="button" variant="outline" asChild><a href="/admin/users/roles">Cancel</a></Button></div>
  </form>;
}
