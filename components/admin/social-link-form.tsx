import Link from "next/link";
import { PlatformSelect } from "@/components/admin/platform-select";
import { SubmitButton } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { saveSocialLink } from "@/actions/settings";
import { MAX_SOCIAL_LINKS, SOCIAL_PLATFORMS } from "@/lib/social-platforms";

type SocialLinkValues = {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
};

export function SocialLinkForm({
  editing,
  nextOrder,
  totalLinks,
}: {
  editing?: SocialLinkValues;
  nextOrder: number;
  totalLinks: number;
}) {
  const platformOptions = SOCIAL_PLATFORMS.some((item) => item.value === editing?.platform)
    ? SOCIAL_PLATFORMS
    : editing
      ? [...SOCIAL_PLATFORMS, { value: editing.platform, label: editing.platform }]
      : SOCIAL_PLATFORMS;
  const atLimit = !editing && totalLinks >= MAX_SOCIAL_LINKS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editing ? "Edit social link" : "New social link"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveSocialLink} className="max-w-3xl space-y-5">
          <input type="hidden" name="id" value={editing?.id || ""} />
          <input type="hidden" name="returnTo" value={editing ? `/admin/social/${editing.id}/edit` : "/admin/social/new"} />
          <input type="hidden" name="successTo" value="/admin/social" />
          <input type="hidden" name="icon" value={editing?.icon || ""} />

          <div>
            <Label htmlFor="platform">Platform or app</Label>
            <PlatformSelect
              id="platform"
              name="platform"
              defaultValue={editing?.platform || "Instagram"}
              options={platformOptions.map((item) => ({ value: item.value, label: item.label }))}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">Choose the network or app represented by this link.</p>
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
            <p className="mt-1.5 text-xs text-muted-foreground">Use a full URL, or a mailto: / tel: link for contact icons.</p>
          </div>

          <div>
            <Label htmlFor="label">Accessible label</Label>
            <Input id="label" name="label" defaultValue={editing?.label || ""} maxLength={120} placeholder="Kayan Land on Instagram" />
            <p className="mt-1.5 text-xs text-muted-foreground">Read by screen readers. Defaults to the platform name.</p>
          </div>

          <div className="max-w-xs">
            <Label htmlFor="sortOrder">Display order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" min={0} max={999} defaultValue={editing?.sortOrder ?? nextOrder} />
          </div>

          <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-3">
            <span>
              <span className="block text-sm text-primary">Visible on website</span>
              <span className="block text-xs text-muted-foreground">Hide the link without deleting it.</span>
            </span>
            <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} className="size-4 accent-accent" />
          </label>

          <div className="flex items-center gap-2 pt-1">
            <SubmitButton>{editing ? "Save changes" : "Create social link"}</SubmitButton>
            <Button asChild variant="outline"><Link href="/admin/social">Cancel</Link></Button>
            {atLimit && <span className="text-xs text-destructive">All {MAX_SOCIAL_LINKS} slots are used.</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
