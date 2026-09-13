"use client";

import * as React from "react";
import { AlertTriangle, LockKeyhole, RefreshCw, Store } from "lucide-react";
import { toast } from "sonner";

import { ApiError, fetchAiUzumShops, syncAiUzumShops } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiUzumShop, AiUzumShops } from "@/lib/types";

/**
 * «Qaysi do'konga joylanadi» — bir Uzum hisobida bir nechta do'kon
 * bo'lishi mumkin va sotuvchi tovar qo'shganda qaysi biriga chiqishini
 * tanlaydi.
 *
 * Ro'yxat ikki manbadan (backend `uzum_shops.py`): Uzum kabinetidagi
 * do'konlar (joylash aynan shu brauzer sessiyasi bilan ishlaydi) va
 * eStats'dagi do'konlar. Kabinet ro'yxati hali olinmagan bo'lsa
 * «Uzumdan yangilash» taklif qilinadi; kabinetda YO'Q do'kon esa
 * tanlab bo'lmaydi — u yerga bu sessiya joylay olmaydi.
 *
 * Eski backend (endpoint yo'q) yoki ruxsat yo'q bo'lsa komponent
 * jimgina yashiriladi: joylash baribir joriy do'konga ketadi.
 */
export function UzumShopPicker({
  value,
  valueTitle,
  onChange,
  lockReason,
  disabled,
}: {
  /** Tanlangan Uzum raqami; `null` — joriy do'kon. */
  value: number | null;
  /** Qoralamada saqlangan nom — ro'yxatda bo'lmasa ham ko'rinsin. */
  valueTitle?: string | null;
  onChange: (id: number | null, shop: AiUzumShop | null) => void | Promise<void>;
  /** Berilsa tanlov qulf va sababi ko'rsatiladi. */
  lockReason?: string | null;
  disabled?: boolean;
}) {
  const id = React.useId();
  const [data, setData] = React.useState<AiUzumShops | null>(null);
  const [hidden, setHidden] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    fetchAiUzumShops()
      .then((fresh) => alive && setData(fresh))
      .catch((err) => {
        if (!alive) return;
        if (err instanceof ApiError && [403, 404, 405].includes(err.status)) setHidden(true);
        else toast.error(err instanceof ApiError ? err.message : "Do'konlar ro'yxati olinmadi.");
      });
    return () => {
      alive = false;
    };
  }, []);

  if (hidden) return null;

  const selectedId = value ?? data?.currentId ?? null;
  const shops = data?.shops ?? [];
  // Qoralamada saqlangan do'kon ro'yxatda bo'lmasa ham (masalan
  // ro'yxat boshqa hisobdan qayta olingan) tanlov yolg'on ko'rinmasin.
  const options: AiUzumShop[] =
    selectedId !== null && !shops.some((shop) => shop.id === selectedId)
      ? [
          ...shops,
          {
            id: selectedId,
            title: valueTitle || `Do'kon ${selectedId}`,
            skuPrefix: null,
            inCabinet: null,
            inEstats: false,
            isCurrent: false,
          },
        ]
      : shops;
  const selected = options.find((shop) => shop.id === selectedId) ?? null;
  const locked = Boolean(lockReason);

  const sync = async () => {
    setSyncing(true);
    try {
      const fresh = await syncAiUzumShops();
      setData(fresh);
      const inCabinet = fresh.shops.filter((shop) => shop.inCabinet).length;
      toast.success(`Uzum kabinetida ${inCabinet} ta do'kon topildi.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Do'konlar ro'yxati olinmadi.");
    } finally {
      setSyncing(false);
    }
  };

  const pick = async (raw: string) => {
    const nextId = Number(raw);
    const shop = options.find((row) => row.id === nextId) ?? null;
    setSaving(true);
    try {
      await onChange(shop?.isCurrent ? null : nextId, shop);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-[13px] font-semibold" htmlFor={id}>
          <Store className="size-3.5 text-[color:var(--ok)]" aria-hidden />
          Qaysi do&apos;konga joylanadi
        </label>
        {!locked && (
          <button
            type="button"
            onClick={sync}
            disabled={syncing || disabled}
            className="inline-flex min-h-8 items-center gap-1 rounded-md px-1.5 text-xs text-[color:var(--air-label)] transition-colors hover:text-[color:var(--air-head)] disabled:opacity-60"
            title="Uzum kabinetidagi do'konlar ro'yxatini qayta oladi (serverda brauzer ochiladi)."
          >
            <RefreshCw className={cn("size-3", syncing && "animate-spin")} aria-hidden />
            {syncing ? "Olinmoqda…" : "Uzumdan yangilash"}
          </button>
        )}
      </div>

      <select
        id={id}
        className="air-input"
        value={selectedId ?? ""}
        disabled={!data || locked || disabled || saving || syncing}
        onChange={(e) => void pick(e.target.value)}
      >
        {!data && <option value="">Yuklanmoqda…</option>}
        {options.map((shop) => (
          <option key={shop.id} value={shop.id} disabled={shop.inCabinet === false}>
            {shop.title} · {shop.id}
            {shop.isCurrent ? " (joriy)" : ""}
            {shop.inCabinet === false ? " — kabinet hisobida yo'q" : ""}
          </option>
        ))}
      </select>

      {locked ? (
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <LockKeyhole className="mt-0.5 size-3 shrink-0" aria-hidden />
          {lockReason}
        </p>
      ) : data && !data.cabinetKnown ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Ro&apos;yxat eStats&apos;dagi do&apos;konlardan. Uzum hisobingizdagi barcha
          do&apos;konlarni ko&apos;rish uchun «Uzumdan yangilash»ni bosing.
        </p>
      ) : data ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Joylashda brauzer kabinetni aynan shu do&apos;konda ochadi va tekshiradi.
          {data.syncedAt ? ` Ro'yxat: ${formatDate(data.syncedAt)}.` : ""}
        </p>
      ) : null}

      {selected && selected.inCabinet === null && !selected.isCurrent && data?.cabinetKnown && (
        <p className="air-warn flex items-start gap-1.5 text-[11px] leading-relaxed">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden />
          Bu do&apos;kon hozirgi ro&apos;yxatda yo&apos;q — joylashdan oldin «Uzumdan yangilash»ni bosing.
        </p>
      )}
    </div>
  );
}
