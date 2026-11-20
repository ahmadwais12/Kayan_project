"use client";

import { FileSpreadsheet, FileText, Sheet, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FORMATS = [
  { format: "pdf", label: "Download PDF", detail: "PDF", Icon: FileText },
  { format: "csv", label: "Download CSV", detail: "CSV", Icon: Sheet },
  { format: "xlsx", label: "Download Excel", detail: "XLSX", Icon: FileSpreadsheet },
] as const;

export function ExportMenu({ href, className }: { href: string; className?: string }) {
  const joiner = href.includes("?") ? "&" : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className} aria-label="Download exports" title="Download exports">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Download</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {FORMATS.map(({ format, label, detail, Icon }) => (
          <DropdownMenuItem key={format} asChild>
            <a href={`${href}${joiner}format=${format}`} download className="w-full">
              <Icon className="size-4 text-muted-foreground" />
              <span>{label}</span>
              <span className="ml-auto text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {detail}
              </span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
