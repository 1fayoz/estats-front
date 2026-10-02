"use client";

/*
 * Butun AI ishlarining YAGONA almashtirgichi (§9.55): rasm, matn, tekshiruvlar,
 * joylash/tahrirlashdan oldingi tekshiruv, avto javob — hammasi shu rejimda.
 *   - «Brauzer» — serverdagi brauzerda sotuvchining Gemini/ChatGPT hisobi;
 *     limit/xato bo'lsa API kaliti zaxira;
 *   - «Aralash» — har AI o'z yo'li bilan (masalan Gemini brauzerda, OpenAI
 *     API'da), zaxirasiz: sotuvchi aniq tanlagan;
 *   - «API» — faqat kalitlar, brauzer ishlatilmaydi.
 *
 * Tanlov ostida — HOZIR qaysi ish qayerda bajariladi va u yo'l tayyormi
 * (hisob ulangan / kalit faol). Sotuvchi rejimni tanlab, natijasini darhol ko'radi.
 */

import * as React from "react";
import { AlertTriangle, Globe, KeyRound, Loader2, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { ApiError, fetchAiEngine, setAiEngine, type AiEngine, type AiWay } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Qaysi yo'l hozir haqiqatan ishlaydi: ulangan brauzer hisoblari soni va kalit holati. */
export type AiReadiness = { geminiWeb: number; chatgptWeb: number; geminiApi: boolean; openaiApi: boolean };

const MODES: { value: AiEngine; label: string; hint: string; icon: typeof Globe }[] = [
  { value: "web", label: "Brauzer", hint: "Hisobingiz orqali, bepul", icon: Globe },
  { value: "mixed", label: "Aralash", hint: "Har AI o‘z yo‘li bilan", icon: Shuffle },
  { value: "api", label: "API kalitlari", hint: "Tez, lekin pulli", icon: KeyRound },
];

const AIS: { key: "gemini" | "openai"; name: string; does: string; web: "geminiWeb" | "chatgptWeb"; api: "geminiApi" | "openaiApi" }[] = [
  { key: "gemini", name: "Gemini", does: "Rasm yasash, rasm tahlili, tekshiruv", web: "geminiWeb", api: "geminiApi" },
  { key: "openai", name: "ChatGPT", does: "Matn, SEO, MXIK, turkum", web: "chatgptWeb", api: "openaiApi" },
];

type Split = { gemini: AiWay; openai: AiWay };

/** Shu rejimda AI qaysi yo'l(lar)dan foydalanadi — birinchisi asosiy. */
function waysOf(engine: AiEngine, split: Split, ai: "gemini" | "openai"): AiWay[] {
  if (engine === "api") return ["api"];
  if (engine === "mixed") return [split[ai]];
  return ["web", "api"];
}

export function AiEngineSwitch({ readiness }: { readiness?: AiReadiness }) {
  const [engine, setEngine] = React.useState<AiEngine | null>(null);
  const [split, setSplit] = React.useState<Split>({ gemini: "web", openai: "api" });
  const [saving, setSaving] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchAiEngine()
      .then((r) => {
        setEngine(r.engine);
        if (r.engine === "mixed" && r.providers) setSplit(r.providers);
      })
      .catch(() => setEngine(null));
  }, []);

  const save = async (next: AiEngine, nextSplit: Split, tag: string) => {
    if (saving) return;
    setSaving(tag);
    try {
      const r = await setAiEngine(next, next === "mixed" ? nextSplit : undefined);
      setEngine(r.engine);
      if (r.engine === "mixed" && r.providers) setSplit(r.providers);
      toast.success(
        r.engine === "web" ? "AI endi brauzer orqali ishlaydi"
          : r.engine === "api" ? "AI endi API kalitlari orqali ishlaydi"
          : "Aralash rejim saqlandi",
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Rejim saqlanmadi");
    } finally {
      setSaving(null);
    }
  };

  const ready = (ai: (typeof AIS)[number], way: AiWay) =>
    !readiness ? true : way === "web" ? readiness[ai.web] > 0 : readiness[ai.api];
  const warnings = engine && readiness ? warningsOf(engine, split, readiness) : [];

  return (
    <section className="min-w-0 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">AI qanday ishlasin</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Rasm va matn yasash, tekshiruvlar, avto javob — hamma AI ishlari shu rejimda.</p>
        </div>
        <div className="inline-flex w-full rounded-xl border bg-muted/30 p-1 sm:w-auto" role="radiogroup" aria-label="AI rejimi">
          {MODES.map(({ value, label, hint, icon: Icon }) => {
            const on = engine === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={on}
                title={hint}
                disabled={engine === null}
                onClick={() => !on && void save(value, split, value)}
                className={cn(
                  "inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors sm:flex-none",
                  on ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {saving === value ? <Loader2 className="size-3.5 animate-spin" /> : <Icon className={cn("size-3.5", on && "text-primary")} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-3 divide-y rounded-xl border">
        {AIS.map((ai) => {
          const ways = engine ? waysOf(engine, split, ai.key) : [];
          const main = ways[0];
          const ok = main ? ready(ai, main) : false;
          const count = readiness ? readiness[ai.web] : 0;
          return (
            <li key={ai.key} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
              <span className={cn("size-2 shrink-0 rounded-full", !engine ? "bg-muted-foreground/40" : ok ? "bg-[var(--ok)]" : "bg-[var(--warn)]")} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{ai.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{ai.does}</p>
              </div>
              {engine === "mixed" ? (
                <div className="inline-flex rounded-lg border bg-background p-0.5" role="group" aria-label={`${ai.name} yo‘li`}>
                  {(["web", "api"] as const).map((way) => {
                    const on = split[ai.key] === way;
                    const tag = `${ai.key}:${way}`;
                    return (
                      <button
                        key={way}
                        type="button"
                        aria-pressed={on}
                        onClick={() => !on && void save("mixed", { ...split, [ai.key]: way }, tag)}
                        className={cn(
                          "inline-flex min-h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                          on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {saving === tag && <Loader2 className="size-3 animate-spin" />}
                        {way === "web" ? "Brauzer" : "API"}
                        {!ready(ai, way) && <span className={cn("size-1.5 rounded-full", on ? "bg-primary-foreground" : "bg-[var(--warn)]")} title="Ulanmagan yoki ishlamayapti" />}
                      </button>
                    );
                  })}
                </div>
              ) : engine ? (
                <span className="text-xs text-muted-foreground">
                  {ways.map((w, i) => (
                    <React.Fragment key={w}>
                      {i > 0 && <span className="mx-1">→</span>}
                      <span className={cn(i === 0 && "font-medium text-foreground", !ready(ai, w) && "line-through decoration-[var(--warn)]")}>
                        {w === "web" ? `Brauzer${count > 1 ? ` (${count} hisob)` : ""}` : "API"}
                      </span>
                    </React.Fragment>
                  ))}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {warnings.map((w) => (
            <p key={w} className="flex items-start gap-1.5 text-xs text-[var(--warn)]">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{w}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

/** Tanlangan rejimdagi xavflar — ish to'xtab qolmasidan oldin ko'rinsin. */
function warningsOf(engine: AiEngine, split: Split, r: AiReadiness): string[] {
  const out: string[] = [];
  for (const ai of AIS) {
    const ways = waysOf(engine, split, ai.key);
    const ok = ways.some((w) => (w === "web" ? r[ai.web] > 0 : r[ai.api]));
    if (!ok) {
      out.push(ways.includes("web")
        ? `${ai.name}: brauzer hisobi ulanmagan va API kaliti ishlamayapti — pastda hisob qo‘shing.`
        : `${ai.name}: API kaliti yo‘q yoki mablag‘ tugagan.`);
    }
  }
  // Rasm yasash — faqat Gemini (bepul ChatGPT rasm qabul qilmaydi).
  const imageWays = waysOf(engine, split, "gemini");
  if (!imageWays.some((w) => (w === "web" ? r.geminiWeb > 0 : r.geminiApi))) {
    out.push("Rasmlar faqat Gemini orqali yasaladi — hozir rasm yasalmaydi.");
  }
  return Array.from(new Set(out));
}
