import { cn, initials } from "@/lib/utils";

export function AdminAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full", className)}>
      <span aria-hidden="true">{initials(name)}</span>
      {avatarUrl && <img src={avatarUrl} alt="" className="absolute inset-0 size-full rounded-full object-cover" />}
    </span>
  );
}
