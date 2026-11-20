"use client";

import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LocationMapDialog({ mapUrl, title }: { mapUrl: string; title: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-14 inline-flex min-h-12 items-center gap-2.5 bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <MapPin className="size-4 text-accent" />
          View location on Google Maps
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[92svh] max-w-5xl gap-5 overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Explore the studio location on the map.</DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden border border-border/80 bg-muted">
          <iframe
            src={mapUrl}
            title={title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-[55svh] min-h-[320px] w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
