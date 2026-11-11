export function ScrollCue({ href, label = "Scroll" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-3 text-[0.6rem] font-semibold tracking-[0.2em] text-white/45 uppercase transition-colors hover:text-white"
    >
      <span className="grid h-9 w-5 place-items-start justify-center rounded-full border border-white/25 p-1 transition-colors group-hover:border-accent">
        <span className="scroll-dot size-1 rounded-full bg-accent" />
      </span>
      {label}
    </a>
  );
}
