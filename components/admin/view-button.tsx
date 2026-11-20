import Link from "next/link";
import { Eye } from "lucide-react";

export function ViewButton({ href, name }: { href: string; name: string }) {
  return (
    <Link
      href={href}
      title="View details"
      aria-label={`View details for ${name}`}
      className="inline-flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
    >
      <Eye className="size-4" />
    </Link>
  );
}
