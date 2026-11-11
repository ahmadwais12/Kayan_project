import Link from "next/link";
import { Tag } from "lucide-react";
import { saveTaxonomy, deleteTaxonomy } from "@/actions/taxonomy";
import { TAXONOMY_META, type TaxonomyEntity } from "@/lib/taxonomy";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  usage: number;
};

export function TaxonomyManager({
  entity,
  items,
  editId,
  noun,
  description,
  simple = false,
}: {
  entity: TaxonomyEntity;
  items: TaxonomyItem[];
  editId?: string;
  noun: string;
  description: string;
  simple?: boolean;
}) {
  const editing = editId ? items.find((item) => item.id === editId) : undefined;
  const redirectTo = TAXONOMY_META[entity].path;

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.6fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? `Edit ${noun}` : `Add ${noun}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveTaxonomy} className="space-y-4">
            <input type="hidden" name="entity" value={entity} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input type="hidden" name="id" value={editing?.id || ""} />
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editing?.name || ""} required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={editing?.slug || ""}
                placeholder="Generated from the name when empty"
                maxLength={160}
              />
            </div>
            {!simple && (
              <>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editing?.description || ""}
                    rows={3}
                    maxLength={2000}
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Display order</Label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    min={0}
                    defaultValue={editing?.sortOrder ?? 0}
                  />
                </div>
                <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2.5">
                  <span className="text-sm">Active</span>
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editing ? editing.isActive !== false : true}
                    className="size-4 accent-[#172B35]"
                  />
                </label>
              </>
            )}
            <div className="flex items-center gap-2 pt-1">
              <SubmitButton>{editing ? "Save changes" : `Add ${noun}`}</SubmitButton>
              {editing && (
                <Button asChild variant="outline">
                  <Link href={redirectTo}>Cancel</Link>
                </Button>
              )}
            </div>
          </form>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
              <Tag className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No {noun}s yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Use the form to create your first {noun}.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {!simple && <TableHead>Order</TableHead>}
                <TableHead>In use</TableHead>
                {!simple && <TableHead>State</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="block font-medium text-primary">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">/{item.slug}</span>
                  </TableCell>
                  {!simple && <TableCell className="text-muted-foreground">{item.sortOrder ?? 0}</TableCell>}
                  <TableCell className="text-muted-foreground">{item.usage}</TableCell>
                  {!simple && (
                    <TableCell>
                      <Badge variant={item.isActive === false ? "secondary" : "success"}>
                        {item.isActive === false ? "Hidden" : "Active"}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`${redirectTo}?edit=${item.id}`}>Edit</Link>
                      </Button>
                      <DeleteButton
                        id={item.id}
                        action={deleteTaxonomy}
                        fields={{ entity, redirectTo }}
                        title={`Delete “${item.name}”?`}
                        description={
                          item.usage > 0
                            ? `This ${noun} is used by ${item.usage} item${item.usage === 1 ? "" : "s"}. It cannot be deleted until those items are reassigned.`
                            : `This ${noun} will be permanently removed.`
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
