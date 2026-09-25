"use client";

import * as React from "react";
import { Loader2, Minus, Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  ApiError, fetchAiImageSettings, saveAiDraftImageSettings, saveAiImageSettings,
} from "@/lib/api";
import { formatUsd } from "@/lib/format";
import type { AiDraft, AiImageSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Rasm sozlamalari — qaysi joyga nechta kadr yasaladi.
 *
 * Sotuvchi talabi (2026-09-25): «nechitadan va qaysilarga qilinsin — settingda
 * sozlansin; bazilar 2-3 ta hohlar». Ikki rejim: qoralamaning o'zi (`draft`
 * berilsa) va do'kon sukuti (yangi tovar oynasida). Kamaytirish bor rasmni
 * o'chirmaydi — faqat keyingi yasash va joylash darvozasi shunga qaraydi.
 */

const ROWS: { key: keyof AiImageSettings; label: string; hint: string; visualOnly?: boolean }[] = [
  { key: "gallery", label: "Galereya", hint: "Uzum rasmlari. 0 — avtomatik (5-8, bozor naqshiga qarab)." },
  { key: "per_variant", label: "Har rang uchun", hint: "Har rang/dizaynning o'z kadrlari — Uzum rang galereyasiga.", visualOnly: true },
  { key: "description", label: "Tavsif ichida", hint: "Tavsif matni orasiga qo'yiladigan rasmlar." },
  { key: "size", label: "Oʻlchamli setka", hint: "0 — bu bo'limga rasm yasalmaydi." },
  { key: "composition", label: "Tarkib", hint: "Material, qismlar, komplekt." },
  { key: "usage", label: "Yoʻriqnoma", hint: "Bosqichma-bosqich foydalanish." },
];

const LIMITS: Record<keyof AiImageSettings, [number, number]> = {
  gallery: [0, 10], per_variant: [0, 4], description: [0, 8], size: [0, 4], composition: [0, 4], usage: [0, 4],
};

const DEFAULTS: AiImageSettings = { gallery: 0, per_variant: 1, description: 4, size: 1, composition: 1, usage: 1 };

function total(settings: AiImageSettings, visualVariants: number): number {
  const variants = visualVariants >= 2 ? settings.per_variant * visualVariants : 0;
  return (settings.gallery || 7) + settings.description + settings.size + settings.composition + settings.usage + variants;
}

export function ImageSettingsPanel({
  draft,
  onChange,
  disabled,
  defaultOpen = false,
}: {
  /** Berilmasa — do'kon sukuti tahrirlanadi. */
  draft?: AiDraft;
  onChange?: (draft: AiDraft) => void;
  disabled?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [value, setValue] = React.useState<AiImageSettings>(draft?.imageSettings ?? DEFAULTS);
  const [saved, setSaved] = React.useState<AiImageSettings>(draft?.imageSettings ?? DEFAULTS);
  const [price, setPrice] = React.useState(draft?.imagePriceUsd ?? 0);
  const [asDefault, setAsDefault] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [available, setAvailable] = React.useState(true);

  React.useEffect(() => {
    if (draft) {
      const next = draft.imageSettings ?? DEFAULTS;
      setValue(next);
      setSaved(next);
      setPrice(draft.imagePriceUsd);
      return;
    }
    let alive = true;
    fetchAiImageSettings()
      .then((state) => {
        if (!alive) return;
        setValue(state.settings);
        setSaved(state.settings);
        setPrice(state.imagePriceUsd);
      })
      .catch((err) => {
        // Eski backend — panel yashiriladi.
        if (alive && err instanceof ApiError && [403, 404, 405].includes(err.status)) setAvailable(false);
      });
    return () => {
      alive = false;
    };
  }, [draft]);

  const visualVariants = React.useMemo(() => {
    const axes = draft?.variants?.axes ?? [];
    if (draft?.variants?.needsChoice) return 0;
    const axis = axes.find((a) => a.visual && a.values.length >= 2);
    return axis ? axis.values.length : 0;
  }, [draft?.variants]);

  if (!available) return null;

  const dirty = (Object.keys(value) as (keyof AiImageSettings)[]).some((k) => value[k] !== saved[k]) || asDefault;
  const count = total(value, visualVariants);
  const rows = ROWS.filter((row) => !row.visualOnly || !draft || visualVariants >= 2);

  const step = (key: keyof AiImageSettings, delta: number) => {
    const [low, high] = LIMITS[key];
    setValue((current) => {
      let next = Math.max(low, Math.min(high, current[key] + delta));
      if (key === "gallery" && next > 0 && next < 3) next = delta > 0 ? 3 : 0;
      return { ...current, [key]: next };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      if (draft) {
        const next = await saveAiDraftImageSettings(draft.id, value, asDefault);
        onChange?.(next);
        setSaved(next.imageSettings ?? value);
      } else {
        const state = await saveAiImageSettings(value);
        setSaved(state.settings);
      }
      setAsDefault(false);
      toast.success(draft ? "Rasm sozlamasi saqlandi." : "Yangi tovarlar uchun sozlama saqlandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-muted/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs"
        aria-expanded={open}
      >
        <Settings2 className="size-3.5 shrink-0" />
        <span className="font-semibold">Rasm sozlamasi</span>
        <span className="min-w-0 flex-1 truncate text-muted-foreground">
          {`${count} ta kadr · ~${formatUsd(price * count)}`}
        </span>
        <span className="text-muted-foreground">{open ? "yopish" : "o'zgartirish"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t px-3 pb-3 pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.key} className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-[11px] leading-snug text-muted-foreground">{row.hint}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={disabled || saving || value[row.key] <= LIMITS[row.key][0]}
                    onClick={() => step(row.key, -1)}
                    aria-label={`${row.label} — kamaytirish`}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className={cn("w-9 text-center text-sm font-semibold tabular-nums",
                    row.key === "gallery" && value.gallery === 0 && "text-xs")}>
                    {row.key === "gallery" && value.gallery === 0 ? "Avto" : value[row.key]}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={disabled || saving || value[row.key] >= LIMITS[row.key][1]}
                    onClick={() => step(row.key, 1)}
                    aria-label={`${row.label} — ko'paytirish`}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {draft && visualVariants < 2 && (
            <p className="text-[11px] text-muted-foreground">
              {"«Har rang uchun» — tovarda ikki va undan ko'p rang/dizayn varianti bo'lganda ko'rinadi."}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {draft && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={asDefault}
                  onChange={(e) => setAsDefault(e.target.checked)}
                  disabled={saving}
                />
                Keyingi yangi tovarlar uchun ham
              </label>
            )}
            <span className="flex-1 text-[11px] text-muted-foreground">
              {"Kamaytirish bor rasmlarni o'chirmaydi — faqat keyingi yasash shunga qaraydi."}
            </span>
            <Button type="button" size="sm" className="rounded-lg" disabled={!dirty || saving || disabled} onClick={() => void save()}>
              {saving && <Loader2 className="animate-spin" />}
              Saqlash
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
