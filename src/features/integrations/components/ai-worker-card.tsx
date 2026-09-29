"use client";

/**
 * «eStats AI» — Gemini/ChatGPT vazifalari sotuvchining O'Z brauzerida
 * (backend §9.53). Karta: kengaytma onlaynmi, qaysi saytga kirilgan va limit
 * AYNAN qachon tiklanadi (Gemini `/usage` sahifasidan yoki xabar matnidan —
 * taxmin bo'lsa «taxminan» deb yoziladi).
 */

import * as React from "react";
import { Bot, CheckCircle2, Clock, Layers, Loader2, PlugZap, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { fetchAiWorkerStatus, type AiWorkerLimit, type AiWorkerProvider, type AiWorkerStatus } from "@/lib/api";

const NAMES = { gemini_web: "Google Gemini", chatgpt_web: "ChatGPT" } as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** «bugun 12:59» / «05.10 20:59» + qancha qolgani. Intl'siz (Chrome uz-UZ buzuq, §10). */
export function resetLabel(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const day = d.toDateString() === now.toDateString() ? "bugun"
    : d.toDateString() === tomorrow.toDateString() ? "ertaga" : `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
  const left = Math.max(0, Math.round((d.getTime() - now.getTime()) / 60000));
  const rel = left >= 60 ? `${Math.floor(left / 60)} soat ${left % 60} daq` : `${left} daq`;
  return `${day} ${pad(d.getHours())}:${pad(d.getMinutes())} (${rel} qoldi)`;
}

function LimitLine({ label, limit }: { label: string; limit: AiWorkerLimit | null }) {
  if (!limit?.resetsAt) return null;
  return (
    <p className="flex items-start gap-1.5 text-xs text-[var(--warn)]">
      <Clock className="mt-0.5 size-3.5 shrink-0" />
      <span>
        {label} limiti tugagan — <b>{resetLabel(limit.resetsAt)}</b> da tiklanadi
        {limit.exact ? (limit.source === "usage_page" ? " (Gemini «Usage limits» sahifasidan)" : " (sayt xabaridan)") : " (taxminan — sayt vaqtni aytmadi)"}.
        Shu paytgacha boshqa AI ishlaydi, vazifalar o&apos;zi davom etadi.
      </span>
    </p>
  );
}

function ProviderRow({ id, p, online }: { id: keyof typeof NAMES; p: AiWorkerProvider; online: boolean }) {
  const cur = p.usage?.current;
  const week = p.usage?.weekly;
  return (
    <div className="grid gap-1.5 rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{NAMES[id]}</span>
        {!online ? <Badge variant="outline">brauzer oflayn</Badge>
          : p.loggedIn ? <Badge className="bg-[var(--ok)]/15 text-[var(--ok)]">kirilgan{p.email ? ` · ${p.email}` : ""}</Badge>
          : <Badge variant="outline" className="text-[var(--bad)]">brauzerda kirilmagan</Badge>}
      </div>
      {cur ? (
        <p className="text-xs text-muted-foreground">
          Joriy oyna: {cur.pct ?? "?"}% ishlatilgan · {resetLabel(cur.resetsAt)} da yangilanadi
          {week ? ` · haftalik ${week.pct ?? "?"}% (${resetLabel(week.resetsAt)})` : ""}
        </p>
      ) : null}
      <LimitLine label="Hisob" limit={p.limit} />
      <LimitLine label="Rasm yaratish" limit={p.limit ? null : p.imageLimit} />
    </div>
  );
}

export function AiWorkerCard({ onOpenHistory }: { onOpenHistory?: () => void }) {
  const [status, setStatus] = React.useState<AiWorkerStatus | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    const load = () => fetchAiWorkerStatus().then((s) => alive && (setStatus(s), setFailed(false)), () => alive && setFailed(true));
    void load();
    const t = setInterval(load, 20_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Bot className="size-5" />
          </span>
          <div>
            <p className="text-base font-semibold">eStats AI — sizning brauzeringizda</p>
            <CardDescription>
              Gemini va ChatGPT vazifalari (rasm yasash, matn, tekshiruv) server emas, sizning Chrome&apos;ingizda, o&apos;z hisoblaringiz
              bilan bajariladi. Brauzer yopiq bo&apos;lsa vazifalar navbatda kutadi va ochilishi bilan o&apos;zi davom etadi.
            </CardDescription>
          </div>
        </div>
        {onOpenHistory ? (
          <Button variant="outline" size="sm" className="min-h-9 rounded-xl text-xs" onClick={onOpenHistory}>
            <Layers className="mr-1 size-3.5" /> Suhbatlar tarixi
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3">
        {!status && !failed ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Holat o&apos;qilmoqda…</p>
        ) : failed ? (
          <p className="text-sm text-muted-foreground">Holatni o&apos;qib bo&apos;lmadi.</p>
        ) : (
          <>
            <p className={`flex items-center gap-2 text-sm ${status!.online ? "text-[var(--ok)]" : "text-[var(--warn)]"}`}>
              {status!.online ? <CheckCircle2 className="size-4" /> : <TriangleAlert className="size-4" />}
              {status!.online
                ? `Kengaytma onlayn${status!.version ? ` (v${status!.version})` : ""} — vazifalarni qabul qilyapti`
                : "Kengaytma onlayn emas — Chrome'ni oching (kengaytma o'rnatilgan va ulangan bo'lishi kerak)"}
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              <ProviderRow id="gemini_web" p={status!.providers.gemini_web} online={status!.online} />
              <ProviderRow id="chatgpt_web" p={status!.providers.chatgpt_web} online={status!.online} />
            </div>
            {!status!.online ? (
              <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                <PlugZap className="mt-0.5 size-4 shrink-0" />
                <span>
                  Ulash: kengaytma belgisini bosing → «eStats&apos;ga ulash». Gemini va ChatGPT&apos;ga shu brauzerda oddiy kirgan bo&apos;lsangiz
                  yetarli — parol hech qayerga kiritilmaydi.
                </span>
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
