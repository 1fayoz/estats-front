"use client";

/*
 * Rasmiy API kalitlari (Google AI Studio, OpenAI) — veb-hisob kartalari OSTIDA,
 * ixcham, sukut bo'yicha YOPIQ (sotuvchi talabi, 2026-09-30): asosiy yo'l —
 * brauzerdagi hisob, kalitlar esa kamdan-kam ochiladigan sozlama. Sarlavhada
 * ikkala kalitning holati ko'rinadi — ochmasdan ham bilinadi.
 */

import * as React from "react";
import { ChevronDown, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiKeyState, OpenAiKeyState } from "@/lib/types";
import { AiProviderCard } from "./ai-provider-card";

function keyLabel(state?: AiKeyState | OpenAiKeyState | null): { text: string; tone: "ok" | "bad" | "muted" } {
  if (!state?.configured) return { text: "kalit yo'q", tone: "muted" };
  const st = state.account?.status;
  if (st === "no_credit") return { text: "mablag' tugagan", tone: "bad" };
  if (st === "invalid") return { text: "yaroqsiz", tone: "bad" };
  if (st === "spend_cap") return { text: "oylik chegara", tone: "bad" };
  if (st === "active" || st === "rate_limited") return { text: "faol", tone: "ok" };
  return { text: "kiritilgan", tone: "muted" };
}

function Chip({ name, state }: { name: string; state?: AiKeyState | OpenAiKeyState | null }) {
  const l = keyLabel(state);
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
      l.tone === "ok" ? "bg-[var(--ok)]/10 text-[var(--ok)]" : l.tone === "bad" ? "bg-[var(--bad)]/10 text-[var(--bad)]" : "bg-muted text-muted-foreground",
    )}>
      {name}: {l.text}
    </span>
  );
}

export function AiApiKeys({ gemini, openai, onSaved, restricted }: {
  gemini?: AiKeyState | null;
  openai?: OpenAiKeyState | null;
  onSaved: () => void | Promise<void>;
  restricted?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  return (
    <div className="rounded-2xl border bg-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full flex-wrap items-center gap-2 px-4 py-2.5 text-left"
      >
        <KeyRound className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium">Rasmiy API kalitlari</span>
        <span className="flex flex-wrap gap-1.5">
          <Chip name="Gemini" state={gemini} />
          <Chip name="OpenAI" state={openai} />
        </span>
        <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id} className="border-t p-3">
          {gemini || openai ? (
            <div className="grid min-w-0 gap-3 lg:grid-cols-2">
              {gemini && <AiProviderCard compact provider="gemini" state={gemini} onSaved={onSaved} />}
              {openai && <AiProviderCard compact provider="openai" state={openai} onSaved={onSaved} />}
            </div>
          ) : (
            <p className="px-1 py-2 text-sm text-muted-foreground">
              {restricted ? "AI kalitlarini boshqarish uchun hisob egasidan ruxsat so‘rang." : "AI xizmatlari holati yuklanmadi. Qayta urinib ko‘ring."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
