"use client";

import * as React from "react";
import { Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ApiError, answerAutoResolve, fetchAutoResolve, setAutoResolve, type AutoResolveState } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { AutoResolveProgress } from "./auto-resolve-progress";
import { cn } from "@/lib/utils";

const STATUS: Record<string, string> = {
  "": "Tovar bloklansa ish boshlanadi",
  idle: "Kutilmoqda",
  asking: "Uzum botiga yozilmoqda",
  asked: "Sabab so'raldi — operator javobi kutilmoqda",
  talking: "Operator bilan gaplashmoqda",
  fixing: "Sabab bo'yicha tuzatilmoqda",
  fix_pending: "Tuzatish kutmoqda (AI limiti yoki brauzer oflayn) — o'zi davom etadi",
  report_due: "Tuzatildi — operatorga isbot bilan yozilmoqda",
  reported: "Tuzatildi — operatorga isbot bilan xabar berildi",
  closed: "Suhbat yopildi — Uzum tekshiruvi kutilmoqda",
  no_reply: "Operator javob bermadi — ertaga qayta yoziladi",
  unblocked: "Tovar blokdan chiqdi ✓",
  needs_seller: "Operator savol berdi — javobingiz kerak",
  error: "To'xtadi",
};
const ACTIVE = new Set(["asking", "asked", "talking", "fixing", "fix_pending", "report_due", "reported"]);
const WHO: Record<string, string> = { me: "Biz", op: "Operator", bot: "Bot" };

/**
 * «Avto hal qilish» — kartochka bloklansa Uzum qo'llab-quvvatlash botiga o'zi
 * yozadi: sababini so'raydi, AI bilan suhbatni yuritadi, sabab aytilgach
 * kartochkani tuzatib «tuzatdik» deb yozadi. Ochilmaguncha har kuni.
 */
