"use client";

import * as React from "react";
import {
  AlertTriangle, ChevronLeft, ChevronRight, Loader2, Plus, RefreshCw, RotateCcw, Trash2, Undo2, Wand2, ZoomIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { mediaUrl } from "@/lib/api";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Rasm «studiyasi» — plitkalar va katta ko'rish oynasi.
 *
 * Sotuvchi talabi (2026-09-15): token tejash uchun rasm FAQAT bittalab
 * qayta yasaladi; rasm ustiga bosish uni KATTA ochadi (qayta yasamaydi);
 * qayta yasash «rostdan qayta yasaysizmi?» deb so'raydi va qo'shimcha
 * ko'rsatma qabul qiladi; olib tashlangan rasm yo'qolmaydi — qoraygan va
 * chizilgan holda joyida qoladi, bir bosishda tiklanadi va Uzum'ga
 * ketmaydi.
 */

export type StudioKind = { type: "gallery"; index: number } | { type: "slot"; slot: string };

export interface StudioItem {
  id: string;
  /** `null` — kadr hali yasalmagan (bo'lim o'rni bo'sh). */
  url: string | null;
  /** «Galereya», «Tavsif», «Oʻlchamli setka» … */
  group: string;
  /** Kadr turi: «Muqova», «Infografika», «Oʻlcham» … */
  label: string;
  /** Kadrning vazifasi — rejadan. */
  purpose?: string;
  kind: StudioKind;
  removed: boolean;
  check?: { accepted: boolean; score: number; marketFit: number; problems: string[] } | null;
  canRevert: boolean;
}

export function ImageTile({
  item,
  busy,
  onOpen,
  className,
}: {
  item: StudioItem;
  busy: boolean;
  onOpen: () => void;
  className?: string;
}) {
  const missing = !item.url;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative block aspect-[3/4] w-full overflow-hidden rounded-xl border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        missing
          ? "border-dashed border-[color:var(--air-line)] bg-muted/20 hover:bg-muted/40"
          : "border-[color:var(--air-line)] bg-muted/30 hover:shadow-md",
        className,
      )}
      aria-label={`${item.group} · ${item.label}${item.removed ? " — olib tashlangan" : ""}`}
    >
      {item.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(item.url)}
          alt=""
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition duration-300",
            item.removed ? "brightness-[0.4] grayscale" : "group-hover:scale-[1.03]",
          )}
        />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 text-center text-muted-foreground">
          <span className="flex size-8 items-center justify-center rounded-full border border-dashed">
            <Plus className="size-4" />
          </span>
          <span className="text-[11px] font-medium">Yasash</span>
        </span>
      )}

      {item.removed && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <line x1="96" y1="4" x2="4" y2="96" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
      )}

      <span className="absolute left-1.5 top-1.5 max-w-[calc(100%-0.75rem)] truncate rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {item.label}
      </span>

      {item.removed ? (
        <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-destructive/90 px-1.5 py-0.5 text-center text-[10px] font-medium text-white">
          {"Uzum'ga ketmaydi"}
        </span>
      ) : item.check && item.url ? (
        <span
          className={cn(
            "absolute bottom-1.5 right-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white",
            item.check.accepted ? "bg-emerald-600/85" : "bg-amber-600/90",
          )}
        >
          {item.check.score}/10
        </span>
      ) : null}

      {item.url && !busy && (
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="rounded-full bg-black/55 p-2 text-white">
            <ZoomIn className="size-4" />
          </span>
        </span>
      )}

      {busy && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 text-white">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-[11px] font-medium">Yasalmoqda…</span>
        </span>
      )}
    </button>
  );
}

