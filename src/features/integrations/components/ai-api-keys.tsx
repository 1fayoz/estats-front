"use client";

/*
 * Rasmiy API kalitlari (Google AI Studio, OpenAI) — bitta ixcham karta:
 * har kalit uchun holat, JAMI sarf va balans (2026-10-02 — ilgari bu alohida
 * katta «AI yordamchilar» kartasida edi, kalitlar esa yana boshqa joyda).
 *
 * Haqiqiy balansni Gemini ham, OpenAI ham oddiy API kalitiga BERMAYDI
 * (prodda o'lchangan — backend `product_ai/ai_account.py`), shuning uchun:
 *   - «$0 · mablag' tugagan» — o'lchangan (generatsiya rad etildi);
 *   - «≈ $X» — sotuvchi kiritgan balans minus eStats sarfi (taxminiy);
 *   - sarf — faqat eStats orqali ketgan chaqiruvlar.
 */

import * as React from "react";
import { ExternalLink, ImageIcon, KeyRound, Loader2, RefreshCw, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ApiError, clearOpenAiKey, deleteAiKey, saveAiBalance, saveAiKey, saveOpenAiBalance, saveOpenAiKey,
} from "@/lib/api";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiAccountState, AiKeyState, OpenAiKeyState } from "@/lib/types";

type Provider = "gemini" | "openai";

const META: Record<Provider, { name: string; does: string; icon: typeof Sparkles; placeholder: string }> = {
  gemini: { name: "Google Gemini", does: "AI Studio kaliti", icon: Sparkles, placeholder: "AIza…" },
  openai: { name: "OpenAI", does: "Platform kaliti", icon: ImageIcon, placeholder: "sk-…" },
};

type Tone = "ok" | "warn" | "bad" | "off";

function statusOf(state: AiKeyState | OpenAiKeyState): { tone: Tone; text: string } {
  if (!state.configured) return { tone: "off", text: "Kalit yo‘q" };
  switch (state.account?.status) {
    case "active": return { tone: "ok", text: "Faol" };
    case "rate_limited": return { tone: "warn", text: "Faol · limitda" };
    case "no_credit": return { tone: "bad", text: "Mablag‘ tugagan" };
    case "spend_cap": return { tone: "warn", text: "Oylik chegara to‘lgan" };
    case "invalid": return { tone: "bad", text: "Kalit yaroqsiz" };
    default: return { tone: "off", text: "Kiritilgan" };
  }
}

const CHIP: Record<Tone, string> = {
  ok: "bg-[var(--ok)]/10 text-[var(--ok)]",
  warn: "bg-[var(--warn)]/10 text-[var(--warn)]",
  bad: "bg-[var(--bad)]/10 text-[var(--bad)]",
  off: "bg-muted text-muted-foreground",
};

/** Balans: o'lchangan nol, taxminiy qoldiq yoki noma'lum. */
function balanceOf(account?: AiAccountState | null): { text: string; hint?: string } {
  if (!account || account.status === "missing") return { text: "—" };
  if (account.status === "no_credit") return { text: formatUsd(0), hint: account.statusMessage ?? "Hisobda mablag‘ qolmagan" };
  if (account.balanceStale) return { text: "Yangilang", hint: "Kiritilgan balansdan ko‘proq sarflandi — kalit esa ishlayapti" };
  if (account.remainingUsd !== null) return { text: `≈ ${formatUsd(account.remainingUsd)}`, hint: "Kiritilgan balans minus eStats sarfi" };
  return { text: "Noma’lum", hint: "Provayder balansni API orqali bermaydi — o‘zingiz kiriting" };
}

