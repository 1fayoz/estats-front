"use client";

import * as React from "react";
import { AlertTriangle, Check, ImagePlus, Images, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError, mediaUrl, regenerateAiDraft, saveAiSources, uploadAiSources } from "@/lib/api";
import { formatUsd } from "@/lib/format";
import type { AiDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Asl suratlar — AI kartochka yasashda NAMUNA bo'ladigan sotuvchi suratlari.
 *
 * Prodda #20 (2026-09-26): asl suratlar o'rnida Uzum'dagi AI rasmlarimiz turardi —
 * AI o'z rasmidan nusxa ko'chirib, sifat pasaygan va tekshiruv kadrlarni rad
 * etgan. Endi sotuvchi asl suratlarni o'zi tanlaydi, yangisini yuklaydi va
 * «Rasmlar bilan to'liq qayta yaratish» bilan butun jarayonni qaytadan yurgizadi.
 */
export function SourcesPanel({
  draft,
  onChange,
  working,
}: {
  draft: AiDraft;
  onChange: (draft: AiDraft) => void;
  working: boolean;
}) {
  const candidates = React.useMemo(() => draft.sourceCandidates ?? [], [draft.sourceCandidates]);
  const initial = React.useMemo(
    () => candidates.filter((c) => c.selected && !c.generated).map((c) => c.url),
    [candidates],
  );
  const [chosen, setChosen] = React.useState<string[]>(initial);
  const [busy, setBusy] = React.useState<"save" | "upload" | "rebuild" | null>(null);
  const [confirming, setConfirming] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const generatedSelected = candidates.some((c) => c.generated && c.selected);

  React.useEffect(() => setChosen(initial), [initial]);

  const dirty = chosen.join("|") !== initial.join("|") || generatedSelected;

  const toggle = (url: string) =>
    setChosen((list) => (list.includes(url) ? list.filter((u) => u !== url) : [...list, url].slice(0, 8)));

  const save = async () => {
    setBusy("save");
    try {
      onChange(await saveAiSources(draft.id, chosen));
      toast.success("Asl suratlar saqlandi — endi rasmlarni to'liq qayta yarating.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(null);
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy("upload");
    try {
      onChange(await uploadAiSources(draft.id, Array.from(files)));
      toast.success(`${files.length} ta surat qo'shildi.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuklanmadi.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const rebuild = async () => {
    setBusy("rebuild");
    try {
      onChange(await regenerateAiDraft(draft.id, { images: true }));
      setConfirming(false);
      toast.success("To'liq jarayon boshlandi: tahlil, bozor, matn va barcha rasmlar qaytadan yasaladi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Boshlanmadi.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={cn("space-y-3 rounded-xl border p-3",
      generatedSelected ? "border-amber-500/40 bg-amber-500/5" : "bg-muted/20")}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Images className="size-3.5 shrink-0" />
        <span className="font-semibold">Asl suratlar</span>
        <span className="min-w-0 flex-1 text-muted-foreground">
          {`AI rasm yasashda shularni namuna qiladi — tanlangan: ${chosen.length}`}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => void upload(e.target.files)}
        />
        <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg px-2 text-xs"
          disabled={busy !== null || working} onClick={() => fileRef.current?.click()}>
          {busy === "upload" ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          Surat yuklash
        </Button>
      </div>

      {generatedSelected && (
        <p className="flex items-start gap-2 text-xs">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
          {"Hozirgi asl suratlar orasida AI yasagan rasm bor — AI o'z rasmidan nusxa ko'chiradi va sifat pasayadi. O'z suratlaringizni belgilab saqlang."}
        </p>
      )}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {candidates.map((c) => {
          const on = !c.generated && chosen.includes(c.url);
          return (
            <button
              key={c.url}
              type="button"
              disabled={c.generated || busy !== null}
              onClick={() => toggle(c.url)}
              title={c.label}
              aria-pressed={on}
              className={cn(
                "relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition",
                c.generated ? "border-amber-500/70 opacity-60" : on ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(c.url)} alt={c.label} className="h-full w-full object-cover" />
              {on && (
                <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {chosen.indexOf(c.url) + 1}
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-[9px] text-white">
                {c.generated ? "AI — asl emas" : c.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {dirty && (
          <Button type="button" size="sm" className="rounded-lg" disabled={busy !== null || !chosen.length}
            onClick={() => void save()}>
            {busy === "save" ? <Loader2 className="animate-spin" /> : <Check />}
            Tanlovni saqlash
          </Button>
        )}
        {!confirming ? (
          <Button type="button" variant="outline" size="sm" className="rounded-lg"
            disabled={busy !== null || working || dirty} onClick={() => setConfirming(true)}
            title={dirty ? "Avval tanlovni saqlang" : undefined}>
            <RefreshCw /> Rasmlar bilan to&apos;liq qayta yaratish
          </Button>
        ) : (
          <span className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs">
            {`Tahlil, bozor, matn va BARCHA rasmlar qaytadan yasaladi — ~${formatUsd(draft.imageSetPriceUsd)}. Natija Uzum'ga o'zi ketmaydi.`}
            <Button type="button" size="sm" className="h-7 rounded-lg" disabled={busy !== null} onClick={() => void rebuild()}>
              {busy === "rebuild" ? <Loader2 className="animate-spin" /> : null}
              Ha, boshlash
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7" onClick={() => setConfirming(false)}>
              Bekor
            </Button>
          </span>
        )}
      </div>
    </div>
  );
}
