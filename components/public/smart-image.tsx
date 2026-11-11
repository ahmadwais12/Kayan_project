import Image from "next/image";
import { cn } from "@/lib/utils";

export function SmartImage({
  src,
  alt,
  fill = true,
  sizes = "100vw",
  priority = false,
  className,
  width = 1200,
  height = 800,
}: {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
}) {
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "block bg-[linear-gradient(135deg,#e7e3da_0%,#d8d2c4_100%)]",
          fill ? "absolute inset-0" : "h-full w-full",
          className,
        )}
      />
    );
  }

  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
        {...(fill ? {} : { width, height })}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={cn(fill ? "absolute inset-0 h-full w-full object-cover" : "h-full w-full object-cover", className)}
    />
  );
}
