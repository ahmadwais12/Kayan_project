export const MAX_SOCIAL_LINKS = 20;

export const SOCIAL_PLATFORMS = [
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "X", label: "X / Twitter" },
  { value: "YouTube", label: "YouTube" },
  { value: "TikTok", label: "TikTok" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Telegram", label: "Telegram" },
  { value: "Snapchat", label: "Snapchat" },
  { value: "Pinterest", label: "Pinterest" },
  { value: "Threads", label: "Threads" },
  { value: "GitHub", label: "GitHub" },
  { value: "Behance", label: "Behance" },
  { value: "Dribbble", label: "Dribbble" },
  { value: "Vimeo", label: "Vimeo" },
  { value: "Reddit", label: "Reddit" },
  { value: "Spotify", label: "Spotify" },
  { value: "Discord", label: "Discord" },
  { value: "Email", label: "Email" },
  { value: "Website", label: "Website / App" },
] as const;

export const SOCIAL_PLATFORM_VALUES = SOCIAL_PLATFORMS.map((item) => item.value);

export function socialPlatformLabel(value: string) {
  return SOCIAL_PLATFORMS.find((item) => item.value.toLowerCase() === value.toLowerCase())?.label || value;
}
