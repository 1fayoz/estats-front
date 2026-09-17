"use client";

/**
 * eStats Lens kengaytmasini kabinetga ulash.
 *
 * Kengaytma bu sahifani `?state=<tasodif>&name=<brauzer>&version=` bilan
 * ochadi. Oqim:
 *
 *   1. sahifa kengaytmani chaqiradi (`lens:ping`) — javob (`lens:ready`)
 *      kelmasa, o'rnatish yo'riqnomasi ko'rsatiladi;
 *   2. sotuvchi «Ulash» ni O'ZI bosadi — jimgina avtomatik ulash yo'q:
 *      qurilma tokeni hisobga to'liq kirish beradi va buni odam ko'rib
 *      tasdiqlashi kerak;
 *   3. `POST /devices` → token → `lens:token` (state bilan) → kengaytma
 *      javobi `lens:connected`.
 *
 * Token faqat xotirada, bir lahza — URL'ga, localStorage'ga, logga tushmaydi.
 */

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, Globe, Loader2, PlugZap, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { createLensDevice, isExtensionMessage, lensDownloadUrl, SOURCE_PAGE } from "@/lib/lens";
import { useUserStore } from "@/stores/user-store";

type Phase = "detecting" | "missing" | "ready" | "connecting" | "connected" | "failed";

const STATE_RE = /^[0-9a-f-]{36}$/;

export default function ExtensionConnectPage() {
  return (
    <React.Suspense fallback={<Skeleton className="mx-auto h-72 max-w-xl rounded-2xl" />}>
      <ConnectFlow />
    </React.Suspense>
  );
}

function ConnectFlow() {
  const params = useSearchParams();
  const user = useUserStore((state) => state.user);
  const state = params.get("state") ?? "";
  const deviceName = (params.get("name") ?? "Brauzer").slice(0, 120);
  const version = params.get("version");
  const validState = STATE_RE.test(state);

  const [phase, setPhase] = React.useState<Phase>("detecting");
  const [error, setError] = React.useState<string | null>(null);
  const [extensionVersion, setExtensionVersion] = React.useState<string | null>(version);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isExtensionMessage(event)) return;
      if (event.data.type === "lens:ready") {
        setExtensionVersion(event.data.version);
        setPhase((current) => (current === "detecting" || current === "missing" ? "ready" : current));
      }
      if (event.data.type === "lens:connected") {
        if (timeout.current) clearTimeout(timeout.current);
        if (event.data.ok) setPhase("connected");
        else {
          setError("Kengaytma tokenni qabul qilmadi — ulash havolasi eskirgan. Kengaytma oynachasidan «eStats'ga ulash» ni qayta bosing.");
          setPhase("failed");
        }
      }
    };
    window.addEventListener("message", onMessage);
    window.postMessage({ source: SOURCE_PAGE, type: "lens:ping" }, window.location.origin);
    const missing = setTimeout(() => setPhase((current) => (current === "detecting" ? "missing" : current)), 2500);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(missing);
    };
  }, []);

  const connect = async () => {
    setPhase("connecting");
    setError(null);
    try {
      const { token } = await createLensDevice({ name: deviceName, extensionVersion, userAgent: navigator.userAgent.slice(0, 500) });
      window.postMessage({ source: SOURCE_PAGE, type: "lens:token", token, state }, window.location.origin);
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
          <PlugZap className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">eStats Lens kengaytmasi</h1>
          <p className="text-sm text-muted-foreground">uzum.uz sahifalarida bozor tahlili — sizning eStats hisobingiz bilan</p>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        {!validState ? (
          <Status icon={<XCircle className="size-5 text-[var(--bad)]" />} title="Havola noto'g'ri">
            Bu sahifani kengaytma o&apos;zi ochadi. Brauzer panelidagi eStats Lens belgisini bosing va «eStats&apos;ga ulash» ni tanlang.
          </Status>
        ) : phase === "detecting" ? (
          <Status icon={<Loader2 className="size-5 animate-spin text-primary" />} title="Kengaytma qidirilmoqda…" />
        ) : phase === "missing" ? (
          <Status icon={<Globe className="size-5 text-[var(--warn)]" />} title="Kengaytma topilmadi">
            <p>Bu brauzerda eStats Lens o&apos;rnatilmagan yoki o&apos;chirilgan. O&apos;rnatib, shu sahifani yangilang.</p>
            <Button asChild className="mt-3 min-h-10 gap-2 rounded-xl">
              <a href={lensDownloadUrl()}>
                <Download className="size-4" /> Kengaytmani yuklab olish
              </a>
            </Button>
          </Status>
        ) : phase === "connected" ? (
          <Status icon={<CheckCircle2 className="size-5 text-[var(--ok)]" />} title="Ulandi">
            <p>
              Ochiq uzum.uz sahifalari yangilandi. Endi kartochkalar ostida, turkum va do&apos;kon sahifalarida hamda tovar oynasida eStats tahlili ko&apos;rinadi.
            </p>
            <Button asChild variant="outline" className="mt-3 min-h-10 rounded-xl">
              <a href="https://uzum.uz/uz" target="_blank" rel="noreferrer">
                uzum.uz ni ochish
              </a>
            </Button>
          </Status>
        ) : (
          <div className="space-y-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Hisob</dt>
              <dd className="truncate font-medium">{user?.fullName || user?.email || "—"}</dd>
              <dt className="text-muted-foreground">Brauzer</dt>
              <dd className="truncate font-medium">{deviceName}</dd>
              {extensionVersion ? (
                <>
                  <dt className="text-muted-foreground">Versiya</dt>
                  <dd className="font-medium tabular-nums">{extensionVersion}</dd>
                </>
              ) : null}
            </dl>
            <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Kengaytma faqat uzum.uz va eStats bilan ishlaydi. Uzum parolingiz yoki tokeningiz unga berilmaydi. Brauzerni istalgan vaqtda
              Integratsiyalar → «Brauzer kengaytmasi» bo&apos;limidan uzishingiz mumkin.
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
