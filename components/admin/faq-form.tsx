import Link from "next/link";
import type { FAQ } from "@prisma/client";
import { saveFaq } from "@/actions/content";
import { SubmitButton } from "@/components/admin/form-kit";
import { LocalizedField } from "@/components/admin/localized-field";
import { loadFormTranslations } from "@/lib/i18n/form-translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect } from "@/components/ui/input";

export async function FaqForm({ editing, categories }: {
  editing?: FAQ;
  categories: { id: string; name: string }[];
}) {
  const translations = editing
    ? await loadFormTranslations("faq", editing.id, ["question", "answer"])
    : undefined;

  return (
    <Card>
      <CardHeader><CardTitle>{editing ? "Edit FAQ" : "Add FAQ"}</CardTitle></CardHeader>
      <CardContent>
        <form action={saveFaq} className="max-w-3xl space-y-5">
          <input type="hidden" name="id" value={editing?.id || ""} />
          <input type="hidden" name="returnTo" value={editing ? `/admin/faqs/${editing.id}/edit` : "/admin/faqs/new"} />
          <LocalizedField id="question" name="question" label="Question" defaultValue={editing?.question} translations={translations} required maxLength={500} />
          <LocalizedField id="answer" name="answer" label="Answer" defaultValue={editing?.answer} translations={translations} multiline rows={7} required maxLength={8000} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="categoryId">Category</Label><NativeSelect id="categoryId" name="categoryId" defaultValue={editing?.categoryId || ""}><option value="">Uncategorised</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</NativeSelect></div>
            <div><Label htmlFor="sortOrder">Display order</Label><Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={editing?.sortOrder ?? 0} /></div>
          </div>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Active</span><input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} className="size-4 accent-accent" /></label>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5"><span className="text-sm">Show with services</span><input type="checkbox" name="showOnService" defaultChecked={editing?.showOnService ?? false} className="size-4 accent-accent" /></label>
          <div className="flex items-center gap-2"><SubmitButton>{editing ? "Save changes" : "Add FAQ"}</SubmitButton><Button asChild variant="outline"><Link href="/admin/faqs">Cancel</Link></Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
