import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { deleteTaxonomy } from "@/actions/taxonomy";
import { TAXONOMY_META, type TaxonomyEntity } from "@/lib/taxonomy";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
  const redirectTo = TAXONOMY_META[entity].path;

  return (
    <div>
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle>{noun.charAt(0).toUpperCase() + noun.slice(1)}s</CardTitle>
          <Button asChild size="sm"><Link href={`/admin/taxonomy/${entity}/new`}><Plus className="size-4" /> Add {noun}</Link></Button>
        </CardHeader>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
              <Tag className="size-5" />
            </span>
            <p className="text-sm font-medium text-primary">No {noun}s yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Use the button above to create your first {noun}.
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
                        <Link href={`/admin/taxonomy/${entity}/${item.id}/edit`}>Edit</Link>
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
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
