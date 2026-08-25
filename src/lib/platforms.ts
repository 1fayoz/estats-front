import { Briefcase, Camera, Music2, Send, type LucideIcon } from "lucide-react";

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

export const PLATFORM_ICON: Record<string, LucideIcon> = {
  instagram: Camera,
  telegram: Send,
  tiktok: Music2,
  linkedin: Briefcase,
};

/** Tarmoq rangi — kartani bir qarashda ajratish uchun. */
export const PLATFORM_TINT: Record<string, string> = {
  instagram: "from-fuchsia-500/15 to-orange-400/10 text-fuchsia-600 dark:text-fuchsia-400",
  telegram: "from-sky-500/15 to-cyan-400/10 text-sky-600 dark:text-sky-400",
  tiktok: "from-neutral-500/15 to-teal-400/10 text-neutral-700 dark:text-neutral-300",
  linkedin: "from-blue-600/15 to-indigo-400/10 text-blue-600 dark:text-blue-400",
};

export const PLATFORM_ORDER: SocialPlatform[] = [
  "instagram",
  "telegram",
  "tiktok",
  "linkedin",
];
