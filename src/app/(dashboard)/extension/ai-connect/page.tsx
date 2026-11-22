"use client";

/**
 * eStats AI'ni ulash — Gemini/ChatGPT vazifalari shu brauzerda bajariladi
 * (server Chrome ochmaydi, backend §9.53).
 *
 * 2026-11 dan bu vazifa **eStats Lens** kengaytmasi ICHIDA (1.2.0+, popup →
 * «AI'ni ulash»): sotuvchi bitta kengaytma o'rnatadi. Protokol o'zgarmadi —
 * eski alohida «eStats AI» kengaytmasi ham shu sahifa bilan ishlayveradi.
 * Lens `ai:ready` ga `app: "estats-lens"` va `permissions` (Gemini/ChatGPT
 * saytlariga ruxsat berilganmi) qo'shadi.
 *
 * Ikkala kengaytma birga o'rnatilgan bo'lsa ikkalasi ham javob beradi:
 * `ai:token` ni faqat `state` egasi qabul qiladi, ikkinchisi `ok:false`
 * qaytaradi — shuning uchun `ok:false` darhol xato deb olinmaydi (qisqa kutish,
 * `ok:true` kelsa u ustun). Eski kengaytma ham sezilsa — uni o'chirish so'raladi.
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
import { Bot, CheckCircle2, ExternalLink, Globe, Loader2, PlugZap, Puzzle, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, connectAiWorker } from "@/lib/api";
import { fetchLensRelease, type LensRelease } from "@/lib/lens";
import {
  AI_SOURCE_EXTENSION, AI_SOURCE_PAGE, aiConnectedDecision, bothInstalled, EMPTY_HANDSHAKE, onAiReady, type AiHandshake, type AiReadyMessage,
} from "@/lib/ai-connect";
import { useUserStore } from "@/stores/user-store";

type Phase = "detecting" | "missing" | "ready" | "connecting" | "connected" | "failed";

const SOURCE_PAGE = AI_SOURCE_PAGE;
const SOURCE_EXTENSION = AI_SOURCE_EXTENSION;
const STATE_RE = /^[0-9a-f-]{36}$/;
/** Ikkinchi (eski) kengaytmaning `ok:false` javobi Lens'ning `ok:true` sidan oldin kelishi mumkin. */
const REJECT_GRACE_MS = 1500;

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
  const urlVersion = params.get("version");
  const [error, setError] = React.useState<string | null>(null);
  const [release, setRelease] = React.useState<LensRelease | null>(null);
  /** Qaysi kengaytmalar javob berdi (Lens / eski «eStats AI»), Lens ruxsat holati va versiya. */
  const [found, setFound] = React.useState<AiHandshake>(EMPTY_HANDSHAKE);
  const permitted = found.permitted;
  const version = found.version ?? urlVersion;
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reject = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = React.useRef(false);

  React.useEffect(() => {
    void fetchLensRelease().then(setRelease, () => setRelease(null));
  }, []);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window || event.origin !== window.location.origin) return;
      const data = event.data as (AiReadyMessage & { ok?: boolean }) | null;
      if (!data || data.source !== SOURCE_EXTENSION) return;
      if (data.type === "ai:ready") {
        setFound((f) => onAiReady(f, data));
        setPhase((p) => (p === "detecting" || p === "missing" ? "ready" : p));
      }
      if (data.type === "ai:connected") {
        const decision = aiConnectedDecision(done.current, Boolean(data.ok));
        if (decision === "ignore") return;
        if (decision === "connected") {
          done.current = true;
          if (timeout.current) clearTimeout(timeout.current);
          if (reject.current) clearTimeout(reject.current);
          setPhase("connected");
        } else if (!reject.current) {
          reject.current = setTimeout(() => {
            if (done.current) return;
            if (timeout.current) clearTimeout(timeout.current);
            setError("Kengaytma tokenni qabul qilmadi — havola eskirgan. eStats Lens oynachasidan «AI'ni ulash» ni qayta bosing.");
            setPhase("failed");
          }, REJECT_GRACE_MS);
        }
      }
    };
    window.addEventListener("message", onMessage);
    window.postMessage({ source: SOURCE_PAGE, type: "ai:ping" }, window.location.origin);
    const missing = setTimeout(() => setPhase((p) => (p === "detecting" ? "missing" : p)), 2500);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(missing);
      if (reject.current) clearTimeout(reject.current);
    };
  }, []);

  const connect = async () => {
    setPhase("connecting");
    setError(null);
    done.current = false;
    if (reject.current) clearTimeout(reject.current);
    reject.current = null;
    try {
      const { token } = await connectAiWorker({ name: found.lens ? "Chrome · eStats Lens" : "Chrome", userAgent: navigator.userAgent.slice(0, 300), version });
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
          <h1 className="text-xl font-semibold tracking-tight">eStats AI — eStats Lens kengaytmasida</h1>
          <p className="text-sm text-muted-foreground">Gemini va ChatGPT vazifalari shu brauzerda — sizning hisoblaringiz bilan</p>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        {!validState ? (
          <Status icon={<XCircle className="size-5 text-[var(--bad)]" />} title="Havola noto'g'ri">
            <p>
              Bu sahifani kengaytma o&apos;zi ochadi. Brauzer panelidagi eStats Lens belgisini bosing va «eStats AI» bo&apos;limida «AI&apos;ni ulash» ni
              tanlang.
            </p>
            <StoreLink release={release} />
          </Status>
        ) : phase === "detecting" ? (
          <Status icon={<Loader2 className="size-5 animate-spin text-primary" />} title="Kengaytma qidirilmoqda…" />
        ) : phase === "missing" ? (
          <Status icon={<Globe className="size-5 text-[var(--warn)]" />} title="Kengaytma topilmadi">
            <p>
              Bu brauzerda eStats Lens o&apos;rnatilmagan yoki o&apos;chirilgan. AI vazifalari endi eStats Lens kengaytmasining ichida — alohida «eStats
              AI» kengaytmasi kerak emas. O&apos;rnating, so&apos;ng kengaytma oynachasida «AI&apos;ni ulash» ni bosing.
            </p>
            <StoreLink release={release} />
          </Status>
        ) : phase === "connected" ? (
          <Status icon={<CheckCircle2 className="size-5 text-[var(--ok)]" />} title="Ulandi">
            <p>
              Endi rasm yasash, matn yozish va tekshiruvlar shu brauzerda bajariladi. Gemini va ChatGPT uchun qadalgan (pin) tab ochiladi —
              uni yopmang; yopsangiz keyingi vazifada o&apos;zi qayta ochiladi. Brauzer yopiq bo&apos;lganda vazifalar navbatda kutadi va
              brauzer ochilishi bilan o&apos;zi davom etadi.
            </p>
            {permitted === false ? (
              <p className="mt-2 text-[var(--warn)]">
                Yana bir qadam: eStats Lens oynachasida «Saytlarga ruxsat berish» ni bosing — Chrome gemini.google.com va chatgpt.com&apos;ga ruxsat
                so&apos;raydi. Ruxsatsiz vazifalar bajarilmaydi.
              </p>
            ) : null}
            <LegacyWarning found={found} />
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
            {found.lens && permitted === false ? (
              <p className="flex items-start gap-2 rounded-xl bg-[var(--warn)]/10 p-3 text-xs leading-relaxed text-[var(--warn)]">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span>
                  eStats Lens&apos;da Gemini va ChatGPT saytlariga hali ruxsat berilmagan. Ulashingiz mumkin, lekin vazifalar ishlashi uchun keyin
                  kengaytma oynachasida «Saytlarga ruxsat berish» ni bosing.
                </span>
              </p>
            ) : null}
            {!found.lens && found.legacy ? (
              <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
                <Puzzle className="mt-0.5 size-4 shrink-0" />
                <span>
                  Bu eski «eStats AI» kengaytmasi — u ishlayveradi, lekin AI vazifalari endi eStats Lens ichida. eStats Lens&apos;ni o&apos;rnatib, AI&apos;ni
                  undan ulang va eski kengaytmani o&apos;chiring.
                </span>
              </p>
            ) : (
              <LegacyWarning found={found} />
            )}
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

/** Lens do'kon havolasi — `GET /extension` → `storeUrl` (bo'sh bo'lsa — do'kon tekshiruvida). */
function StoreLink({ release }: { release: LensRelease | null }) {
  if (!release) return null;
  if (!release.storeUrl) {
    return <p className="mt-2 text-xs">eStats Lens Chrome Web Store tekshiruvida — tasdiqlangach shu yerda o&apos;rnatish tugmasi paydo bo&apos;ladi.</p>;
  }
  return (
    <Button asChild className="mt-3 min-h-10 gap-2 rounded-xl">
      <a href={release.storeUrl} target="_blank" rel="noopener noreferrer">
        <Puzzle className="size-4" /> eStats Lens&apos;ni o&apos;rnatish <ExternalLink className="size-3.5 opacity-70" />
      </a>
    </Button>
  );
}

/** Ikkala kengaytma ham javob berdi — ikki ishchi bir navbatni oladi, eskisini o'chirish kerak. */
function LegacyWarning({ found }: { found: AiHandshake }) {
  if (!bothInstalled(found)) return null;
  return (
    <p className="mt-2 flex items-start gap-2 rounded-xl bg-[var(--warn)]/10 p-3 text-xs leading-relaxed text-[var(--warn)]">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <span>
        Brauzerda eski «eStats AI» kengaytmasi ham o&apos;rnatilgan. AI endi eStats Lens ichida — chrome://extensions sahifasida eski «eStats AI» ni
        o&apos;chiring, aks holda Gemini/ChatGPT tablari ikki barobar ochiladi.
      </span>
    </p>
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
