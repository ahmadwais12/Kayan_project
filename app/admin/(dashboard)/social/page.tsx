import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Share2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/form-kit";
import { PlatformSelect } from "@/components/admin/platform-select";
import { SocialIcon } from "@/components/public/social-icon";
import { deleteSocialLink, reorderSocialLink, saveSocialLink } from "@/actions/settings";
import { MAX_SOCIAL_LINKS, SOCIAL_PLATFORMS, socialPlatformLabel } from "@/lib/social-platforms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SocialLinksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const query = await searchParams;

  const links = await prisma.socialLink.findMany({
    orderBy: [{ sortOrder: "asc" }, { platform: "asc" }],
  });
  const editing = query.edit ? links.find((link) => link.id === query.edit) : undefined;
  const activeCount = links.filter((link) => link.isActive).length;
  const emptySlots = Math.max(MAX_SOCIAL_LINKS - links.length, 0);
  const platformOptions = SOCIAL_PLATFORMS.some((item) => item.value === editing?.platform)
    ? SOCIAL_PLATFORMS
    : editing
      ? [...SOCIAL_PLATFORMS, { value: editing.platform, label: editing.platform }]
      : SOCIAL_PLATFORMS;

  return (
    <div>
      <PageHeader
        title="Social links"
        description={`Up to ${MAX_SOCIAL_LINKS} social media or app icons. Add a link, choose an icon and arrange the display order used across the website.`}
        breadcrumb={[{ label: "Social Links" }]}
        actions={
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            <Share2 className="size-3.5 text-accent" />
            <span className="font-medium text-primary">{links.length}</span> / {MAX_SOCIAL_LINKS} slots used
            <span className="text-border">|</span>
            {activeCount} visible
          </div>
        }
      />
      <AdminFlash {...flashFromQuery(query)} />

      <div className="grid items-start gap-5 xl:grid-cols-[360px_1fr]">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>{editing ? "Edit link" : "Add a link"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveSocialLink} className="space-y-4">
              <input type="hidden" name="id" value={editing?.id || ""} />
              <input type="hidden" name="returnTo" value="/admin/social" />
              <input type="hidden" name="icon" value={editing?.icon || ""} />
              <input
                type="hidden"
                name="sortOrder"
                value={editing?.sortOrder ?? (links.length + 1) * 10}
              />

              <div>
                <Label htmlFor="platform">Platform or app</Label>
                <PlatformSelect
                  id="platform"
                  name="platform"
                  defaultValue={editing?.platform || "Instagram"}
                  options={platformOptions.map((item) => ({ value: item.value, label: item.label }))}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Search the list and the matching icon is shown in the website footer.
                </p>
              </div>

              <div>
                <Label htmlFor="url">Destination link</Label>
                <Input
                  id="url"
                  name="url"
                  type="text"
                  inputMode="url"
                  defaultValue={editing?.url || ""}
                  required
                  maxLength={500}
                  placeholder="https://instagram.com/yourstudio"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Use a full URL, or a mailto: / tel: link for contact icons.
                </p>
              </div>

              <div>
                <Label htmlFor="label">Accessible label</Label>
                <Input
                  id="label"
                  name="label"
                  defaultValue={editing?.label || ""}
                  maxLength={120}
                  placeholder="Kayan Land on Instagram"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Read by screen readers. Defaults to the platform name.
                </p>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
                <span>
                  <span className="block text-sm text-primary">Visible on website</span>
                  <span className="block text-xs text-muted-foreground">Hide without deleting the link.</span>
                </span>
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={editing?.isActive ?? true}
                  className="size-4 accent-[#172B35]"
                />
              </label>

              <div className="flex items-center gap-2 pt-1">
                <SubmitButton>{editing ? "Save link" : "Add link"}</SubmitButton>
                {editing && (
                  <Button asChild variant="outline">
                    <Link href="/admin/social">Cancel</Link>
                  </Button>
                )}
              </div>
              {!editing && links.length >= MAX_SOCIAL_LINKS && (
                <p className="text-xs text-destructive">
                  All {MAX_SOCIAL_LINKS} slots are used. Remove a link before adding another.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <div>
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
              <div>
                <h2 className="font-display text-lg text-primary">Display order</h2>
                <p className="text-xs text-muted-foreground">
                  Use the arrows to move icons. The footer follows this order.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/settings/social">
                  <ExternalLink className="size-3.5" /> Classic view
                </Link>
              </Button>
            </div>

            <Table className="min-w-[760px]">
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-40">Position</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="px-6 py-14 text-center">
                      <span className="mx-auto grid size-11 place-items-center rounded-full bg-secondary text-primary">
                        <Share2 className="size-5" />
                      </span>
                      <p className="mt-3 text-sm font-medium text-primary">No social links yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Add your first link on the left. It will appear in the website footer immediately.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  links.map((link, index) => (
                    <TableRow key={link.id} className={cn(!link.isActive && "bg-secondary/15")}>
                      <TableCell className="text-center">
                        <span className="font-mono text-xs text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-white">
                            <SocialIcon platform={link.platform} className="size-4" />
                          </span>
                          <span className="truncate text-sm font-medium text-primary">
                            {socialPlatformLabel(link.platform)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-[18rem] items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="size-3 shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.62rem] font-medium",
                            link.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              link.isActive ? "bg-emerald-500" : "bg-muted-foreground/60",
                            )}
                          />
                          {link.isActive ? "Visible" : "Hidden"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <form action={reorderSocialLink}>
                            <input type="hidden" name="id" value={link.id} />
                            <input type="hidden" name="returnTo" value="/admin/social" />
                            <input type="hidden" name="direction" value="up" />
                            <button
                              type="submit"
                              disabled={index === 0}
                              title="Move up"
                              aria-label={`Move ${link.platform} up`}
                              className="inline-flex size-7 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                            >
                              <ArrowUp className="size-3.5" />
                            </button>
                          </form>
                          <form action={reorderSocialLink}>
                            <input type="hidden" name="id" value={link.id} />
                            <input type="hidden" name="returnTo" value="/admin/social" />
                            <input type="hidden" name="direction" value="down" />
                            <button
                              type="submit"
                              disabled={index === links.length - 1}
                              title="Move down"
                              aria-label={`Move ${link.platform} down`}
                              className="inline-flex size-7 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                            >
                              <ArrowDown className="size-3.5" />
                            </button>
                          </form>
                          <span className="ml-1 font-mono text-[0.62rem] text-muted-foreground">
                            {index + 1}/{links.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5">
                          <Button asChild variant="ghost" size="icon" className="size-7">
                            <Link
                              href={`/admin/social?edit=${link.id}`}
                              title="Edit"
                              aria-label={`Edit ${link.platform}`}
                            >
                              <Pencil className="size-3.5" />
                            </Link>
                          </Button>
                          <DeleteButton
                            id={link.id}
                            action={deleteSocialLink}
                            fields={{ returnTo: "/admin/social" }}
                            title={`Delete ${link.platform}?`}
                            description="The icon and link will be removed from the website."
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-secondary/20 px-5 py-3 text-[0.68rem] text-muted-foreground">
              <span>
                <span className="font-medium text-primary">{links.length}</span> of {MAX_SOCIAL_LINKS} slots used
                {emptySlots > 0 ? ` · ${emptySlots} available` : ""}
              </span>
              <span>Footer icons follow this table from top to bottom.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
