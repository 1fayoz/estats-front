"use client";

import { Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { mediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraftRow } from "@/lib/types";

/**
 * Ombor sahifasidagi qoralamalar qatori.
 *
 * Alohida sahifa o'rniga shu qator turadi: quvur fonda ishlaydi
 * va oyna yopilgach natija YO'QOLMASLIGI kerak. Qator faqat
 * qoralama bo'lganda ko'rinadi — bo'sh joyni band qilmasin.
 */
export function DraftStrip({
  rows,
  onOpen,
}: {
  rows: AiDraftRow[];
  onOpen: (id: number) => void;
}) {
  if (!rows.length) return null;

  const running = rows.filter((row) => row.progress < 100 && !row.error).length;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-primary" />
        AI qoralamalari
        <span className="text-xs font-normal text-muted-foreground">
          {running ? `${running} ta tayyorlanmoqda` : `${rows.length} ta`}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onOpen(row.id)}
            className={cn(
              "flex w-64 shrink-0 items-center gap-3 rounded-lg border p-2 text-left transition hover:bg-accent",
              row.error && "border-destructive/40",
            )}
          >
            {row.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl(row.cover)}
                alt=""
                className="h-11 w-11 shrink-0 rounded-md border object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {row.titleUz || "(nomsiz)"}
              </div>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant={
                    row.error ? "destructive" : row.progress === 100 ? "default" : "secondary"
                  }
                  className="font-normal"
                >
                  {row.stageLabel}
                </Badge>
                {row.progress < 100 && !row.error && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
