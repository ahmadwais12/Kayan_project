import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { platform: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SocialIcon({ platform, className = "size-4", ...props }: IconProps) {
  const name = platform.toLowerCase();

  if (name.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
        <rect x="3" y="3" width="18" height="18" rx="5" {...stroke} />
        <circle cx="12" cy="12" r="4" {...stroke} />
        <circle cx="17.2" cy="6.9" r="1.15" fill="currentColor" />
      </svg>
    );
  }

  if (name.includes("facebook")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5h1.65V4.6c-.3-.04-1.2-.12-2.25-.12-2.23 0-3.75 1.36-3.75 3.86v2.55H8v3.1h2.7v8h2.8z" />
      </svg>
    );
  }

  if (name.includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.2 8.65 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21H9z" />
      </svg>
    );
  }

  if (name.includes("youtube") || name.includes("youtu.be")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M21.6 7.2a2.5 2.5 0 00-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 001.76-1.77A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15.2V8.8L15.5 12 10 15.2z" />
      </svg>
    );
  }

  if (name.includes("whatsapp") || name.includes("wa.me")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm4.7 12.6c-.2.6-1.2 1.1-1.7 1.1-.4 0-1 .1-3-1.1s-3.2-3.6-3.3-3.8c-.1-.2-.8-1.4-.8-2.4 0-1 .5-1.5.7-1.7.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1.9 2 1.2 2.3 1.3.2.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.7-.1 1.3z" />
      </svg>
    );
  }

  if (name.includes("tiktok")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M16.5 3c.3 2 1.5 3.6 3.5 4v3c-1.3 0-2.6-.4-3.7-1.1v6.6a5.9 5.9 0 11-5.9-5.9c.3 0 .6 0 .9.1v3.1a2.8 2.8 0 102 2.7V3h3.2z" />
      </svg>
    );
  }

  if (name.includes("pinterest")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M12 2a10 10 0 00-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5.1s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6 1 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.8-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-4.9 0-2.6-1.8-4.4-4.5-4.4-3 0-4.8 2.3-4.8 4.6 0 .9.4 1.9.8 2.4.1.1.1.2.1.3l-.3 1.2c0 .2-.1.2-.3.1-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.2 6.5-5.4 6.5-1 0-2-.6-2.4-1.2l-.6 2.5c-.2.9-.8 2-1.2 2.7A10 10 0 1012 2z" />
      </svg>
    );
  }

  if (name.includes("twitter") || name === "x" || name.includes("x.com")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-5.9l-4.62-6.04L5.94 21H2.9l7.06-8.07L2.25 3h6.05l4.18 5.52L17.53 3zm-1.06 16.2h1.67L7.6 4.7H5.8l10.67 14.5z" />
      </svg>
    );
  }

  if (name.includes("github")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0023.5 12C23.5 5.73 18.27.5 12 .5z" />
      </svg>
    );
  }

  if (name.includes("telegram")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M21.9 4.3l-3 14.2c-.2 1-.8 1.2-1.7.8l-4.6-3.4-2.2 2.1c-.2.2-.5.4-.9.4l.3-4.6 8.5-7.7c.4-.3-.1-.5-.6-.2L7.2 12.9 2.7 11.5c-1-.3-1-1 .2-1.5L20.6 3c.8-.3 1.5.2 1.3 1.3z" />
      </svg>
    );
  }

  if (name.includes("snapchat") || name.includes("snap")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M12 2.5c2.9 0 5.1 2.1 5.1 4.9 0 .8.1 1.5.1 2.1.3.2.8.3 1.2.1.4-.1.8.2.8.6 0 .4-.2.7-.6.8-.6.2-1.1.3-1.3.8-.2.5.6 1.6 2.3 2.9.8.6.5 1.5-.4 1.6-.6.1-1.3.1-1.8.3-.2.4-.3.9-.6 1.1-.4.3-1.2.1-2 .1-.7 0-1.3.5-1.7 1-.4.4-.8.6-1.2.6-.4 0-.8-.2-1.2-.6-.4-.5-1-1-1.7-1-.8 0-1.6.2-2-.1-.3-.2-.4-.7-.6-1.1-.5-.2-1.2-.2-1.8-.3-.9-.1-1.2-1-.4-1.6 1.7-1.3 2.5-2.4 2.3-2.9-.2-.5-.7-.6-1.3-.8-.4-.1-.6-.4-.6-.8 0-.4.4-.7.8-.6.4.2.9.1 1.2-.1 0-.6.1-1.3.1-2.1 0-2.8 2.2-4.9 5.1-4.9z" />
      </svg>
    );
  }

  if (name.includes("behance")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M2 7.5h6.3c2.1 0 3.4 1 3.4 2.7 0 1.1-.5 1.9-1.4 2.4 1.2.4 1.9 1.4 1.9 2.8 0 2-1.6 3.1-3.8 3.1H2V7.5zm3 2.3v2.2h2.8c.9 0 1.5-.4 1.5-1.1 0-.7-.6-1.1-1.5-1.1H5zm0 4.1v2.3h3.1c1 0 1.6-.4 1.6-1.2 0-.7-.6-1.1-1.6-1.1H5zM15.2 10.4c2.3 0 3.8 1.7 3.8 4v.6h-5.5c.1 1.1.7 1.8 1.8 1.8.7 0 1.3-.3 1.6-.8h1.9c-.4 1.6-1.7 2.6-3.5 2.6-2.3 0-3.9-1.7-3.9-4.1s1.5-4.1 3.8-4.1zm-1.7 3.2h3.4c-.1-1-.7-1.6-1.7-1.6s-1.6.6-1.7 1.6zM22 10.4h-5.5v1.1H22v-1.1z" />
      </svg>
    );
  }

  if (name.includes("dribbble")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
        <circle cx="12" cy="12" r="9.2" {...stroke} />
        <path d="M5.4 6.9c2 2.4 6 5.4 11.2 6.1M7.8 20.2c1.2-3.1 3.7-6.9 7.6-9.2M3.4 13.8c4.1-1.5 9.7-1.7 14.8.2" {...stroke} />
      </svg>
    );
  }

  if (name.includes("vimeo")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M22 7.5c-.1 2-1.5 4.7-4.3 8.1-2.9 3.6-5.3 5.4-7.3 5.4-1.2 0-2.3-1.1-3.1-3.4L5.6 11c-.6-2.3-1.3-3.4-2.1-3.4-.2 0-.9.4-2.1 1.2L.2 7.5c1.3-1.2 2.6-2.4 3.9-3.6 1.8-1.5 3.1-2.3 4-2.4 2.1-.2 3.4 1.2 3.9 4.3.5 3.3.9 5.4 1.2 6.2.6 1.7 1.1 2.5 1.7 2.5.5 0 1.2-.8 2.2-2.3 1-1.6 1.5-2.8 1.5-3.6.1-1.3-.4-1.9-1.5-1.9-.5 0-1 .1-1.6.4 1.1-3.5 3.1-5.2 6.1-5.1 2.2.1 3.3 1.5 3.2 4.3z" />
      </svg>
    );
  }

  if (name.includes("reddit")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M22 12.2c0-1.2-1-2.2-2.2-2.2-.6 0-1.1.2-1.5.6-1.4-1-3.3-1.6-5.4-1.7l1.1-3.5 2.9.7c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5S18.2 4.6 17.4 4.6c-.7 0-1.3.5-1.5 1.1l-3.6-.8c-.2 0-.4.1-.4.3l-1.3 4c-2.1.1-4 .7-5.4 1.7-.4-.4-.9-.6-1.5-.6C2.5 10.3 1.5 11.3 1.5 12.2c0 .8.4 1.5 1 1.9-.1.3-.1.6-.1.9 0 3 3.4 5.4 7.6 5.4s7.6-2.4 7.6-5.4c0-.3 0-.6-.1-.9.6-.4 1-1.1 1-1.9zM7.3 13.9c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4zm7.6 3.4c-.9.9-2.4 1.4-3.9 1.4s-3-.5-3.9-1.4c-.2-.2-.2-.4 0-.6.2-.2.4-.2.6 0 .7.7 1.9 1.1 3.3 1.1s2.6-.4 3.3-1.1c.2-.2.4-.2.6 0 .2.2.2.4 0 .6zm-.6-2c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4z" />
      </svg>
    );
  }

  if (name.includes("spotify")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.4 14.4c-.2.3-.5.4-.8.2-2.2-1.3-4.9-1.6-8.1-.9-.3.1-.7-.1-.8-.5-.1-.3.1-.7.5-.8 3.5-.8 6.5-.4 8.9 1.1.3.2.4.6.3.9zm1.2-2.8c-.2.3-.6.4-1 .3-2.5-1.5-6.2-1.9-9.1-1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.3-1 7.5-.6 10.3 1.2.4.2.5.6.2.9zm.1-2.9C14.8 8.9 9.7 8.7 6.9 9.6c-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 3.2-1 8.8-.8 12.2 1.3.4.2.6.7.3 1.1-.2.4-.7.5-1.1.3z" />
      </svg>
    );
  }

  if (name.includes("discord")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M20.3 4.4A19 19 0 0016 3l-.2.4c1.5.4 2.2.9 2.2.9a15 15 0 00-10 0s.7-.5 2.2-.9L10 3a19 19 0 00-4.3 1.4C3.7 8.2 3.1 12 3.3 15.7A19 19 0 009 18l.7-1.1c-1.2-.4-2.3-1-3.2-1.8l.8.5a13.6 13.6 0 0013.4 0l.8-.5c-.9.8-2 1.4-3.2 1.8L18 18a19 19 0 005.7-2.3c.3-4.5-.6-8.3-3.4-11.3zM9.5 14.1c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8zm5 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8z" />
      </svg>
    );
  }

  if (name.includes("apple")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M16.4 12.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2.9-1.3 1.2-2.5 1.2-2.6-.1 0-2.3-.9-2.3-3.4zM14.3 6.2c.6-.7 1-1.8.9-2.8-.9 0-1.9.6-2.5 1.3-.5.6-1 1.7-.9 2.7 1 .1 2-.5 2.5-1.2z" />
      </svg>
    );
  }

  if (name.includes("google")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
        <path d="M21.8 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.5c-.2 1.3-.9 2.4-2 3.1v2.6h3.2c1.9-1.7 3.1-4.3 3.1-7.5z" />
        <path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.6c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H3v2.7A10 10 0 0012 22z" opacity=".7" />
        <path d="M6.2 13.7A6 6 0 016 12c0-.6.1-1.2.3-1.7V7.6H3A10 10 0 002 12c0 1.6.4 3.1 1 4.4l3.2-2.7z" opacity=".55" />
        <path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 003 7.6l3.2 2.7C7 7.8 9.3 6 12 6z" opacity=".85" />
      </svg>
    );
  }

  if (name.includes("mail") || name.includes("email")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
        <path d="M3.5 6.5L12 13l8.5-6.5" {...stroke} />
      </svg>
    );
  }

  if (name.includes("phone") || name.includes("call") || name.includes("whatsapp")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
        <path d="M5 3.5h3l1.5 4-2 1.5a12 12 0 006.5 6.5l1.5-2 4 1.5v3a2 2 0 01-2.2 2A17.5 17.5 0 013 5.7 2 2 0 015 3.5z" {...stroke} />
      </svg>
    );
  }

  if (name.includes("web") || name.includes("site") || name.includes("link") || name.includes("portfolio")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
        <circle cx="12" cy="12" r="9" {...stroke} />
        <path d="M3.5 9h17M3.5 15h17M12 3a15 15 0 010 18M12 3a15 15 0 000 18" {...stroke} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
      <path d="M14 4h6v6" {...stroke} />
      <path d="M20 4l-9 9" {...stroke} />
      <path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" {...stroke} />
    </svg>
  );
}