export function AiApiKeys({ gemini, openai, onSaved, onRecheck, restricted }: {
  gemini?: AiKeyState | null;
  openai?: OpenAiKeyState | null;
  onSaved: () => void | Promise<void>;
  onRecheck: () => Promise<void>;
  restricted?: boolean;
}) {
  const [checking, setChecking] = React.useState(false);
  const tiles: [Provider, AiKeyState | OpenAiKeyState][] = [];
  if (gemini) tiles.push(["gemini", gemini]);
  if (openai) tiles.push(["openai", openai]);
  const canCheck = tiles.some(([, s]) => s.configured);

  return (
    <section className="min-w-0 rounded-2xl border bg-card">
      <header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <KeyRound className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Rasmiy API kalitlari</h3>
          <p className="text-xs text-muted-foreground">Tez, lekin har so‘rov pulli. Brauzer hisobi band yoki limitda bo‘lsa zaxira.</p>
        </div>
        {canCheck && (
          <Button
            variant="ghost"
            size="sm"
            className="min-h-9 rounded-xl text-xs"
            disabled={checking}
            onClick={async () => { setChecking(true); try { await onRecheck(); } finally { setChecking(false); } }}
          >
            <RefreshCw className={cn("size-3.5", checking && "animate-spin")} /> {checking ? "Tekshirilmoqda…" : "Tekshirish"}
          </Button>
        )}
      </header>

      {tiles.length ? (
        <div className="grid min-w-0 divide-y md:grid-cols-2 md:divide-x md:divide-y-0" aria-busy={checking}>
          {tiles.map(([provider, state]) => <KeyTile key={provider} provider={provider} state={state} onSaved={onSaved} />)}
        </div>
      ) : (
        <p className="px-4 py-4 text-sm text-muted-foreground">
          {restricted ? "AI kalitlarini boshqarish uchun hisob egasidan ruxsat so‘rang." : "AI kalitlari holati yuklanmadi. Qayta urinib ko‘ring."}
        </p>
      )}
    </section>
  );
}

function KeyTile({ provider, state, onSaved }: {
  provider: Provider; state: AiKeyState | OpenAiKeyState; onSaved: () => void | Promise<void>;
}) {
  const [dialog, setDialog] = React.useState<"key" | "balance" | null>(null);
  const meta = META[provider];
  const Icon = meta.icon;
  const st = statusOf(state);
  const account = state.account;
  const balance = balanceOf(account);
  const keyUrl = provider === "gemini" ? (state as AiKeyState).studioUrl : (state as OpenAiKeyState).platformUrl;

  return (
    <div className="min-w-0 p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{meta.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{meta.does}</p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", CHIP[st.tone])}>{st.text}</span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-xl bg-muted/30 px-3 py-2">
          <dt className="text-[11px] text-muted-foreground">Jami sarflangan</dt>
          <dd className="truncate text-base font-semibold tabular-nums">{account ? formatUsd(account.spentTotalUsd) : "—"}</dd>
          {account && <p className="truncate text-[11px] text-muted-foreground tabular-nums">bu oy {formatUsd(account.spentMonthUsd)}</p>}
        </div>
        <div className="min-w-0 rounded-xl bg-muted/30 px-3 py-2" title={balance.hint}>
          <dt className="text-[11px] text-muted-foreground">Balans</dt>
          <dd className={cn("truncate text-base font-semibold tabular-nums", account?.status === "no_credit" && "text-[var(--bad)]")}>{balance.text}</dd>
          {balance.hint && <p className="truncate text-[11px] text-muted-foreground">{balance.hint}</p>}
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button variant={state.configured ? "outline" : "default"} size="sm" className="min-h-9 rounded-xl text-xs" onClick={() => setDialog("key")}>
          <KeyRound className="size-3.5" /> {state.configured ? "Kalitni almashtirish" : "Kalit kiritish"}
        </Button>
        {state.configured && account && (
          <Button variant="outline" size="sm" className="min-h-9 rounded-xl text-xs" onClick={() => setDialog("balance")}>
            {account.balanceUsd !== null ? "Balansni o‘zgartirish" : "Balansni kiritish"}
          </Button>
        )}
        <Button asChild variant="ghost" size="sm" className="min-h-9 rounded-xl text-xs text-muted-foreground">
          <a href={account?.billingUrl || keyUrl} target="_blank" rel="noreferrer">Hisob <ExternalLink className="size-3" /></a>
        </Button>
      </div>

      <KeyDialog provider={provider} state={state} keyUrl={keyUrl} open={dialog === "key"} onOpenChange={(o) => setDialog(o ? "key" : null)} onSaved={onSaved} />
      {account && <BalanceDialog provider={provider} account={account} open={dialog === "balance"} onOpenChange={(o) => setDialog(o ? "balance" : null)} onChanged={onSaved} />}
    </div>
  );
}

const DIALOG = "w-[calc(100%-2rem)] max-w-md rounded-2xl [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center";