export function ImageStudio({
  items,
  openId,
  onOpenId,
  busyId,
  working,
  locked,
  priceUsd,
  onRegenerate,
  onToggleRemoved,
  onRevert,
}: {
  items: StudioItem[];
  openId: string | null;
  onOpenId: (id: string | null) => void;
  busyId: string | null;
  /** Qoralamada hozir boshqa rasm yasalmoqda. */
  working: boolean;
  locked: boolean;
  priceUsd: number;
  onRegenerate: (item: StudioItem, prompt: string) => Promise<boolean>;
  onToggleRemoved: (item: StudioItem) => Promise<void>;
  onRevert: (item: StudioItem) => Promise<void>;
}) {
  const index = items.findIndex((item) => item.id === openId);
  const item = index >= 0 ? items[index] : undefined;
  const [prompt, setPrompt] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);
  const [action, setAction] = React.useState<"regen" | "remove" | "revert" | null>(null);

  // Boshqa kadrga o'tilganda ko'rsatma va tasdiq tozalanadi — bir kadr uchun
  // yozilgan ko'rsatma boshqasiga jimgina ketib qolmasin.
  React.useEffect(() => {
    setPrompt("");
    setConfirming(false);
  }, [openId]);

  const step = React.useCallback(
    (delta: number) => {
      if (index < 0 || items.length < 2) return;
      onOpenId(items[(index + delta + items.length) % items.length].id);
    },
    [index, items, onOpenId],
  );

  React.useEffect(() => {
    if (!item) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, step]);

  const run = async (kind: "regen" | "remove" | "revert", job: () => Promise<unknown>) => {
    if (action) return;
    setAction(kind);
    try {
      await job();
    } finally {
      setAction(null);
    }
  };

  const busy = item ? busyId === item.id : false;
  const blocked = working || action !== null;
  const missing = item ? !item.url : false;

  return (
    <Dialog open={item !== undefined} onOpenChange={(open) => !open && onOpenId(null)}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto p-0 sm:rounded-2xl">
        {item && (
          <div className="grid min-w-0 md:grid-cols-[minmax(0,1fr)_340px]">
            <div className="relative flex min-h-[320px] items-center justify-center bg-neutral-950 md:min-h-[560px]">
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(item.url)}
                  alt={`${item.group} · ${item.label}`}
                  className={cn("max-h-[70vh] w-full object-contain md:max-h-[86vh]", item.removed && "brightness-50 grayscale")}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 px-6 text-center text-white/70">
                  <Plus className="size-8" />
                  <p className="text-sm">Bu kadr hali yasalmagan</p>
                </div>
              )}
              {item.removed && item.url && (
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                  <line x1="97" y1="3" x2="3" y2="97" stroke="rgba(255,255,255,0.7)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
              )}
              {busy && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
                  <Loader2 className="size-7 animate-spin" />
                  <p className="text-sm">Yangi variant yasalmoqda…</p>
                </div>
              )}
              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
                    aria-label="Oldingi rasm"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
                    aria-label="Keyingi rasm"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs tabular-nums text-white">
                {index + 1} / {items.length}
              </span>
            </div>

            <div className="flex min-w-0 flex-col gap-4 p-5">
              <div className="pr-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.group}</p>
                <DialogTitle className="mt-1 text-lg font-semibold">{item.label}</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {item.purpose || "Kadr o'z o'rnining vazifasiga mos yasaladi."}
                </DialogDescription>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {!missing && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      item.removed ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                    )}
                  >
                    {item.removed ? "Olib tashlangan — Uzum'ga ketmaydi" : "Uzum'ga ketadi"}
                  </span>
                )}
                {item.check && !missing && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs tabular-nums text-muted-foreground">
                    {`Asliga o'xshashlik ${item.check.score}/10 · bozor ${item.check.marketFit}/10`}
                  </span>
                )}
              </div>

              {item.check && !item.check.accepted && item.check.problems.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
                  <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                    <AlertTriangle className="size-3.5 text-amber-600" /> Tekshiruv izohi
                  </p>
                  <ul className="list-disc space-y-0.5 pl-4">
                    {item.check.problems.slice(0, 4).map((problem) => <li key={problem}>{problem}</li>)}
                  </ul>
                </div>
              )}

              {locked ? (
                <p className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
                  {"Kartochka tasdiqlangan — rasmni o'zgartirish uchun oynadagi «Tahrirlash»ni bosing."}
                </p>
              ) : (
                <>
                  {!missing && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className={cn("min-h-11 flex-1 rounded-xl", !item.removed && "text-destructive hover:text-destructive")}
                        disabled={action !== null || busy}
                        onClick={() => void run("remove", () => onToggleRemoved(item))}
                      >
                        {action === "remove" ? <Loader2 className="animate-spin" /> : item.removed ? <RotateCcw /> : <Trash2 />}
                        {item.removed ? "Tiklash" : "Olib tashlash"}
                      </Button>
                      {item.canRevert && (
                        <Button
                          variant="outline"
                          className="min-h-11 flex-1 rounded-xl"
                          disabled={blocked || busy}
                          onClick={() => void run("revert", () => onRevert(item))}
                        >
                          {action === "revert" ? <Loader2 className="animate-spin" /> : <Undo2 />}
                          Oldingi variant
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="space-y-2.5 rounded-xl border bg-muted/20 p-3.5">
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      <Wand2 className="size-4" /> {missing ? "Kadrni yasash" : "Qayta yasash"}
                    </p>
                    <textarea
                      className="air-input min-h-[84px] w-full resize-y text-sm"
                      value={prompt}
                      maxLength={500}
                      disabled={blocked || busy}
                      placeholder="Qo'shimcha ko'rsatma (ixtiyoriy): «fon issiqroq», «yon tomondan», «qutisi bilan»"
                      onChange={(event) => {
                        setPrompt(event.target.value);
                        setConfirming(false);
                      }}
                    />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Faqat shu kadr yasaladi — «{item.label}» vazifasi, tovar belgilari va raqobatchilar tahlili
                      saqlanadi. Taxminan {formatUsd(priceUsd)}.
                    </p>
                    {working && !busy && (
                      <p className="text-xs air-warn">Boshqa rasm yasalmoqda — tugashini kuting.</p>
                    )}
                    {confirming ? (
                      <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                        <p className="text-sm font-medium">
                          Rostdan ham {missing ? "yasaysizmi" : "qayta yasaysizmi"}?
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {`${missing ? "Yangi kadr" : "Eski variant «Oldingi variant» bilan qaytariladi, yangisi"} shu joyga qo'yiladi. AI sarfi ~${formatUsd(priceUsd)}.`}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            className="min-h-11 flex-1 rounded-xl"
                            disabled={blocked}
                            onClick={() =>
                              void run("regen", async () => {
                                const ok = await onRegenerate(item, prompt.trim());
                                if (ok) {
                                  setConfirming(false);
                                  setPrompt("");
                                }
                              })
                            }
                          >
                            {action === "regen" ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                            Ha, {missing ? "yasash" : "qayta yasash"}
                          </Button>
                          <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => setConfirming(false)}>
                            Bekor qilish
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="min-h-11 w-full rounded-xl"
                        disabled={blocked || busy}
                        onClick={() => setConfirming(true)}
                      >
                        {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                        {busy ? "Yasalmoqda…" : missing ? "Yasash" : "Qayta yasash"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
