"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { saveTeamMember, type TeamState } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFeedback, SubmitButton, FieldHelp } from "@/components/admin/form-kit";
import { SlugInput } from "@/components/admin/slug-input";
import { ImageInput } from "@/components/admin/image-input";
import { MarkdownInput } from "@/components/admin/markdown-input";

type LibraryItem = { id: string; url: string; alt?: string | null };

export type TeamFormValues = {
  id?: string;
  name: string;
  slug: string;
  jobTitle: string;
  departmentId: string;
  imageUrl: string;
  bio: string;
  skills: string;
  education: string;
  experience: string;
  email: string;
  linkedinUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  websiteUrl: string;
  sortOrder: number;
  isPublished: boolean;
};

export function TeamForm({
  values,
  departments,
  library,
}: {
  values: TeamFormValues;
  departments: { id: string; name: string }[];
  library: LibraryItem[];
}) {
  const [state, formAction] = useActionState<TeamState, FormData>(saveTeamMember, {});

  return (
    <form action={formAction} className="grid items-start gap-5 xl:grid-cols-[1.55fr_1fr]">
      <input type="hidden" name="id" value={values.id || ""} />

      <div className="space-y-5">
        <FormFeedback error={state.error} />

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" defaultValue={values.name} required maxLength={160} />
              </div>
              <SlugInput defaultValue={values.slug} titleId="name" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="jobTitle">Job title</Label>
                <Input id="jobTitle" name="jobTitle" defaultValue={values.jobTitle} required maxLength={160} />
              </div>
              <div>
                <Label htmlFor="departmentId">Department</Label>
                <NativeSelect id="departmentId" name="departmentId" defaultValue={values.departmentId}>
                  <option value="">No department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div>
              <Label htmlFor="skills">Skills / focus areas</Label>
              <Input id="skills" name="skills" defaultValue={values.skills} placeholder="Architecture, Interior design, Site supervision" />
              <FieldHelp>Comma-separated. Displayed as small tags on the profile.</FieldHelp>
            </div>
            <MarkdownInput name="bio" defaultValue={values.bio} label="Biography" rows={8} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Background</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="education">Education</Label>
              <Textarea id="education" name="education" defaultValue={values.education} rows={4} />
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Textarea id="experience" name="experience" defaultValue={values.experience} rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email (optional, public)</Label>
              <Input id="email" name="email" type="email" defaultValue={values.email} />
            </div>
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={values.linkedinUrl} placeholder="https://" />
            </div>
            <div>
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input id="instagramUrl" name="instagramUrl" type="url" defaultValue={values.instagramUrl} placeholder="https://" />
            </div>
            <div>
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input id="facebookUrl" name="facebookUrl" type="url" defaultValue={values.facebookUrl} placeholder="https://" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="websiteUrl">Personal website</Label>
              <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={values.websiteUrl} placeholder="https://" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5 xl:sticky xl:top-20">
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
              <span className="text-sm">Published on website</span>
              <input type="checkbox" name="isPublished" defaultChecked={values.isPublished} className="size-4 accent-[#172B35]" />
            </label>
            <div>
              <Label htmlFor="sortOrder">Display order</Label>
              <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={values.sortOrder} />
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <SubmitButton className="w-full">Save team member</SubmitButton>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/team">Cancel</Link>
              </Button>
              {values.id && values.isPublished && (
                <Button asChild variant="ghost" className="w-full">
                  <Link href={`/team/${values.slug}`} target="_blank">
                    Preview live profile <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portrait</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageInput name="imageUrl" defaultValue={values.imageUrl} library={library} label="Profile photo" help="A square or portrait image works best. Only publish photos you have permission to use." />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
