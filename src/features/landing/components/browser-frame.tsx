import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Kabinet rasmini brauzer oynasi ichida ko'rsatadi.
 *
 * Rasm yolg'iz turganda "bu skrinshotmi yoki chizmami" degan savol
 * tug'iladi. Oyna ramkasi va manzil satri esa bir qarashda javob
 * beradi: bu haqiqiy, ishlab turgan mahsulot.
 */
export function BrowserFrame({
  src,
  alt,
  priority = false,
  className,
  url = "estats.uz",
  width = 1538,
  height = 784,
  sizes = "(max-width: 1024px) 100vw, 1000px",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  url?: string;
  width?: number;
  height?: number;
  sizes?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b bg-muted/40 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
        <span className="ml-2 truncate rounded-md bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
          {url}
        </span>
      </div>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className="h-auto w-full"
      />
    </div>
  );
}
