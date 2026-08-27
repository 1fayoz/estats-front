import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Kabinet rasmini qurilma ramkasi ichida ko'rsatadi.
 *
 * Rasm yolg'iz turganda "bu skrinshotmi yoki chizmami" degan savol
 * tug'iladi. Ramka va manzil satri esa bir qarashda javob beradi:
 * bu haqiqiy, ishlab turgan mahsulot.
 *
 * Telefonda kompyuter skrinshoti ko'rsatilmaydi. U 1538px enlikda
 * olingan va 390px ga siqilganda matn o'qib bo'lmaydi — odam esa
 * "menda ham shunday mayda bo'ladimi" deb o'ylaydi. Shuning uchun
 * `mobileSrc` berilsa, kichik ekranda TELEFON ramkasidagi telefon
 * skrinshoti chiqadi.
 */
export function BrowserFrame({
  src,
  mobileSrc,
  alt,
  priority = false,
  className,
  url = "estats.uz",
  width = 1538,
  height = 784,
  mobileWidth = 620,
  mobileHeight = 1341,
  sizes = "(max-width: 1024px) 100vw, 1000px",
}: {
  src: string;
  /** Telefon uchun alohida skrinshot. Berilmasa kompyuterniki qoladi. */
  mobileSrc?: string;
  alt: string;
  priority?: boolean;
  className?: string;
  url?: string;
  width?: number;
  height?: number;
  mobileWidth?: number;
  mobileHeight?: number;
  sizes?: string;
}) {
  return (
    <>
      {mobileSrc ? (
        <div className={cn("flex justify-center md:hidden", className)}>
          <PhoneFrame
            src={mobileSrc}
            alt={alt}
            priority={priority}
            width={mobileWidth}
            height={mobileHeight}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10",
          mobileSrc && "hidden md:block",
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
          priority={priority && !mobileSrc}
          sizes={sizes}
          className="h-auto w-full"
        />
      </div>
    </>
  );
}

/** Telefon korpusi — skrinshot atrofidagi yupqa ramka va tepadagi kesik. */
function PhoneFrame({
  src,
  alt,
  priority,
  width,
  height,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  width: number;
  height: number;
}) {
  return (
    <div className="relative w-full max-w-[280px] rounded-[2rem] border-[6px] border-foreground/85 bg-foreground/85 shadow-2xl shadow-primary/15">
      <span className="absolute left-1/2 top-1.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-foreground/85" />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="280px"
        className="h-auto w-full rounded-[1.6rem]"
      />
    </div>
  );
}
