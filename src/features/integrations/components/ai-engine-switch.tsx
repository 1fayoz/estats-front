"use client";

/*
 * Butun AI ishlarining YAGONA almashtirgichi (§9.55): rasm, matn, tekshiruvlar,
 * joylash/tahrirlashdan oldingi tekshiruv, avto javob — hammasi shu rejimda.
 *   - «API» — Google AI Studio / OpenAI kalitlari (pulli, tez);
 *   - «Brauzer» — serverdagi brauzerda sotuvchining Gemini/ChatGPT hisobi
 *     (Uzum'ga joylash kabi, «Oyna orqali kirish» bilan ulanadi).
 * «Brauzer» rejimida limit/xato bo'lsa API kaliti zaxira; «API» rejimida brauzer umuman ishlatilmaydi.
 */

import * as React from "react";
import { Globe, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, fetchAiEngine, setAiEngine, type AiEngine } from "@/lib/api";
import { cn } from "@/lib/utils";

const OPTIONS: { value: AiEngine; label: string; hint: string; icon: typeof Globe }[] = [
  { value: "web", label: "Brauzer (Gemini / ChatGPT hisobi)", hint: "Serverdagi brauzerda, sizning hisobingiz bilan — kalit puli ketmaydi.", icon: Globe },
  { value: "api", label: "API kalitlari", hint: "Google AI Studio va OpenAI kalitlari orqali — tez, lekin pulli.", icon: KeyRound },
];

export function AiEngineSwitch() {
  const [engine, setEngine] = React.useState<AiEngine | null>(null);
  const [saving, setSaving] = React.useState<AiEngine | null>(null);

  React.useEffect(() => {
    fetchAiEngine().then((r) => setEngine(r.engine)).catch(() => setEngine(null));
  }, []);

  const choose = async (value: AiEngine) => {
    if (value === engine || saving) return;
    setSaving(value);
    try {
      const r = await setAiEngine(value);
      setEngine(r.engine);
      toast.success(r.engine === "web" ? "AI endi brauzer orqali ishlaydi" : "AI endi API kalitlari orqali ishlaydi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Rejim saqlanmadi");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-sm font-semibold">AI qanday ishlasin</div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Rasm va matn yasash, joylashdan oldingi tekshiruv, avto javob — hamma AI ishlari shu rejimda.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {OPTIONS.map(({ value, label, hint, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => void choose(value)}
            disabled={engine === null}
            className={cn(
              "flex min-h-11 items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
              engine === value ? "border-primary bg-primary/5" : "hover:bg-muted/30",
            )}
          >
            {saving === value ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" /> : <Icon className={cn("mt-0.5 size-4 shrink-0", engine === value ? "text-primary" : "text-muted-foreground")} />}
            <span>
              <span className="block text-sm font-medium">{label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
