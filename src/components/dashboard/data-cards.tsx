import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Jadvallarning telefondagi ko'rinishi.
 *
 * Telefonda gorizontal siljitiladigan jadval — eng yomon yechim: odam
 * ustunni ko'rish uchun har safar chapga-o'ngga surishi kerak va
 * qatorni ko'zdan qochiradi. Shuning uchun `md` dan pastda har qator
 * KARTOCHKAGA aylanadi: tepada nima haqidaligi, pastda ko'rsatkichlar
 * ikki ustunli to'rda.
 *
 * Ustunlar soni ataylab ikkitada qoldirilgan: uchtasi 360px enlikda
 * raqamlarni sindiradi.
 */
export function CardList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-2.5 md:hidden", className)}>{children}</div>;
}

/** Jadvalning o'zi — faqat kengroq ekranda. */
export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("hidden overflow-x-auto rounded-xl border md:block", className)}>
      {children}
    </div>
  );
}

export function DataCard({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border bg-card p-3.5 text-left",
        onClick && "transition-colors active:bg-muted/50",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** Kartochka boshi: rasm, nom va ostidagi izoh. */
export function CardHead({
  image,
  title,
  note,
  right,
}: {
  image?: string | null;
  title: ReactNode;
  note?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {image !== undefined ? (
        image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-11 w-11 shrink-0 rounded-md border object-cover"
          />
        ) : (
          <div className="h-11 w-11 shrink-0 rounded-md border bg-muted" />
        )
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-sm font-medium">{title}</div>
        {note ? <div className="mt-0.5 text-xs text-muted-foreground">{note}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/** Ko'rsatkichlar to'ri — label ustida, qiymat ostida. */
export function CardStats({
  items,
  className,
}: {
  items: { label: string; value: ReactNode; tone?: "bad" | "good" | "muted" }[];
  className?: string;
}) {
  const shown = items.filter((item) => item.value !== null && item.value !== undefined);
  if (!shown.length) return null;
  return (
    <dl className={cn("mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5", className)}>
      {shown.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd
            className={cn(
              "truncate text-sm font-medium tabular-nums",
              item.tone === "bad" && "text-destructive",
              item.tone === "good" && "text-success",
              item.tone === "muted" && "font-normal text-muted-foreground"
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Telefondagi saralash tugmalari.
 *
 * Jadvalda saralash sarlavhani bosish bilan bo'ladi, kartochkada esa
 * sarlavha yo'q — shuning uchun alohida qator kerak. Gorizontal
 * siljiydi: to'rt-beshta ustun nomi 360px ga sig'maydi.
 */
export function CardSort<T extends string>({
  options,
  active,
  onPick,
  className,
}: {
  options: { key: T; label: string }[];
  active: T;
  onPick: (key: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:hidden", className)}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onPick(option.key)}
          aria-pressed={option.key === active}
          className={cn(
            "shrink-0 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
            option.key === active
              ? "border-transparent bg-foreground text-background"
              : "bg-card text-muted-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
