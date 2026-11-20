"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function FiltersPopover({
  children,
  activeCount = 0,
  triggerClassName,
}: {
  children: ReactNode;
  activeCount?: number;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          <SlidersHorizontal className="size-4" />
          Filter
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.62rem] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(92vw,26rem)]">{children}</PopoverContent>
    </Popover>
  );
}
