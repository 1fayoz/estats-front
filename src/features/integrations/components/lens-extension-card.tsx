"use client";

/**
 * Integratsiyalar → Kengaytma: eStats Lens (uzum.uz uchun brauzer kengaytmasi).
 *
 * Bu yerda: Chrome Web Store'dan o'rnatish, qisqa yo'riqnoma va ulangan
 * brauzerlar ro'yxati (uzish bilan). Ulashning O'ZI shu yerda emas — uni
 * kengaytma boshlaydi (`/extension/connect`), chunki token aynan o'sha
 * brauzerga tushishi kerak.
 *
 * Kengaytma FAQAT do'kon orqali tarqatiladi: zip arxiv yo'q, yangilanishni
 * Chrome o'zi o'rnatadi (qaror 2026-09-17). Do'kon manzili lens'dan keladi
 * (`EXTENSION_STORE_URL`); u bo'sh bo'lsa — do'kon tekshiruvi hali tugamagan.
 */

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Globe, Laptop, Loader2, Puzzle, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { fetchLensDevices, fetchLensRelease, LENS_PAGE_PATH, LENS_PRIVACY_PATH, revokeLensDevice, type LensDevice, type LensRelease } from "@/lib/lens";

const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

/** Qo'lda: Chrome'da `Intl uz-UZ` oy nomini "M09" qilib buzadi (CLAUDE.md §10). */
function shortDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const tashkent = new Date(date.getTime() + 5 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${tashkent.getUTCDate()} ${MONTHS[tashkent.getUTCMonth()]}, ${pad(tashkent.getUTCHours())}:${pad(tashkent.getUTCMinutes())}`;
}

export function LensExtensionCard() {
  const [devices, setDevices] = React.useState<LensDevice[] | null>(null);
  const [release, setRelease] = React.useState<LensRelease | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    const [list, latest] = await Promise.allSettled([fetchLensDevices(), fetchLensRelease()]);
    if (list.status === "fulfilled") {
      setDevices(list.value.items);
      setError(null);
    } else {
      setDevices([]);
      setError(list.reason instanceof ApiError ? list.reason.message : "Brauzerlar ro'yxatini yuklab bo'lmadi.");
    }
    setRelease(latest.status === "fulfilled" ? latest.value : null);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const revoke = async (device: LensDevice) => {
    setBusy(device.id);
    try {
      await revokeLensDevice(device.id);
      toast.success(`«${device.name}» uzildi`);
      setDevices((current) => (current ?? []).filter((item) => item.id !== device.id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Uzib bo'lmadi.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="text-base font-semibold tracking-tight">eStats Lens — uzum.uz uchun kengaytma</h3>
              <p className="text-sm text-muted-foreground">
                Kartochkalar ostida sotuv va qoldiq, turkum va do&apos;kon sahifalarida hisobot, tovar oynasida SKU tahlili, qidiruvdagi o&apos;rinlar,
                Uzum tariflari bilan unit iqtisodiyot va rasm bo&apos;yicha qidiruv.
              </p>
            </div>
            {release?.storeUrl ? (
              <Button asChild className="min-h-10 shrink-0 gap-2 rounded-xl">
                <a href={release.storeUrl} target="_blank" rel="noopener noreferrer">
                  <Puzzle className="size-4" /> Chrome Web Store&apos;dan o&apos;rnatish
                  <ExternalLink className="size-3.5 opacity-70" />
                </a>
              </Button>
            ) : release ? (
              <Badge variant="secondary" className="shrink-0 rounded-lg px-3 py-1.5 text-xs">
                Chrome Web Store tekshiruvida
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            {[
              "Chrome Web Store sahifasida «Chrome'ga qo'shish» ni bosing.",
              "O'rnatilgach eStats'ning ulash sahifasi o'zi ochiladi (yoki paneldagi eStats Lens belgisi → «eStats'ga ulash»).",
              "«Shu brauzerni ulash» ni tasdiqlang — uzum.uz sahifalarida tahlil paydo bo'ladi.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3 rounded-xl bg-muted/50 p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            <span>Yangilanishlarni Chrome o&apos;zi o&apos;rnatadi{release?.version ? ` · joriy versiya ${release.version}` : ""}.</span>
            <Link href={LENS_PAGE_PATH} className="underline underline-offset-2 hover:text-foreground" target="_blank">
              Kengaytma haqida
            </Link>
            <Link href={LENS_PRIVACY_PATH} className="underline underline-offset-2 hover:text-foreground" target="_blank">
              Maxfiylik siyosati
            </Link>
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold tracking-tight">Ulangan brauzerlar</h3>
            {devices ? <Badge variant="secondary">{devices.length}</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {devices === null ? (
            <Skeleton className="h-16 rounded-xl" />
          ) : error ? (
            <p className="text-sm text-[var(--warn)]">{error}</p>
          ) : devices.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              <Globe className="size-5 shrink-0" />
              Hali hech bir brauzer ulanmagan.
            </div>
          ) : (
            devices.map((device) => (
              <div key={device.id} className="flex items-center gap-3 rounded-xl border p-3">
                <Laptop className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ulangan {shortDate(device.createdAt)} · oxirgi faollik {shortDate(device.lastSeenAt)}
                    {device.extensionVersion ? ` · v${device.extensionVersion}` : ""} · …{device.tokenHint}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" disabled={busy === device.id} onClick={() => void revoke(device)}>
                  {busy === device.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />} Uzish
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
