"use client";

/**
 * Integratsiyalar → Kengaytma: eStats Lens (uzum.uz uchun brauzer kengaytmasi).
 *
 * Bu yerda: oxirgi versiya va yuklab olish, o'rnatish yo'riqnomasi va
 * ulangan brauzerlar ro'yxati (uzish bilan). Ulashning O'ZI shu yerda emas —
 * uni kengaytma boshlaydi (`/extension/connect`), chunki token aynan
 * o'sha brauzerga tushishi kerak.
 */

import * as React from "react";
import { Download, Globe, Laptop, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { fetchLensDevices, fetchLensRelease, lensDownloadUrl, revokeLensDevice, type LensDevice, type LensRelease } from "@/lib/lens";

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
            {release ? (
              <Button asChild className="min-h-10 shrink-0 gap-2 rounded-xl">
                <a href={lensDownloadUrl()}>
                  <Download className="size-4" /> Yuklab olish · v{release.version}
                </a>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "Arxivni yuklab oling va papkaga oching.",
              "Chrome'da chrome://extensions ni oching, «Dasturchi rejimi» ni yoqing.",
              "«Paketlanmagan kengaytmani yuklash» → ochilgan papkani tanlang.",
              "Paneldagi eStats Lens belgisi → «eStats'ga ulash» — ochilgan eStats sahifasida tasdiqlaysiz.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3 rounded-xl bg-muted/50 p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {release ? (
            <p className="mt-3 break-all text-xs text-muted-foreground">
              {formatNumber(Math.round(release.size / 1024))} KB · sha256 {release.sha256}
            </p>
          ) : null}
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
