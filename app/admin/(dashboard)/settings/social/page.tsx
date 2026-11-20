import Link from "next/link";
import { ExternalLink, Globe, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { deleteSocialLink } from "@/actions/settings";
import { SocialIcon } from "@/components/public/social-icon";
import { MAX_SOCIAL_LINKS, socialPlatformLabel } from "@/lib/social-platforms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function SocialSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("settings.manage");
  const query = await searchParams;

  const links = await prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { platform: "asc" }] });
  const canAdd = links.length < MAX_SOCIAL_LINKS;

  return (
    <div>
      <PageHeader
        title="Social media"
        description="Manage the social profiles shown across the website."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }, { label: "Social" }]}
        actions={
          canAdd ? (
            <Button asChild>
              <Link href="/admin/social/new"><Plus className="size-4" /> Create social link</Link>
            </Button>
          ) : (
            <Button disabled title={`Maximum of ${MAX_SOCIAL_LINKS} social links reached`}>
              <Plus className="size-4" /> Create social link
            </Button>
          )
        }
      />
      <SettingsTabs active="/admin/settings/social" />
      <AdminFlash {...flashFromQuery(query)} />

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/70">
          <CardTitle>Social links</CardTitle>
          <span className="text-xs text-muted-foreground">{links.length} / {MAX_SOCIAL_LINKS}</span>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table className="min-w-[680px]">
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent">
                <TableHead>Platform</TableHead>
                <TableHead>Profile link</TableHead>
                <TableHead className="w-28">Order</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="px-6 py-14 text-center">
                    <span className="mx-auto grid size-11 place-items-center rounded-full bg-secondary text-primary">
                      <Globe className="size-5" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-primary">No social links yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Create a social link to show it across the website.</p>
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-white">
                          <SocialIcon platform={link.platform} className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-primary">{socialPlatformLabel(link.platform)}</p>
                          {link.label && <p className="truncate text-xs text-muted-foreground">{link.label}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
                        <span className="max-w-[28rem] truncate">{link.url}</span>
                        <ExternalLink className="size-3.5 shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell>{link.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={link.isActive ? "success" : "secondary"}>{link.isActive ? "Visible" : "Hidden"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <ViewButton href={`/admin/records/social/${link.id}`} name={socialPlatformLabel(link.platform)} />
                        <Button asChild variant="ghost" size="icon" className="size-8">
                          <Link href={`/admin/social/${link.id}/edit`} title="Edit" aria-label={`Edit ${link.platform}`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <DeleteButton
                          id={link.id}
                          action={deleteSocialLink}
                          fields={{ returnTo: "/admin/settings/social" }}
                          title={`Delete ${link.platform}?`}
                          description="The link will be removed from the website."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
