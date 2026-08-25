import type { SocialPlatform } from "@/lib/types";

/**
 * Tarmoqlarning ko'rinishi bir joyda.
 *
 * Ilgari har sahifa o'z ro'yxatini tutardi va ular bir-biridan chetga
 * chiqib ketardi — bir joyda "TikTok", boshqasida zanjir belgisi.
 */
export const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

/** Tarmoq foni — kartani bir qarashda ajratish uchun (brend ranglaridan). */
export const PLATFORM_TINT: Record<string, string> = {
  instagram: "from-fuchsia-500/15 via-orange-400/10 to-purple-500/10",
  telegram: "from-sky-500/15 to-cyan-400/10",
  tiktok: "from-rose-500/10 via-neutral-500/10 to-cyan-400/10",
  linkedin: "from-blue-600/15 to-indigo-400/10",
};

export const PLATFORM_ORDER: SocialPlatform[] = [
  "instagram",
  "telegram",
  "tiktok",
  "linkedin",
];
