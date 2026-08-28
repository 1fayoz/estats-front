"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DraftDetail } from "@/features/products-ai/components/draft-detail";
import { Uploader } from "@/features/products-ai/components/uploader";
import { ApiError, fetchAiDraft, fetchAiDrafts, mediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraft, AiDraftRow } from "@/lib/types";

/** Quvur ishlayotganda holat shuncha vaqtda bir so'raladi. */
const POLL_MS = 4000;

/**
 * AI bilan mahsulot tayyorlash.
 *
 * Sotuvchi rasm tashlaydi — AI tovarni tanib, bozorni o'rganib,
 * uz va ru matn yozib, xususiyatlarni to'ldirib, rasm yasaydi.
 * Sotuvchi tekshiradi, tuzatadi va tasdiqlaydi.
 */
export default function ProductsAiPage() {
  const [rows, setRows] = React.useState<AiDraftRow[]>([]);
  const [current, setCurrent] = React.useState<AiDraft | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      setRows(await fetchAiDrafts());
    } catch (err) {
      if (err instanceof ApiError && err.status !== 403) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Quvur fonda ishlaydi va sahifa uni so'rab turadi. So'rash
  // FAQAT tugallanmagan qoralama ochiq turganda ketadi — tayyor
  // kartochkani qayta-qayta so'rashning ma'nosi yo'q.
  const running = current !== null && current.progress < 100 && !current.error;
  React.useEffect(() => {
    if (!running || current === null) return;
    const id = window.setInterval(async () => {
      try {
        const fresh = await fetchAiDraft(current.id);
        setCurrent(fresh);
        setRows((prev) =>
          prev.map((r) => (r.id === fresh.id ? { ...r, ...fresh } : r))
        );
      } catch {
        /* keyingi urinishda */
      }
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [running, current?.id]);

  const open = async (id: number) => {
    try {
      setCurrent(await fetchAiDraft(id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ochilmadi.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI bilan mahsulot"
        description="Rasm tashlang — nom, tavsif, xususiyat, MXIK va rasmni AI tayyorlaydi"
      />

      <Card>
        <CardContent className="pt-6">
          <Uploader
            onCreated={(draft) => {
              setCurrent(draft);
              setRows((prev) => [draft, ...prev]);
            }}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ── Ro'yxat ─────────────────────────────────────── */}
        <div className="space-y-2">
          {loading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : rows.length === 0 ? (
            <p className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              Hali qoralama yo&apos;q. Yuqoridan rasm tashlang.
            </p>
          ) : (
            rows.map((row) => (
              <button
                key={row.id}
                onClick={() => void open(row.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-2 text-left transition hover:bg-accent",
                  current?.id === row.id && "border-primary bg-accent"
                )}
              >
                {row.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl(row.cover)}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md border object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {row.titleUz || "(nomsiz)"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={row.error ? "destructive" : row.progress === 100 ? "default" : "secondary"}
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
            ))
          )}
        </div>

        {/* ── Tanlangan qoralama ──────────────────────────── */}
        <div>
          {current === null ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Qoralamani tanlang yoki yangi rasm tashlang.
            </p>
          ) : (
            <>
              {running && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{current.stageLabel}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {current.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${current.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bir necha o&apos;n soniya ketadi. Sahifani yopsangiz ham ishlayveradi.
                  </p>
                </div>
              )}
              <DraftDetail
                draft={current}
                onChange={(fresh) => {
                  setCurrent(fresh);
                  setRows((prev) =>
                    prev.map((r) => (r.id === fresh.id ? { ...r, ...fresh } : r))
                  );
                }}
                onDeleted={() => {
                  setRows((prev) => prev.filter((r) => r.id !== current.id));
                  setCurrent(null);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
