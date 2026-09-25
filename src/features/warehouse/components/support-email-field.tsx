"use client";

import * as React from "react";
import { Check, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, fetchSupportEmail, saveSupportEmail } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SupportEmail } from "@/lib/types";

const SOURCE_HINT: Record<SupportEmail["source"], string> = {
  shop: "Shu do'kon uchun saqlangan.",
  cabinet_login: "Kabinetga kirish loginingizdan olindi — boshqacha bo'lsa o'zgartiring.",
  account: "eStats hisobingiz pochtasi. Uzum kabinetidagi pochta boshqacha bo'lsa, shu yerga kiriting.",
  "": "Pochta kiritilmagan — bot so'rasa xabar yuborilmaydi.",
};

/**
 * Uzum qo'llab-quvvatlash boti hisobni POCHTA bo'yicha topadi va Uzum
 * KABINETIGA ulangan pochtani kutadi (backend §9.39). Shu maydon uni
 * saqlaydi — shu do'kon uchun yoki bir yo'la barcha do'konlarga.
 *
 * Bitta komponent uch joyda: «Operatorga yozish», «Uzum yordami» va
 * Integratsiyalar → Telegram.
 */
export function SupportEmailField({
  onSaved,
  className,
}: {
  /** Pochta o'zgardi — oldingi va yangi qiymat (matndagini almashtirish uchun). */
  onSaved?: (previous: string, next: string) => void;
  className?: string;
}) {
  const [data, setData] = React.useState<SupportEmail | null>(null);
  const [value, setValue] = React.useState("");
  const [allShops, setAllShops] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputId = React.useId();

  React.useEffect(() => {
    let cancelled = false;
    fetchSupportEmail()
      .then((next) => {
        if (cancelled) return;
        setData(next);
        setValue(next.email);
      })
      .catch(() => {
        // Eski backend (404) — maydon ko'rsatilmaydi, eski xatti-harakat qoladi.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  const dirty = value.trim().toLowerCase() !== data.email || (allShops && data.shops > 1);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const next = await saveSupportEmail(value.trim(), allShops);
      onSaved?.(data.email, next.email);
      setData(next);
      setValue(next.email);
      setAllShops(false);
      toast.success(allShops ? "Pochta barcha do'konlaringiz uchun saqlandi." : "Pochta saqlandi.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("space-y-2 rounded-md border bg-muted/20 p-3", className)}>
      <label htmlFor={inputId} className="flex items-center gap-1.5 text-sm font-medium">
        <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Uzum kabinetidagi pochta
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nom@gmail.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && dirty && !saving) void onSave();
          }}
          className="min-w-0 flex-1"
        />
        <Button type="button" size="sm" variant="outline" disabled={!dirty || saving} onClick={() => void onSave()}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Saqlash
        </Button>
      </div>
      {data.shops > 1 && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={allShops}
            onChange={(e) => setAllShops(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-primary)]"
          />
          {`Barcha ${data.shops} ta do'konim uchun`}
        </label>
      )}
      <p className={cn("text-xs", data.source ? "text-muted-foreground" : "text-amber-600 dark:text-amber-500")}>
        {SOURCE_HINT[data.source]} Bot hisobingizni shu pochta orqali topadi.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Xabar matnidagi pochtani almashtiradi — sotuvchining boshqa
 * tahrirlariga tegmaydi. Oldin pochta bo'lmagan bo'lsa matn o'zgarmaydi
 * (botning pochta qadamiga baribir SAQLANGAN pochta ketadi).
 */
export function swapEmail(text: string, previous: string, next: string): string {
  if (!previous || previous === next || !text.includes(previous)) return text;
  return text.split(previous).join(next);
}
