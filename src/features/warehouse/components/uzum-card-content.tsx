"use client";

import * as React from "react";
import {
  BookOpenText,
  CalendarDays,
  FileText,
  Hash,
  Languages,
  ListChecks,
  MessageSquareText,
  PackageSearch,
  Ruler,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageLightbox, type LightboxItem } from "@/features/products-ai/components/image-lightbox";
import { mediaUrl } from "@/lib/api";
import { formatDate, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UzumCard } from "@/lib/types";

type Lang = "uz" | "ru";

const BLOCKS: {
  key: "short" | "description" | "size" | "composition" | "usage";
  label: string;
  Icon: LucideIcon;
}[] = [
  { key: "short", label: "Qisqacha tavsif", Icon: MessageSquareText },
  { key: "description", label: "To‘liq tavsif", Icon: BookOpenText },
  { key: "size", label: "O‘lchamlar", Icon: Ruler },
  { key: "composition", label: "Tarkib", Icon: PackageSearch },
  { key: "usage", label: "Foydalanish yo‘riqnomasi", Icon: ListChecks },
];

/**
 * Uzum'dagi kartochka — eStats orqali OXIRGI marta yuborilgan holat.
 *
 * Sotuvchi talabi (2026-09-15): «to'ldirilgan hamma narsa Uzumda qanday
 * ko'rinsa bu yerda ham ko'rinishi kerak, o'lcham va boshqalar bazada
 * saqlanishi kerak». Manba — `uzum_publish.publishedCard` (Uzum saqlashni
 * tasdiqlagan paytdagi nusxa), qoralamaning keyingi tahrirlari emas.
 */
export function UzumCardContent({ card }: { card: UzumCard }) {
  const [lang, setLang] = React.useState<Lang>("uz");
  const [zoom, setZoom] = React.useState<number | null>(null);

  const text = (key: (typeof BLOCKS)[number]["key"]): string => {
    const field = `${key}${lang === "uz" ? "Uz" : "Ru"}` as keyof UzumCard;
    return String(card[field] ?? "").trim();
  };
  const imagesOf = (key: (typeof BLOCKS)[number]["key"]): string[] => {
    if (key === "description") return card.descriptionImages ?? [];
    if (key === "short") return [];
    return card.sectionImages?.[key] ?? [];
  };

  const blocks = BLOCKS.map((block) => ({ ...block, body: text(block.key), images: imagesOf(block.key) }))
    .filter((block) => block.body || block.images.length);

  // Hamma rasm bitta ro'yxatda — kattalashtirilganda ‹ › bilan yuriladi.
  const lightbox: LightboxItem[] = [];
  const startOf: Record<string, number> = {};
  for (const block of blocks) {
    startOf[block.key] = lightbox.length;
    block.images.forEach((url, i) =>
      lightbox.push({ url, caption: block.images.length > 1 ? `${block.label} · ${i + 1}/${block.images.length}` : block.label }),
    );
  }

  const facts: { label: string; value: string }[] = [
    { label: "Turkum", value: (card.categoryPath ?? []).join(" → ") },
    { label: "MXIK", value: [card.mxik, card.mxikName].filter(Boolean).join(" · ") },
    { label: "Narx", value: card.price ? formatSum(card.price) : "" },
    ...Object.entries(card.attributes ?? {}).map(([label, value]) => ({ label, value })),
  ].filter((fact) => fact.value);

  if (!blocks.length && !facts.length) return null;

  return (
    <Card className="overflow-hidden border-primary/15 bg-card shadow-sm">
      <CardHeader className="gap-4 border-b bg-muted/25 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Uzum&apos;dagi kartochka</CardTitle>
              <CardDescription className="mt-1.5 leading-relaxed">
                Uzum saqlagan oxirgi matn, rasm va xususiyatlar
              </CardDescription>
              {(card.at || card.sku) && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {card.at && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1">
                      <CalendarDays className="size-3.5" aria-hidden="true" /> {formatDate(card.at)}
                    </span>
                  )}
                  {card.sku && (
                    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border bg-card px-2.5 py-1">
                      <Hash className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="break-all">SKU {card.sku}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="inline-flex items-center rounded-xl border bg-card p-1 text-sm" role="tablist" aria-label="Kartochka tili">
            <Languages className="mx-2 size-4 text-muted-foreground" aria-hidden="true" />
            {(["uz", "ru"] as Lang[]).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={lang === value}
                onClick={() => setLang(value)}
                className={cn(
                  "min-h-8 rounded-lg px-3 font-medium transition-colors",
                  lang === value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {value === "uz" ? "O‘zbekcha" : "Ruscha"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className={cn("grid min-w-0 gap-4", blocks.length > 0 && facts.length > 0 && "xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,.75fr)]")}>
          {blocks.length > 0 && (
            <div className="min-w-0 space-y-3">
              {blocks.map((block) => (
                <section
                  key={block.key}
                  className={cn(
                    "min-w-0 rounded-xl border bg-muted/15 p-4",
                    block.key === "short" && "border-primary/20 bg-primary/[.045]",
                  )}
                >
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-sm ring-1 ring-border">
                      <block.Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    {block.label}
                  </h3>
                  {block.body && (
                    <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-foreground/90">
                      {block.body}
                    </p>
                  )}
                  {block.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                      {block.images.map((url, i) => (
                        <button
                          key={`${url}-${i}`}
                          type="button"
                          onClick={() => setZoom(startOf[block.key] + i)}
                          className="group aspect-[3/4] cursor-zoom-in overflow-hidden rounded-xl border bg-muted outline-none transition hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
                          title="Kattalashtirib ko‘rish"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mediaUrl(url)}
                            alt={`${block.label}, ${i + 1}-rasm`}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}

          {facts.length > 0 && (
            <aside className="min-w-0 self-start rounded-xl border bg-muted/25 p-4" aria-label="Turkum va xususiyatlar">
              <div className="flex items-center gap-2 border-b pb-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PackageSearch className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Turkum va xususiyatlar</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Uzum katalogidagi ma’lumotlar</p>
                </div>
              </div>
              <dl className="divide-y divide-border">
                {facts.map((fact) => (
                  <div key={fact.label} className="min-w-0 py-3 first:pt-4 last:pb-0">
                    <dt className="text-xs font-medium text-muted-foreground">{fact.label}</dt>
                    <dd className={cn("mt-1 break-words text-sm leading-relaxed", fact.label === "Narx" && "text-base font-semibold text-primary")}>
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
        <ImageLightbox items={lightbox} index={zoom} onIndex={setZoom} />
      </CardContent>
    </Card>
  );
}
