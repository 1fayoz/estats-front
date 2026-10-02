"use client";

import * as React from "react";
import { Coins, Globe, KeyRound, Store } from "lucide-react";
import { toast } from "sonner";

import { UzumShopPicker } from "@/features/products-ai/components/uzum-shop-picker";
import { ApiError, fetchAiDraftCost, patchAiDraft } from "@/lib/api";
import { formatNumber, formatSum, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiChatSession, AiCost, AiDraft } from "@/lib/types";

import { draftShop, imageCostText, imageEngineOf, shopLockReason } from "./lib";
import { SessionsPanel } from "./sessions-panel";
import styles from "./workspace.module.css";

/**
 * O'ng ustun — do'kon, kartochka raqamlari, AI yo'li va sarfi, suhbatlar.
 *
 * Jarayon (bosqichlar, hozirgi qadam, ETA) ATAYLAB bu yerda EMAS — u
 * sarlavhada bir marta ko'rsatiladi (ilgari yon ustunda ikkinchi nusxasi
 * turardi).
 */
export function Rail({
  draft,
  busy,
  onDraft,
  onAct,
  sessions,
  sessionsLoaded,
  sessionsHidden,
  onOpenSession,
}: {
  draft: AiDraft;
  busy: string;
  onDraft: (draft: AiDraft) => void;
  onAct: (name: string, fn: () => Promise<void>) => Promise<void>;
  sessions: AiChatSession[];
  sessionsLoaded: boolean;
  sessionsHidden: boolean;
  onOpenSession: (id: string) => void;
}) {
  const shop = draftShop(draft);
  const running = draft.progress < 100 && !draft.error;
  return (
    <aside className={cn(styles.rail, "space-y-4")}>
      <div className={cn(styles.card, styles.rise, styles.railCard)} style={{ "--i": 2 } as React.CSSProperties}>
        <p className={styles.railHead}><Store className="size-3.5" aria-hidden /> Uzum do&apos;koni</p>
        <div className="mt-3">
          <UzumShopPicker
            value={shop.id}
            valueTitle={shop.title}
            lockReason={shopLockReason(draft)}
            disabled={busy === "shop"}
            onChange={(id, picked) =>
              onAct("shop", async () => {
                onDraft(await patchAiDraft(draft.id, { uzumShopId: id }));
                toast.success(picked ? `Endi «${picked.title}» do'koniga joylanadi.` : "Do'kon o'zgartirildi.");
              })
            }
          />
        </div>
      </div>

      <div className={cn(styles.card, styles.rise, styles.railCard)} style={{ "--i": 3 } as React.CSSProperties}>
        <p className={styles.railHead}>Kartochka raqamlari</p>
        <dl className="mt-3 space-y-1.5 text-[13px]">
          <Fact label="Tavsiya narx" value={draft.suggestedPrice ? formatSum(draft.suggestedPrice) : "—"} />
          <Fact label="Raqobatchi" value={draft.market?.rivals.length ? `${draft.market.rivals.length} ta` : "—"} />
          {draft.market?.priceMin && draft.market.priceMax ? (
            <Fact label="Bozor narxi" value={`${formatNumber(draft.market.priceMin)} – ${formatNumber(draft.market.priceMax)}`} />
          ) : null}
          <Fact label="Rasmlar" value={`${draft.images.filter(Boolean).length} ta`} />
          <Fact label="Xususiyat" value={`${Object.keys(draft.attributes).length} ta`} />
          <Fact label="Kalit so'z" value={`${draft.keywords.length} ta`} />
          {draft.variants?.skuCount ? <Fact label="SKU" value={`${draft.variants.skuCount} ta`} /> : null}
        </dl>
        {draft.imageNote && <p className="air-notice mt-3 rounded-lg p-2.5 text-xs">{draft.imageNote}</p>}
      </div>

      <div className={cn(styles.card, styles.rise, styles.railCard)} style={{ "--i": 4 } as React.CSSProperties}>
        <EngineAndCost draft={draft} running={running} />
      </div>

      {!sessionsHidden && (
        <div className={cn(styles.card, styles.rise)} style={{ "--i": 5 } as React.CSSProperties}>
          <SessionsPanel sessions={sessions} loaded={sessionsLoaded} onOpen={onOpenSession} />
        </div>
      )}
    </aside>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[color:var(--air-label)]">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * Rasm QAYSI yo'l bilan yasalayotgani va shu kartochkaga ketgan pul.
 *
 * Brauzer hisobi (pulsiz) bo'lsa narx yozilmaydi — faqat yo'l; pulli
 * API bo'lsa bitta kadr narxi. Sarf `ai_usage` dan: brauzer ishlari u
 * yerga tushmaydi (pul yo'q), shuning uchun «0» ko'rinishi normal.
 */
function EngineAndCost({ draft, running }: { draft: AiDraft; running: boolean }) {
  const [cost, setCost] = React.useState<AiCost | null>(null);
  const [hidden, setHidden] = React.useState(false);
  const engine = imageEngineOf(draft);
  const price = imageCostText(draft);

  React.useEffect(() => {
    if (running) return;
    let alive = true;
    fetchAiDraftCost(draft.id)
      .then((data) => alive && setCost(data))
      .catch((err) => alive && err instanceof ApiError && setHidden(true));
    return () => {
      alive = false;
    };
  }, [draft.id, draft.updatedAt, running]);

  const max = Math.max(...(cost?.services.map((s) => s.usd) ?? [0]), 0.000001);
  return (
    <>
      <p className={styles.railHead}><Coins className="size-3.5" aria-hidden /> AI yo&apos;li va sarfi</p>
      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[color:var(--air-line)] bg-[color:var(--air-canvas)] p-3">
        {engine === "web" ? <Globe className="mt-0.5 size-4 shrink-0 text-[color:var(--ok)]" aria-hidden /> : <KeyRound className="mt-0.5 size-4 shrink-0 text-[color:var(--air-head)]" aria-hidden />}
        <div className="min-w-0 text-xs leading-relaxed">
          <p className="font-semibold">
            {engine === "web" ? "Rasm — brauzer hisobi, pulsiz" : engine === "api" ? `Rasm — pulli API, ${price.text} / kadr` : "Rasm yasovchi ulanmagan"}
          </p>
          <p className="text-muted-foreground">{price.hint}</p>
        </div>
      </div>

      {!hidden && cost && (
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-[color:var(--air-label)]">Shu kartochkaga ketgan</span>
            <span className="text-base font-semibold tabular-nums">{formatUsd(cost.totalUsd)}</span>
          </div>
          {cost.services.length > 0 && (
            <ul className="space-y-1.5">
              {cost.services.map((service) => (
                <li key={service.key} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{service.label}</span>
                    <span className="tabular-nums">{formatUsd(service.usd)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-[width] duration-500", service.key === "openai" ? "bg-emerald-500" : "bg-sky-500")}
                      style={{ width: `${Math.max(3, (service.usd / max) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {cost.tasks.length > 0 && (
            <dl className="space-y-1 text-xs">
              {cost.tasks.slice(0, 5).map((task) => (
                <div key={task.key} className="flex items-center justify-between gap-2">
                  <dt className="min-w-0 truncate text-[color:var(--air-label)]">{task.label}{task.images > 0 ? ` · ${task.images} ta rasm` : ""}</dt>
                  <dd className="shrink-0 tabular-nums">{formatUsd(task.usd)}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="text-[11px] text-[color:var(--air-label)]">
            {cost.calls ? `${formatNumber(cost.calls)} ta pulli chaqiruv` : "Pulli API chaqiruvi bo'lmagan"}
            {engine === "web" ? " · brauzer ishlari hisobga kirmaydi" : ""}
          </p>
        </div>
      )}
    </>
  );
}