export function AutoResolvePanel({ productId, blocked }: { productId: number; blocked: boolean }) {
  const [state, setState] = React.useState<AutoResolveState | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [answer, setAnswer] = React.useState("");
  const [times, setTimes] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    const load = async () => {
      let next: AutoResolveState | null = null;
      try {
        next = await fetchAutoResolve(productId);
        if (alive) setState(next);
      } catch { /* keyingi aylanishda */ }
      if (!alive) return;
      // Tuzatish ketayotganda tez — bosqichlar joyida ko'rinsin; tinch paytda siyrak.
      const busy = next && ["asking", "fixing", "report_due"].includes(next.status);
      timer = window.setTimeout(load, busy ? 8_000 : 30_000);
    };
    void load();
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [productId]);

  if (!state) return null;

  async function toggle() {
    if (!state) return;
    setBusy(true);
    try {
      const next = await setAutoResolve(productId, !state.enabled);
      setState(next);
      toast.success(next.enabled
        ? "Avto hal qilish yoqildi — tovar bloklansa Uzum botiga o'zi yozadi (ish vaqti 09:00–21:00)."
        : "Avto hal qilish o'chirildi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlab bo'lmadi");
    } finally {
      setBusy(false);
    }
  }

  async function saveTimes(next: string[]) {
    if (!state) return;
    setBusy(true);
    try {
      const saved = await setAutoResolve(productId, state.enabled, next);
      setState(saved);
      setTimes(null);
      toast.success(`Saqlandi: kuniga ${saved.times?.length ?? next.length} marta — ${(saved.times ?? next).join(", ")}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlab bo'lmadi");
    } finally {
      setBusy(false);
    }
  }

  async function sendAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    setBusy(true);
    try {
      setState(await answerAutoResolve(productId, answer.trim()));
      setAnswer("");
      toast.success("Javobingiz operatorga yuboriladi (bir necha daqiqada).");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuborib bo'lmadi");
    } finally {
      setBusy(false);
    }
  }

  const running = ACTIVE.has(state.status);
  return (
    <div className="mt-4 rounded-xl border p-3.5 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Bot className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Avto hal qilish</p>
          <p className="text-xs text-muted-foreground">
            Bloklansa Uzum botiga o&apos;zi yozadi, sababini bilib tuzatadi, operatorga isbot (tuzatilgan rasm) yuboradi va
            ochilguncha belgilangan vaqtlarda qayta so&apos;raydi.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={state.enabled}
          aria-label="Avto hal qilish"
          disabled={busy || (!state.connected && !state.enabled)}
          onClick={() => void toggle()}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
            state.enabled ? "bg-primary" : "bg-muted-foreground/30",
          )}
        >
          <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
            state.enabled ? "left-[22px]" : "left-0.5")} />
        </button>
      </div>
      {!state.connected && (
        <p className="mt-2 text-xs text-amber-700">
          Telegram hisobi ulanmagan — Integratsiyalar → Telegram bo&apos;limida ulang.
        </p>
      )}
      {state.enabled && (
        <div className="mt-2 space-y-1.5 text-xs">
          <p className={cn("flex items-center gap-1.5", state.status === "error" && "text-destructive")}>
            {running && <Loader2 className="size-3 animate-spin" />}
            {state.step || STATUS[state.status] || STATUS[""]}
            {!blocked && !state.status && " (hozir bloklanmagan)"}
            {state.updatedAt && <span className="text-muted-foreground">{` · ${formatDate(state.updatedAt)}`}</span>}
          </p>
          {state.fix && ["fixing", "fix_pending", "report_due"].includes(state.status) && (
            <AutoResolveProgress fix={state.fix} status={state.status} />
          )}
          {state.status === "needs_seller" && state.sellerQuestion && (
            <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5">
              <p>
                <span className="font-medium">Operator so&apos;rayapti: </span>
                {state.sellerQuestion}
              </p>
              <p className="text-muted-foreground">
                Javob kartochkada yo&apos;q — AI taxmin qilmadi (noto&apos;g&apos;ri javob kartochkani yana bloklatadi).
              </p>
              {state.sellerAnswer ? (
                <p><span className="text-muted-foreground">Javobingiz: </span>{state.sellerAnswer}</p>
              ) : (
                <form onSubmit={sendAnswer} className="flex gap-2">
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    maxLength={600}
                    placeholder="Masalan: to'plamda 24 dona"
                    className="h-9 min-w-0 flex-1 rounded-md border bg-background px-2.5 text-sm"
                    disabled={busy}
                  />
                  <button
                    type="submit"
                    disabled={busy || !answer.trim()}
                    className="h-9 shrink-0 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    Yuborish
                  </button>
                </form>
              )}
            </div>
          )}
          {state.reason && <p><span className="text-muted-foreground">Sabab: </span>{state.reason}</p>}
          {state.fixSummary && <p><span className="text-muted-foreground">Tuzatildi: </span>{state.fixSummary}</p>}
          {state.error && <p className="text-destructive">{state.error}</p>}
          <Schedule
            times={times ?? state.times ?? ["10:00", "16:00"]}
            nextSlotAt={state.nextSlotAt}
            dirty={times !== null}
            busy={busy}
            onChange={setTimes}
            onSave={(t) => void saveTimes(t)}
          />
          {state.transcript.length > 0 && (
            <details>
              <summary className="cursor-pointer text-muted-foreground">
                {`Yozishma (${state.transcript.length})`}
              </summary>
              <ul className="mt-1.5 space-y-1">
                {state.transcript.map((m, i) => (
                  <li key={i} className={cn("rounded-md px-2 py-1 whitespace-pre-wrap [overflow-wrap:anywhere]",
                    m.role === "me" ? "bg-primary/5" : "bg-muted")}>
                    <span className="font-medium">{`${WHO[m.role] || m.role}: `}</span>{m.text}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}


function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Kuniga necha marta va soat nechada operatorga YANGI suhbat boshlanadi
 * (Toshkent vaqti, 09:00–21:00 — bot ish vaqti). Ochiq suhbatdagi javoblar
 * va tuzatish hisoboti bu jadvalni kutmaydi.
 */
function Schedule({ times, nextSlotAt, dirty, busy, onChange, onSave }: {
  times: string[];
  nextSlotAt?: string;
  dirty: boolean;
  busy: boolean;
  onChange: (t: string[]) => void;
  onSave: (t: string[]) => void;
}) {
  const next = nextSlotAt ? new Date(nextSlotAt) : null;
  const label = next
    ? `${next.toDateString() === new Date().toDateString() ? "bugun" : "ertaga"} ${pad(next.getHours())}:${pad(next.getMinutes())}`
    : "";
  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{`Operatorga yozish: kuniga ${times.length} marta`}</p>
        {label && !dirty && <span className="text-muted-foreground">{`keyingisi — ${label}`}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {times.map((t, i) => (
          <span key={i} className="flex items-center gap-1">
            <input
              type="time"
              min="09:00"
              max="20:59"
              step={300}
              value={t}
              disabled={busy}
              onChange={(e) => onChange(times.map((x, j) => (j === i ? e.target.value : x)))}
              className="h-8 rounded-md border bg-background px-2 text-sm tabular-nums"
              aria-label={`${i + 1}-vaqt`}
            />
            {times.length > 1 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onChange(times.filter((_, j) => j !== i))}
                className="rounded px-1 text-muted-foreground hover:text-destructive"
                aria-label="Vaqtni olib tashlash"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {times.length < 6 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onChange([...times, "12:00"])}
            className="h-8 rounded-md border border-dashed px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            + vaqt
          </button>
        )}
        {dirty && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave(times)}
            className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            Saqlash
          </button>
        )}
      </div>
      <p className="text-muted-foreground">
        Toshkent vaqti, 09:00–21:00 oralig&apos;ida (Uzum qo&apos;llab-quvvatlash ish vaqti). Operator suhbat ichida
        javob yozsa yoki kartochka tuzatilsa — jadvalni kutmasdan darhol javob beriladi.
      </p>
    </div>
  );
}
