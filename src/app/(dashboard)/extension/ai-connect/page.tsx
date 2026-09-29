"use client";

/**
 * «eStats AI» kengaytmasini ulash — Gemini/ChatGPT vazifalari shu brauzerda
 * bajariladi (server Chrome ochmaydi, backend §9.53).
 *
 * Kengaytma bu sahifani `?state=<tasodif>&version=` bilan ochadi:
 *   1. `ai:ping` → kengaytma `ai:ready` bilan javob beradi (bo'lmasa — yo'riqnoma);
 *   2. sotuvchi «Ulash» ni O'ZI bosadi (qurilma tokeni hisobga kirish beradi);
 *   3. `POST /product-ai/ai-worker/connect` → token → `ai:token` (state bilan)
 *      → kengaytma javobi `ai:connected`.
 * Token faqat xotirada, bir lahza — URL'ga, localStorage'ga, logga tushmaydi.
 */

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Bot, CheckCircle2, Globe, Loader2, PlugZap, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, connectAiWorker } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";

type Phase = "detecting" | "missing" | "ready" | "connecting" | "connected" | "failed";

const SOURCE_PAGE = "estats-front";
const SOURCE_EXTENSION = "estats-ai-worker";
const STATE_RE = /^[0-9a-f-]{36}$/;

export default function AiConnectPage() {
  return (
    <React.Suspense fallback={<Skeleton className="mx-auto h-72 max-w-xl rounded-2xl" />}>
      <ConnectFlow />
    </React.Suspense>
  );
}

function ConnectFlow() {
  const params = useSearchParams();
  const user = useUserStore((s) => s.user);
  const state = params.get("state") ?? "";
  const validState = STATE_RE.test(state);
  const [phase, setPhase] = React.useState<Phase>("detecting");
  const [version, setVersion] = React.useState<string | null>(params.get("version"));
  const [error, setError] = React.useState<string | null>(null);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window || event.origin !== window.location.origin) return;
      const data = event.data as { source?: string; type?: string; ok?: boolean; version?: string } | null;
      if (!data || data.source !== SOURCE_EXTENSION) return;
      if (data.type === "ai:ready") {
        setVersion(data.version ?? null);
        setPhase((p) => (p === "detecting" || p === "missing" ? "ready" : p));
      }
      if (data.type === "ai:connected") {
        if (timeout.current) clearTimeout(timeout.current);
        if (data.ok) setPhase("connected");
        else {
          setError("Kengaytma tokenni qabul qilmadi — havola eskirgan. Kengaytma oynachasidan «eStats'ga ulash» ni qayta bosing.");
          setPhase("failed");
        }
      }
    };
    window.addEventListener("message", onMessage);
    window.postMessage({ source: SOURCE_PAGE, type: "ai:ping" }, window.location.origin);
    const missing = setTimeout(() => setPhase((p) => (p === "detecting" ? "missing" : p)), 2500);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(missing);
    };
  }, []);

  const connect = async () => {
    setPhase("connecting");
    setError(null);
    try {
      const { token } = await connectAiWorker({ name: "Chrome", userAgent: navigator.userAgent.slice(0, 300), version });
      window.postMessage({ source: SOURCE_PAGE, type: "ai:token", token, state }, window.location.origin);
      timeout.current = setTimeout(() => {
        setError("Kengaytma javob bermadi. Sahifani yangilab qayta urinib ko'ring.");
        setPhase("failed");
      }, 8000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ulab bo'lmadi.");
      setPhase("failed");
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 py-4">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Bot className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">eStats AI kengaytmasi</h1>
          <p className="text-sm text-muted-foreground">Gemini va ChatGPT vazifalari shu brauzerda — sizning hisoblaringiz bilan</p>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        {!validState ? (
          <Status icon={<XCircle className="size-5 text-[var(--bad)]" />} title="Havola noto'g'ri">
            Bu sahifani kengaytma o&apos;zi ochadi. Brauzer panelidagi eStats AI belgisini bosing va «eStats&apos;ga ulash» ni tanlang.
          </Status>
        ) : phase === "detecting" ? (
          <Status icon={<Loader2 className="size-5 animate-spin text-primary" />} title="Kengaytma qidirilmoqda…" />
        ) : phase === "missing" ? (
          <Status icon={<Globe className="size-5 text-[var(--warn)]" />} title="Kengaytma topilmadi">
            Bu brauzerda eStats AI o&apos;rnatilmagan yoki o&apos;chirilgan.
          </Status>
        ) : phase === "connected" ? (
          <Status icon={<CheckCircle2 className="size-5 text-[var(--ok)]" />} title="Ulandi">
            <p>
              Endi rasm yasash, matn yozish va tekshiruvlar shu brauzerda bajariladi. Gemini va ChatGPT uchun qadalgan (pin) tab ochiladi —
              uni yopmang; yopsangiz keyingi vazifada o&apos;zi qayta ochiladi. Brauzer yopiq bo&apos;lganda vazifalar navbatda kutadi va
              brauzer ochilishi bilan o&apos;zi davom etadi.
            </p>
          </Status>
        ) : (
          <div className="space-y-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Hisob</dt>
              <dd className="truncate font-medium">{user?.fullName || user?.email || "—"}</dd>
              {version ? (
                <>
                  <dt className="text-muted-foreground">Versiya</dt>
                  <dd className="font-medium tabular-nums">{version}</dd>
                </>
              ) : null}
            </dl>
            <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              <span>
                Kengaytma faqat gemini.google.com, chatgpt.com va eStats bilan ishlaydi. Google/OpenAI parollaringiz, cookie va tokenlaringiz
                hech qayerga yuborilmaydi — serverga faqat vazifa natijasi (matn va rasm) boradi.
              </span>
            </p>
            {error ? <p className="text-sm text-[var(--bad)]">{error}</p> : null}
            <Button className="min-h-11 w-full gap-2 rounded-xl" disabled={phase === "connecting"} onClick={() => void connect()}>
              {phase === "connecting" ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
              {phase === "failed" ? "Qayta urinish" : "Shu brauzerni ulash"}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function Status({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1 text-sm text-muted-foreground">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {children ? <div className="mt-1">{children}</div> : null}
      </div>
    </div>
  );
}
