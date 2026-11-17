"use client";

/**
 * Integratsiyalar → Kengaytma: «Sotuvchi kabineti vazifalari».
 *
 * Kabinet (seller.uzum.uz) amallari — turkum daraxti, moderatsiya sabablari,
 * CPO reklama, voronka, Bust narxlari va tasdiqlangan Bust kampaniyasi —
 * server brauzeri o'rniga sotuvchining O'Z brauzerida, eStats Lens kengaytmasi
 * orqali bajariladi (server IP'sida Cloudflare har so'rovni tekshirardi).
 *
 * Bu karta faol do'kon uchun holatni ko'rsatadi: qaysi brauzer ulangan,
 * onlaynmi, kabinetga kirilganmi, navbatdagi vazifalar. Ulashning o'zi
 * kengaytma popup'ida (ruxsat aynan o'sha brauzerda so'raladi).
 */

import * as React from "react";
import { CheckCircle2, CircleDashed, Laptop, Loader2, RefreshCw, ServerCog, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, fetchCabinetRunnerStatus, type CabinetRunnerStatus, type CabinetTaskRow } from "@/lib/api";

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

const KIND_LABEL: Record<string, string> = {
  category_tree: "Turkum daraxti",
  moderation_reasons: "Moderatsiya sabablari",
  cpo_ads: "CPO reklama",
  funnel: "Voronka",
  bust_insights: "Bust narxlari",
  bust_create: "Bust kampaniyasi yaratish",
};

const STATUS_LABEL: Record<CabinetTaskRow["status"], string> = {
  queued: "navbatda",
  claimed: "bajarilmoqda",
  done: "bajarildi",
  failed: "xato",
  expired: "server bajardi",
};

function statusTone(status: CabinetTaskRow["status"]): string {
  if (status === "done") return "text-[var(--ok)]";
  if (status === "failed") return "text-[var(--bad)]";
  if (status === "queued" || status === "claimed") return "text-[var(--warn)]";
  return "text-muted-foreground";
}

export function CabinetRunnerCard() {
  const [data, setData] = React.useState<CabinetRunnerStatus | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchCabinetRunnerStatus());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Holatni yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Navbatda vazifa bo'lsa holat 5 soniyada yangilanadi.
  React.useEffect(() => {
    if (!data?.pending) return;
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [data?.pending, load]);

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="text-base font-semibold tracking-tight">Sotuvchi kabineti vazifalari — shu do&apos;kon</h3>
            <p className="text-sm text-muted-foreground">
              Turkumlar, moderatsiya sabablari, reklama va voronka statistikasi hamda siz tasdiqlagan Bust kampaniyasi
              server o&apos;rniga <b>sizning brauzeringizda</b>, o&apos;zingiz kirgan seller.uzum.uz sessiyasi bilan bajariladi.
              Uzum tokeni eStats&apos;ga yuborilmaydi.
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5 rounded-lg" disabled={loading} onClick={() => void load()}>
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Yangilash
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data === null && !error ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : error ? (
          <p className="text-sm text-[var(--warn)]">{error}</p>
        ) : data ? (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1.5 rounded-lg px-2.5 py-1">
                {data.paired ? <CheckCircle2 className="size-3.5 text-[var(--ok)]" /> : <CircleDashed className="size-3.5" />}
                {data.paired ? "Brauzer ulangan" : "Brauzer ulanmagan"}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 rounded-lg px-2.5 py-1">
                {data.online ? <CheckCircle2 className="size-3.5 text-[var(--ok)]" /> : <XCircle className="size-3.5 text-muted-foreground" />}
                {data.online ? "Onlayn, kabinetga kirilgan" : "Hozir oflayn"}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 rounded-lg px-2.5 py-1">
                <ServerCog className="size-3.5" />
                {data.enabled ? "Kengaytma yo'li yoqilgan" : "Hozircha server bajaradi"}
              </Badge>
              {data.pending ? (
                <Badge className="gap-1.5 rounded-lg px-2.5 py-1">
                  <Loader2 className="size-3.5 animate-spin" /> {data.pending} ta vazifa kutilmoqda
                </Badge>
              ) : null}
            </div>

            {!data.paired ? (
              <ol className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                {[
                  "eStats Lens kengaytmasini o'rnating va eStats'ga ulang (yuqoridagi yo'riqnoma).",
                  "Kengaytma belgisi → «Sotuvchi kabineti vazifalari» → «Shu brauzerda bajarish» ni yoqing va seller.uzum.uz ruxsatini bering.",
                  "Shu brauzerda seller.uzum.uz ga do'kon egasining hisobi bilan kiring — do'kon shu yerda «ulangan» bo'lib ko'rinadi.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3 rounded-xl bg-muted/50 p-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="space-y-2">
                {data.runners.map((runner) => (
                  <div key={runner.deviceId} className="flex items-center gap-3 rounded-xl border p-3">
                    <Laptop className="size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {runner.name}
                        {runner.revoked ? <span className="ml-2 text-xs text-[var(--bad)]">uzilgan</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        oxirgi aloqa {shortDate(runner.lastSeenAt)}
                        {runner.version ? ` · v${runner.version}` : ""} ·{" "}
                        {runner.cabinetLoggedIn ? "kabinetga kirilgan" : "kabinetga kirilmagan — seller.uzum.uz ni oching"}
                      </p>
                    </div>
                    <Badge variant={runner.online ? "default" : "secondary"} className="rounded-lg">
                      {runner.online ? "onlayn" : "oflayn"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {data.tasks.length ? (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Oxirgi vazifalar</p>
                <div className="divide-y rounded-xl border">
                  {data.tasks.map((task) => (
                    <div key={task.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-2 text-sm">
                      <span className="min-w-0 flex-1 truncate">{KIND_LABEL[task.kind] ?? task.kind}</span>
                      <span className={statusTone(task.status)}>{STATUS_LABEL[task.status] ?? task.status}</span>
                      <span className="text-xs text-muted-foreground">{shortDate(task.createdAt)}</span>
                      {task.error ? <span className="w-full truncate text-xs text-muted-foreground">{task.error}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
