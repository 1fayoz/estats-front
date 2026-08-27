import Image from "next/image";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Brend belgisi.
 *
 * Rasm shaffof — orqa fon yorug' va qorong'u mavzuda ham o'ziniki bo'lib
 * qoladi, oq kvadrat bo'lib turmaydi.
 */
export function LogoMark({
  size = 36,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-mark.png"
      alt={siteConfig.name}
      width={size}
      height={size}
      priority={priority}
      className={cn("select-none", className)}
    />
  );
}

/** To'liq logo — nom va shiori bilan. Kirish sahifasi uchun. */
export function LogoLockup({
  size = 180,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt={siteConfig.name}
      width={size}
      height={size}
      priority={priority}
      className={cn("select-none", className)}
    />
  );
}
