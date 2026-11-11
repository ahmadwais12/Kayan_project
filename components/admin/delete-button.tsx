"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteButton({
  id,
  action,
  title = "Delete this item?",
  description = "This action cannot be undone. The record will be removed from the website.",
  label = "Delete",
  iconOnly = true,
  fields,
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  title?: string;
  description?: string;
  label?: string;
  iconOnly?: boolean;
  fields?: Record<string, string>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={
            iconOnly
              ? "inline-flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive"
              : "inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
          }
          aria-label={label}
        >
          <Trash2 className={iconOnly ? "size-4" : "size-3.5"} />
          {!iconOnly && label}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            {fields &&
              Object.entries(fields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
            <AlertDialogAction type="submit">{label}</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
