import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SmartImage } from "@/components/public/smart-image";

export type TeamCardData = {
  name: string;
  slug: string;
  jobTitle: string;
  imageUrl: string | null;
  department: { name: string } | null;
};

export function SmartTeamCard({ member }: { member: TeamCardData }) {
  return (
    <div className="h-full">
      <Link
        href={`/team/${member.slug}`}
        className="group relative flex h-full flex-col border border-border/70 bg-card transition-colors duration-300 hover:border-accent/50"
      >
        <div className="relative m-3 aspect-[4/5] overflow-hidden bg-secondary">
          <SmartImage
            src={member.imageUrl}
            alt={member.name}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <span className="absolute end-3 top-3 grid size-8 place-items-center bg-background/90 text-primary opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowUpRight className="size-3.5 rtl:rotate-90" />
          </span>
        </div>
        <div className="px-4 pb-4">
          {member.department && (
            <p className="text-[0.6rem] font-semibold tracking-[0.14em] text-accent uppercase">{member.department.name}</p>
          )}
          <h3 className="mt-1 font-display text-lg leading-tight text-primary transition-colors group-hover:text-accent">
            {member.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{member.jobTitle}</p>
        </div>
      </Link>
    </div>
  );
}
