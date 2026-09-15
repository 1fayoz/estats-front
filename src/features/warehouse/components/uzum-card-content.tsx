"use client";

import * as React from "react";
import { FileText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageLightbox, type LightboxItem } from "@/features/products-ai/components/image-lightbox";
import { mediaUrl } from "@/lib/api";
import { formatDate, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UzumCard } from "@/lib/types";

type Lang = "uz" | "ru";

const BLOCKS: { key: "short" | "description" | "size" | "composition" | "usage"; label: string }[] = [
  { key: "short", label: "Tovar qisqacha tavsifi" },
  { key: "description", label: "Tovar tavsifi" },
  { key: "size", label: "Oʻlchamli setka" },
  { key: "composition", label: "Tarkib" },
  { key: "usage", label: "Foydalanish boʻyicha yoʻriqnoma" },
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Uzum&apos;dagi kartochka
            </CardTitle>
            <CardDescription>
              eStats orqali Uzum&apos;ga yuborilgan va Uzum saqlagan matn va rasmlar
              {card.at ? ` · ${formatDate(card.at)}` : ""}
              {card.sku ? ` · SKU ${card.sku}` : ""}
            </CardDescription>
          </div>
          <div className="inline-flex rounded-lg border p-0.5 text-xs" role="tablist" aria-label="Til">
            {(["uz", "ru"] as Lang[]).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={lang === value}
                onClick={() => setLang(value)}
                className={cn("rounded-md px-3 py-1 font-medium", lang === value ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
              >
                {value === "uz" ? "Oʻzbekcha" : "Ruscha"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {blocks.map((block) => (
          <div key={block.key} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{block.label}</p>
            {block.body && <p className="whitespace-pre-line break-words text-sm leading-relaxed">{block.body}</p>}
            {block.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {block.images.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => setZoom(startOf[block.key] + i)}
                    className="cursor-zoom-in overflow-hidden rounded-lg border"
                    title="Kattalashtirib ko'rish"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(url)} alt={block.label} loading="lazy" className="h-28 w-[84px] object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {facts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Turkum va xususiyatlar</p>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                  <dd className="break-words">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        <ImageLightbox items={lightbox} index={zoom} onIndex={setZoom} />
      </CardContent>
    </Card>
  );
}
