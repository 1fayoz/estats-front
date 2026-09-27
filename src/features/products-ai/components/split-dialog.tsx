"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Loader2, RotateCw, Scissors } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError, fetchAiSplitPlan, retryAiSplitPublish, splitAiVariants, type AiSplitPlan } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

/** Uzum 99 tadan ortiq SKU'li tovarda xususiyatlarni saqlamaydi (backend `VR.MAX_SKUS`). */
export const MAX_SKUS = 99;

export const tooManySkus = (draft: AiDraft | null | undefined) =>
  (draft?.variants?.skuCount ?? 0) > MAX_SKUS;

/**
 * «Kartochkani bo'lamizmi? Ha / Yo'q».
 *
 * Sotuvchi talabi (2026-09-27): 100+ SKU'da ogohlantirish emas, savol
 * chiqsin; «Ha» bosilsa tizim o'zi bo'ladi. Reja backenddan
 * (`/variants/split-plan`): eng ko'p qiymatli o'q (odatda Model) avlod
 * chegarasida bo'linadi, Uzum'dagi tovarning modellari ko'p bo'lgan bo'lak
 * shu kartochkada qoladi, qolganlari — yangi qoralamalar.
 */
export function SplitDialog({
  draft,
  open,
  onOpenChange,
  onDone,
}: {
  draft: AiDraft;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: (draft: AiDraft) => void;
}) {
  const [plan, setPlan] = React.useState<AiSplitPlan | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    setPlan(null);
    setLoading(true);
    fetchAiSplitPlan(draft.id)
      .then((next) => alive && setPlan(next))
      .catch((err) => alive && toast.error(err instanceof ApiError ? err.message : "Rejani olib bo'lmadi"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open, draft.id]);

  async function split() {
    setBusy(true);
    try {
      const res = await splitAiVariants(draft.id);
      onDone(res.draft);
      onOpenChange(false);
      const others = res.created.map((c) => `#${c.id} (${c.label})`).join(", ");
      toast.success(
        `Bo'lindi: shu kartochkada «${res.kept.label}» (${res.kept.skus} SKU), yangi qoralama: ${others}. `
          + "Endi hammasi o'zi: matn har biriga moslab yoziladi, Uzum'dagi tovar yangilanadi, yangisi joylanadi.",
        { duration: 12000 },
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bo'lib bo'lmadi");
    } finally {
      setBusy(false);
    }
  }

  const chunks = plan?.chunks ?? [];
  const total = plan?.total ?? draft.variants?.skuCount ?? 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="size-4" />
            {`Kartochkani ${chunks.length > 1 ? chunks.length : "ikki"}ga bo'lamizmi?`}
          </DialogTitle>
          <DialogDescription>
            {`${total} ta SKU — Uzum ${MAX_SKUS} tadan ortiq SKU'li tovarda xususiyatlarni saqlamaydi. `}
            {"Tizim variantlarni bo'laklarga ajratadi: rasmlar, turkum va narx umumiy qoladi, "}
            {"matn esa har kartochkaning o'z variantlariga moslab qayta yoziladi."}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Reja tuzilmoqda…
          </p>
        )}

        {!loading && plan && !plan.needed && (
          <p className="text-sm text-destructive">
            Avtomatik bo&apos;lib bo&apos;lmaydi — boshqa o&apos;qlarning o&apos;zi chegaradan katta.
            «Variantlar»da qiymatlar sonini kamaytiring.
          </p>
        )}

        {!loading && chunks.length > 0 && (
          <ul className="space-y-2">
            {chunks.map((chunk, index) => (
              <li key={chunk.label}
                className={cn("rounded-lg border px-3 py-2 text-sm",
                  index === plan?.keep ? "border-primary/40 bg-primary/5" : "")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{chunk.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{`${chunk.skus} SKU`}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {index === plan?.keep ? "shu kartochkada qoladi" : "yangi qoralama bo'ladi"}
                  {plan?.title ? ` · ${plan.title}: ${chunk.names.length} ta` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            Yo&apos;q
          </Button>
          <Button type="button" disabled={busy || loading || !plan?.needed} onClick={() => void split()}>
            {busy ? <Loader2 className="animate-spin" /> : <Scissors />}
            Ha, bo&apos;l
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const SPLIT_STEPS = [
  { key: "texts", label: "Matn" },
  { key: "publishing", label: "Uzum" },
  { key: "done", label: "Tayyor" },
] as const;

/**
 * Bo'lingan kartochkaning Uzum'ga o'zi borish holati — oynaning tepasida.
 * Navbatda → matn shu variantlarga moslab yozilmoqda → Uzum'ga joylanmoqda
 * (yoki Uzum'dagisi yangilanmoqda) → tayyor. Uzum bosqichining o'zi pastdagi
 * joylash chizig'ida (`PublishProgress`) batafsil ko'rinadi.
 */
export function SplitProgress({ draft, onChange }: { draft: AiDraft; onChange: (draft: AiDraft) => void }) {
  const auto = draft.split?.auto;
  const [busy, setBusy] = React.useState(false);
  if (!auto) return null;
  const order = auto.status === "waiting" ? -1 : SPLIT_STEPS.findIndex((s) => s.key === auto.status);
  const failed = auto.status === "error";
  const running = !failed && auto.status !== "done";
  const other = draft.split?.from ?? draft.split?.into?.[0];

  async function retry() {
    setBusy(true);
    try {
      onChange(await retryAiSplitPublish(draft.id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Qayta urinib bo'lmadi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("mt-2 rounded-lg border px-3 py-2 text-xs",
      failed ? "border-destructive/40 bg-destructive/5" : "border-primary/30 bg-primary/5")}>
      <div className="flex flex-wrap items-center gap-2">
        {running ? <Loader2 className="size-3.5 animate-spin" />
          : failed ? <AlertTriangle className="size-3.5 text-destructive" />
            : <CheckCircle2 className="size-3.5 text-emerald-600" />}
        <span className="font-medium">{`Bo'lingan kartochka · ${auto.step || ""}`}</span>
        {typeof auto.percent === "number" && running && <span className="text-muted-foreground">{`${auto.percent}%`}</span>}
        <span className="ml-auto flex items-center gap-1">
          {SPLIT_STEPS.map((step, index) => (
            <span key={step.key}
              className={cn("rounded px-1.5 py-0.5",
                index < order || auto.status === "done" ? "bg-emerald-600/15 text-emerald-700"
                  : index === order ? (failed ? "bg-destructive/15 text-destructive" : "bg-primary/15")
                    : "bg-muted text-muted-foreground")}>
              {step.label}
            </span>
          ))}
        </span>
      </div>
      {other && (
        <p className="mt-1 text-muted-foreground">
          {`${draft.split?.from ? "Bo'lingan" : "Ikkinchi qism"}: qoralama #${other.draftId} — ${other.label}`}
        </p>
      )}
      {failed && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-destructive">{auto.error}</span>
          <Button type="button" size="sm" variant="outline" className="h-6 rounded-md px-2 text-xs"
            disabled={busy} onClick={() => void retry()}>
            {busy ? <Loader2 className="size-3 animate-spin" /> : <RotateCw className="size-3" />}
            Qayta urinish
          </Button>
        </div>
      )}
    </div>
  );
}
