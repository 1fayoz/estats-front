"use client";

/*
 * Butun AI ishlarining YAGONA almashtirgichi (§9.55): rasm, matn, tekshiruvlar,
 * joylash/tahrirlashdan oldingi tekshiruv, avto javob — hammasi shu rejimda.
 *   - «Brauzer» — serverdagi brauzerda sotuvchining Gemini/ChatGPT hisobi
 *     (Uzum'ga joylash kabi); limit/xato bo'lsa API kaliti zaxira;
 *   - «Aralash» — har AI o'z yo'li bilan (masalan Gemini brauzerda, OpenAI
 *     API'da), zaxirasiz: sotuvchi aniq tanlagan;
 *   - «API» — faqat kalitlar, brauzer ishlatilmaydi.
 */

import * as React from "react";
import { AlertTriangle, Globe, KeyRound, Loader2, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { ApiError, fetchAiEngine, setAiEngine, type AiEngine, type AiWay } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Qaysi yo'l hozir haqiqatan ishlaydi (hisob ulangan / kalit faol). */
export type AiReadiness = { geminiWeb: boolean; chatgptWeb: boolean; geminiApi: boolean; openaiApi: boolean };

const MODES: { value: AiEngine; label: string; hint: string; icon: typeof Globe }[] = [
  { value: "web", label: "Brauzer", hint: "Gemini va ChatGPT hisobingiz — kalit puli ketmaydi. Limit bo'lsa API kaliti zaxira.", icon: Globe },
  { value: "mixed", label: "Aralash", hint: "Har AI o'z yo'li bilan: biri brauzerda, biri API'da.", icon: Shuffle },
  { value: "api", label: "API kalitlari", hint: "Faqat Google AI Studio va OpenAI kalitlari — tez, lekin pulli.", icon: KeyRound },
];

const AIS: { key: "gemini" | "openai"; name: string; web: keyof AiReadiness; api: keyof AiReadiness }[] = [
  { key: "gemini", name: "Google Gemini", web: "geminiWeb", api: "geminiApi" },
  { key: "openai", name: "ChatGPT / OpenAI", web: "chatgptWeb", api: "openaiApi" },
];

type Split = { gemini: AiWay; openai: AiWay };

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

  const warnings = engine === "mixed" && readiness ? mixedWarnings(split, readiness) : [];

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-sm font-semibold">AI qanday ishlasin</div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Rasm va matn yasash, joylashdan oldingi tekshiruv, avto javob — hamma AI ishlari shu rejimda.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {MODES.map(({ value, label, hint, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => value !== engine && void save(value, split, value)}
            disabled={engine === null}
            aria-pressed={engine === value}
            className={cn(
              "flex min-h-11 items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
              engine === value ? "border-primary bg-primary/5" : "hover:bg-muted/30",
            )}
          >
            {saving === value
              ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" />
              : <Icon className={cn("mt-0.5 size-4 shrink-0", engine === value ? "text-primary" : "text-muted-foreground")} />}
            <span>
              <span className="block text-sm font-medium">{label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
            </span>
          </button>
        ))}
      </div>

      {engine === "mixed" && (
        <div className="mt-3 space-y-2 rounded-xl border bg-muted/15 p-3">
          {AIS.map((ai) => (
            <div key={ai.key} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">{ai.name}</span>
              <div className="inline-flex rounded-lg border bg-background p-0.5" role="group" aria-label={`${ai.name} yo'li`}>
                {(["web", "api"] as const).map((way) => {
                  const on = split[ai.key] === way;
                  const ready = readiness ? readiness[way === "web" ? ai.web : ai.api] : true;
                  const tag = `${ai.key}:${way}`;
                  return (
                    <button
                      key={way}
                      type="button"
                      aria-pressed={on}
                      onClick={() => !on && void save("mixed", { ...split, [ai.key]: way }, tag)}
                      className={cn(
                        "inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
                        on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {saving === tag && <Loader2 className="size-3 animate-spin" />}
                      {way === "web" ? "Brauzer" : "API"}
                      {!ready && <span className={cn("size-1.5 rounded-full", on ? "bg-primary-foreground" : "bg-[var(--warn)]")} title="Ulanmagan yoki ishlamayapti" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {warnings.map((w) => (
            <p key={w} className="flex items-start gap-1.5 text-xs text-[var(--warn)]">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/** Aralash tanlovdagi xavflar — sotuvchi saqlashdan oldin ko'rsin. */
function mixedWarnings(split: Split, r: AiReadiness): string[] {
  const out: string[] = [];
  for (const ai of AIS) {
    const way = split[ai.key];
    const ok = r[way === "web" ? ai.web : ai.api];
    if (!ok) {
      out.push(`${ai.name}: ${way === "web" ? "brauzer hisobi ulanmagan — pastda «Oyna orqali kirish»" : "API kaliti yo'q yoki mablag' tugagan"}.`);
    }
  }
  // Rasm yasash va rasm tekshiruvi — faqat Gemini (bepul ChatGPT rasm qabul qilmaydi).
  if (split.gemini === "api" && !r.geminiApi) {
    out.push("Rasmlar Gemini orqali yasaladi — Gemini API ishlamasa rasm yasalmaydi.");
  }
  return out;
}
