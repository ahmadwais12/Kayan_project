import Link from "next/link";
import type { ShowcaseVideo } from "@prisma/client";
import { saveShowcaseVideo } from "@/actions/content";
import { ImageInput } from "@/components/admin/image-input";
import { LocalizedField } from "@/components/admin/localized-field";
import { SubmitButton } from "@/components/admin/form-kit";
import { loadFormTranslations } from "@/lib/i18n/form-translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { VideoInput } from "@/components/admin/video-input";

export async function VideoForm({
  item,
  media,
}: {
  item?: ShowcaseVideo;
  media: { id: string; url: string; alt: string | null }[];
}) {
  const returnTo = item ? `/admin/videos/${item.id}/edit` : "/admin/videos/new";
  const translations = item
    ? await loadFormTranslations("showcaseVideo", item.id, ["title", "description"])
    : undefined;
  return <Card><CardHeader><CardTitle>{item ? "Edit video" : "Add video"}</CardTitle></CardHeader><CardContent>
    <form action={saveShowcaseVideo} className="max-w-3xl space-y-5">
      <input type="hidden" name="id" value={item?.id || ""} /><input type="hidden" name="returnTo" value={returnTo} />
      <LocalizedField id="title" name="title" label="Video title" defaultValue={item?.title} translations={translations} required maxLength={200} />
      <LocalizedField id="description" name="description" label="Description" defaultValue={item?.description ?? undefined} translations={translations} multiline rows={3} maxLength={1000} />
      <div><Label htmlFor="youtubeUrl">YouTube link</Label><Input id="youtubeUrl" name="youtubeUrl" defaultValue={item?.youtubeUrl || ""} placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…" /><p className="mt-1 text-xs text-muted-foreground">Paste a YouTube link, or leave it empty and upload a video file below.</p></div>
      <VideoInput name="videoUrl" defaultValue={item?.videoUrl || ""} label="Video file (if not using YouTube)" help="MP4 or WebM, up to 60 MB. The file is served from this site." />
      <ImageInput name="thumbnailUrl" defaultValue={item?.thumbnailUrl || ""} library={media} label="Thumbnail (optional)" help="Shown on the homepage card. Without it the YouTube cover image is used." />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="sortOrder">Display order</Label><Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} /></div>
        <label className="flex items-center justify-between gap-3 self-end rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Published</span><input type="checkbox" name="isPublished" defaultChecked={item?.isPublished ?? true} className="size-4 accent-accent" /></label>
      </div>
      <div className="flex items-center gap-2"><SubmitButton>{item ? "Save changes" : "Add video"}</SubmitButton><Button asChild variant="outline"><Link href="/admin/videos">Cancel</Link></Button></div>
    </form>
  </CardContent></Card>;
}
