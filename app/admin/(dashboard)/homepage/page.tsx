import { Home } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { SubmitButton } from "@/components/admin/form-kit";
import { ImageInput } from "@/components/admin/image-input";
import { saveHomepageSection } from "@/actions/content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About introduction",
  mission: "Mission",
  vision: "Vision",
  services: "Services",
  projects: "Featured projects",
  why: "Why choose us",
  stats: "Statistics",
  process: "Process",
  testimonials: "Testimonials",
  blog: "Journal / blog",
  cta: "Call to action",
};

export default async function HomepagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("content.manage");
  const query = await searchParams;

  const [sections, media] = await Promise.all([
    prisma.homepageSection.findMany({ orderBy: [{ sortOrder: "asc" }, { key: "asc" }] }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Home page"
        description="Control the copy and imagery of each homepage section. Lists such as projects and services are managed in their own modules."
        breadcrumb={[{ label: "Home Page" }]}
      />

      <AdminFlash {...flashFromQuery(query)} />

      {sections.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <Home className="size-5" />
          </span>
          <p className="text-sm font-medium text-primary">No homepage sections found</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Run the database seed to create the default homepage sections.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} id={section.key}>
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <div className="flex items-center gap-2">
                  <CardTitle>{LABELS[section.key] || section.key}</CardTitle>
                  <Badge variant={section.isEnabled ? "success" : "secondary"}>
                    {section.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">key: {section.key}</span>
              </CardHeader>
              <CardContent>
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-primary">
                    Edit section content
                  </summary>
                  <form action={saveHomepageSection} className="mt-4 space-y-4">
                    <input type="hidden" name="id" value={section.id} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`${section.key}-title`}>Title</Label>
                        <Input id={`${section.key}-title`} name="title" defaultValue={section.title || ""} maxLength={200} />
                      </div>
                      <div>
                        <Label htmlFor={`${section.key}-subtitle`}>Subtitle / eyebrow</Label>
                        <Input id={`${section.key}-subtitle`} name="subtitle" defaultValue={section.subtitle || ""} maxLength={200} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`${section.key}-description`}>Description</Label>
                      <Textarea id={`${section.key}-description`} name="description" defaultValue={section.description || ""} rows={4} maxLength={3000} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`${section.key}-buttonLabel`}>Primary button label</Label>
                        <Input id={`${section.key}-buttonLabel`} name="buttonLabel" defaultValue={section.buttonLabel || ""} maxLength={80} />
                      </div>
                      <div>
                        <Label htmlFor={`${section.key}-buttonUrl`}>Primary button URL</Label>
                        <Input id={`${section.key}-buttonUrl`} name="buttonUrl" defaultValue={section.buttonUrl || ""} maxLength={300} placeholder="/contact" />
                      </div>
                      <div>
                        <Label htmlFor={`${section.key}-secondaryLabel`}>Secondary button label</Label>
                        <Input id={`${section.key}-secondaryLabel`} name="secondaryLabel" defaultValue={section.secondaryLabel || ""} maxLength={80} />
                      </div>
                      <div>
                        <Label htmlFor={`${section.key}-secondaryUrl`}>Secondary button URL</Label>
                        <Input id={`${section.key}-secondaryUrl`} name="secondaryUrl" defaultValue={section.secondaryUrl || ""} maxLength={300} placeholder="/projects" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ImageInput name="imageUrl" defaultValue={section.imageUrl || ""} library={media} label="Section image" help="Used by sections that support imagery, such as the hero or about block." />
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`${section.key}-sortOrder`}>Display order</Label>
                          <Input id={`${section.key}-sortOrder`} name="sortOrder" type="number" min={0} defaultValue={section.sortOrder} />
                        </div>
                        <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
                          <span className="text-sm">Enabled</span>
                          <input type="checkbox" name="isEnabled" defaultChecked={section.isEnabled} className="size-4 accent-[#172B35]" />
                        </label>
                      </div>
                    </div>
                    <SubmitButton>Save section</SubmitButton>
                  </form>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
