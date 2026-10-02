"use client";

import * as React from "react";
import { Bot, Loader2, MessagesSquare, Sparkles } from "lucide-react";

import { ApiError, fetchAiDraftSessions } from "@/lib/api";
import { aiAccountLabel, aiFamily } from "@/lib/ai-accounts";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiChatSession } from "@/lib/types";

import { SESSION_KIND_LABEL, sessionKind, type SessionKind } from "./lib";
import styles from "./workspace.module.css";

const ACTIVE_MS = 6_000;
const IDLE_MS = 45_000;

/**
 * Shu qoralamaning AI sessiyalari — ro'yxat va so'rab turish.
 *
 * Quvur ishlayotganda yoki biror sessiya javob kutayotganda tez-tez,
 * tinch holatda kamdan-kam. Eski backend (403/404) — panel yashiriladi.
 */
export function useDraftSessions(draftId: number | undefined, busy: boolean) {
  const [sessions, setSessions] = React.useState<AiChatSession[]>([]);
  const [hidden, setHidden] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!draftId) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const rows = await fetchAiDraftSessions(draftId);
        if (stop) return;
        setSessions(rows);
        setLoaded(true);
        const pending = rows.some((r) => r.pending || r.status === "active");
        timer = setTimeout(tick, busy || pending ? ACTIVE_MS : IDLE_MS);
      } catch (err) {
        if (stop) return;
        if (err instanceof ApiError && [403, 404, 405].includes(err.status)) {
          setHidden(true);
          return;
        }
        timer = setTimeout(tick, IDLE_MS);
      }
    };
    void tick();
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, [draftId, busy]);

  return { sessions, hidden, loaded };
}

function statusDot(s: AiChatSession): string {
  if (s.pending) return "bg-[color:var(--primary)]";
  if (s.status === "active") return "bg-[color:var(--ok)]";
  if (s.status === "failed") return "bg-[color:var(--bad)]";
  return "bg-[color:var(--air-label)]";
}

function ProviderIcon({ provider }: { provider: string }) {
  return aiFamily(provider) === "gemini_web"
    ? <Sparkles className="size-3.5 text-[color:var(--primary)]" aria-hidden />
    : <Bot className="size-3.5 text-[color:var(--air-head)]" aria-hidden />;
}

/** Bitta sessiya qatori — rasm plitkasi ostida ham, yon ustunda ham shu. */
export function SessionRow({
  session,
  onOpen,
  compact,
}: {
  session: AiChatSession;
  onOpen: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <button type="button" className={styles.sessionRow} onClick={() => onOpen(session.id)}>
      <span className="flex items-center gap-2">
        <span className={cn(styles.dot, statusDot(session), session.pending && styles.pulse)} aria-hidden />
        <ProviderIcon provider={session.provider} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium">{session.target?.label || session.title}</span>
        {!compact && (
          <span className="block truncate text-[11px] text-[color:var(--air-label)]">
            {aiAccountLabel(session.provider)} · {session.turnCount} savol
            {session.imageCount ? ` · ${session.imageCount} rasm` : ""}
            {` · ${formatDate(new Date(session.lastTurnAt || session.createdAt))}`}
          </span>
        )}
      </span>
      <span className="text-[11px] text-[color:var(--air-label)]">
        {session.pending ? <Loader2 className="size-3.5 animate-spin text-[color:var(--primary)]" aria-label="javob kutilmoqda" />
          : session.status === "active" ? "faol"
            : session.status === "failed" ? "xato"
              : "tayyor"}
      </span>
    </button>
  );
}

/**
 * Yon ustundagi «AI suhbatlari» — tur bo'yicha filtr (rasm / tekshiruv /
 * matn / tahlil), har qator bosilganda tarix ochiladi.
 */
export function SessionsPanel({
  sessions,
  loaded,
  onOpen,
}: {
  sessions: AiChatSession[];
  loaded: boolean;
  onOpen: (id: string) => void;
}) {
  const [kind, setKind] = React.useState<SessionKind | "all">("all");
  const counts = React.useMemo(() => {
    const map = new Map<SessionKind, number>();
    for (const s of sessions) map.set(sessionKind(s), (map.get(sessionKind(s)) ?? 0) + 1);
    return map;
  }, [sessions]);
  const shown = React.useMemo(
    () => (kind === "all" ? sessions : sessions.filter((s) => sessionKind(s) === kind)).slice(0, 40),
    [sessions, kind],
  );
  const kinds = (Object.keys(SESSION_KIND_LABEL) as SessionKind[]).filter((k) => counts.get(k));

  return (
    <section className={styles.railCard} aria-label="AI suhbatlari">
      <div className="flex items-center justify-between gap-2">
        <p className={styles.railHead}><MessagesSquare className="size-3.5" aria-hidden /> AI suhbatlari</p>
        <span className="text-[11px] tabular-nums text-[color:var(--air-label)]">{sessions.length} ta</span>
      </div>
      {kinds.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Sessiya turi">
          {(["all", ...kinds] as (SessionKind | "all")[]).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                styles.chip,
                "cursor-pointer",
                kind === k ? styles.chipOk : "hover:bg-[color:var(--air-canvas)]",
              )}
            >
              {k === "all" ? "Hammasi" : SESSION_KIND_LABEL[k]}
              <span className="tabular-nums opacity-70">{k === "all" ? sessions.length : counts.get(k)}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-2 -mx-2">
        {!loaded ? (
          <p className="px-2 py-2 text-xs text-[color:var(--air-label)]">Yuklanmoqda…</p>
        ) : shown.length === 0 ? (
          <p className="px-2 py-2 text-xs leading-relaxed text-[color:var(--air-label)]">
            Hali suhbat yo&apos;q. Brauzer hisobi (Gemini/ChatGPT) bilan ishlanganda har rasm va matn o&apos;z suhbatida saqlanadi.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {shown.map((s) => (
              <li key={s.id}><SessionRow session={s} onOpen={onOpen} /></li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** Rasm/matn yonidagi ixcham ro'yxat — «shu kadr uchun ochilgan suhbatlar». */
export function SessionChips({
  sessions,
  onOpen,
  title = "Shu kadr uchun AI suhbatlari",
}: {
  sessions: AiChatSession[];
  onOpen: (id: string) => void;
  title?: string;
}) {
  if (!sessions.length) return null;
  return (
    <div className="rounded-xl border bg-muted/20 p-2">
      <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title} · {sessions.length}
      </p>
      <ul className="space-y-0.5">
        {sessions.slice(0, 6).map((s) => (
          <li key={s.id}><SessionRow session={s} onOpen={onOpen} compact /></li>
        ))}
      </ul>
    </div>
  );
}