function KeyDialog({ provider, state, keyUrl, open, onOpenChange, onSaved }: {
  provider: Provider; state: AiKeyState | OpenAiKeyState; keyUrl: string;
  open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void | Promise<void>;
}) {
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState<"save" | "delete" | null>(null);
  const name = META[provider].name;
  React.useEffect(() => { if (open) setValue(""); }, [open]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !value.trim()) return;
    setBusy("save");
    try {
      // Backend kalitni kichik haqiqiy so'rov bilan tekshiradi: yaroqsiz yoki
      // mablag'siz kalit saqlanmaydi va sababi xato matnida keladi.
      await (provider === "gemini" ? saveAiKey(value.trim()) : saveOpenAiKey(value.trim()));
      toast.success(`${name} kaliti tekshirildi va saqlandi`);
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Kalit saqlanmadi. Qayta urinib ko‘ring.");
    } finally { setBusy(null); }
  };

  const remove = async () => {
    if (busy) return;
    setBusy("delete");
    try {
      await (provider === "gemini" ? deleteAiKey() : clearOpenAiKey());
      toast.success(`${name} kaliti o‘chirildi`);
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Kalit o‘chirilmadi.");
    } finally { setBusy(null); }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className={DIALOG}>
        <DialogHeader className="pr-8">
          <DialogTitle>{name} API kaliti</DialogTitle>
          <DialogDescription>Kalit saqlashdan oldin kichik haqiqiy so‘rov bilan tekshiriladi — ishlamaydigan kalit saqlanmaydi.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={save}>
          <div className="space-y-2">
            <Label htmlFor={`${provider}-api-key`}>{state.configured ? "Yangi kalit" : "Kalit"}</Label>
            <Input id={`${provider}-api-key`} type="password" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder={META[provider].placeholder} className="min-h-11 rounded-xl" value={value} onChange={(e) => setValue(e.target.value)} disabled={Boolean(busy)} autoFocus />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground"><ShieldCheck className="size-3.5" />Saqlangan kalit qayta ko‘rsatilmaydi</span>
              <a href={keyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">Kalit olish <ExternalLink className="size-3" /></a>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {state.configured ? (
              <Button type="button" variant="ghost" className="min-h-11 rounded-xl text-destructive hover:text-destructive" disabled={Boolean(busy)} onClick={() => void remove()}>
                {busy === "delete" ? <Loader2 className="animate-spin" /> : <Trash2 />} O‘chirish
              </Button>
            ) : <span />}
            <Button type="submit" className="min-h-11 rounded-xl" disabled={Boolean(busy) || !value.trim()}>
              {busy === "save" && <Loader2 className="animate-spin" />} {busy === "save" ? "Tekshirilmoqda…" : "Tekshirib saqlash"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BalanceDialog({ provider, account, open, onOpenChange, onChanged }: {
  provider: Provider; account: AiAccountState; open: boolean;
  onOpenChange: (open: boolean) => void; onChanged: () => void | Promise<void>;
}) {
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) setValue(account.balanceUsd !== null ? String(account.balanceUsd).replace(".", ",") : "");
  }, [open, account.balanceUsd]);

  const submit = async (usd: number | null) => {
    if (busy) return;
    setBusy(true);
    try {
      await (provider === "gemini" ? saveAiBalance(usd) : saveOpenAiBalance(usd));
      toast.success(usd === null ? "Balans o‘chirildi" : "Balans saqlandi");
      onOpenChange(false);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Balans saqlanmadi.");
    } finally { setBusy(false); }
  };

  const parsed = Number(value.trim().replace(/\s/g, "").replace(",", "."));
  const valid = value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className={DIALOG}>
        <DialogHeader className="pr-8">
          <DialogTitle>{META[provider].name} balansi</DialogTitle>
          <DialogDescription>Hisobingizdagi hozirgi balansni kiriting — shu paytdan eStats sarfi undan ayirilib, taxminiy qoldiq ko‘rsatiladi.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (valid) void submit(parsed); }}>
          <div className="space-y-2">
            <Label htmlFor={`${provider}-balance`}>Balans, $</Label>
            <Input id={`${provider}-balance`} inputMode="decimal" autoComplete="off" placeholder="10,00" className="min-h-11 rounded-xl" value={value} onChange={(event) => setValue(event.target.value)} disabled={busy} autoFocus />
            <a href={account.billingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline">Balansni hisobda ko‘rish <ExternalLink className="size-3" /></a>
          </div>
          <DialogFooter>
            {account.balanceUsd !== null && <Button type="button" variant="ghost" className="min-h-11 rounded-xl text-destructive hover:text-destructive" disabled={busy} onClick={() => void submit(null)}>O‘chirish</Button>}
            <Button type="submit" className="min-h-11 rounded-xl" disabled={busy || !valid}>{busy && <Loader2 className="animate-spin" />}Saqlash</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
