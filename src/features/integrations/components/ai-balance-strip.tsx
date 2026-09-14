"use client";

/*
 * AI yordamchilar tabining tepasi: har provayder uchun holat, qoldiq va sarf.
 *
 * Haqiqiy balansni Gemini ham, OpenAI ham oddiy API kalitiga BERMAYDI
 * (prodda o'lchangan — backend `product_ai/ai_account.py` izohiga q.).
 * Shuning uchun raqamlar uch xil manbadan va ular aralashtirilmaydi:
 *   - «Mablag' tugagan» — o'lchangan (generatsiya rad etildi), qoldiq aniq 0;
 *   - «≈ $X» — sotuvchi kiritgan balans minus eStats sarfi (taxminiy);
 *   - sarf qatori — faqat eStats orqali ketgan chaqiruvlar.
 */

import * as React from "react";
import { ExternalLink, ImageIcon, Loader2, Pencil, RefreshCw, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError, saveAiBalance, saveOpenAiBalance } from "@/lib/api";
import { formatDate, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiAccountState, AiKeyState, OpenAiKeyState } from "@/lib/types";

type Provider = "gemini" | "openai";

const NAME: Record<Provider, string> = { gemini: "Google Gemini", openai: "OpenAI" };

const STATUS: Record<AiAccountState["status"], { label: string; tone: string }> = {
  active: { label: "Faol", tone: "bg-[var(--ok)]/10 text-[var(--ok)]" },
  rate_limited: { label: "Faol · limitda", tone: "bg-[var(--warn)]/10 text-[var(--warn)]" },
  no_credit: { label: "Mablag‘ tugagan", tone: "bg-[var(--bad)]/10 text-[var(--bad)]" },
  invalid: { label: "Kalit yaroqsiz", tone: "bg-[var(--bad)]/10 text-[var(--bad)]" },
  error: { label: "Tekshirib bo‘lmadi", tone: "bg-muted text-muted-foreground" },
  missing: { label: "Kalit yo‘q", tone: "bg-muted text-muted-foreground" },
};

function clock(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${formatDate(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type Props = {
  gemini: AiKeyState | null;
  openai: OpenAiKeyState | null;
  onRecheck: () => Promise<void>;
  onChanged: () => void | Promise<void>;
};

export function AiBalanceStrip({ gemini, openai, onRecheck, onChanged }: Props) {
  const [checking, setChecking] = React.useState(false);
  const tiles = ([["gemini", gemini?.account], ["openai", openai?.account]] as const)
    .filter((entry): entry is readonly [Provider, AiAccountState] => Boolean(entry[1]));
  if (!tiles.length) return null;

  const recheck = async () => {
    if (checking) return;
    setChecking(true);
    try { await onRecheck(); } finally { setChecking(false); }
  };

  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      {tiles.map(([provider, account]) => (
        <BalanceTile key={provider} provider={provider} account={account} checking={checking} onRecheck={recheck} onChanged={onChanged} />
      ))}
    </div>
  );
}

function BalanceTile({ provider, account, checking, onRecheck, onChanged }: {
  provider: Provider; account: AiAccountState; checking: boolean;
  onRecheck: () => Promise<void>; onChanged: () => void | Promise<void>;
}) {
  const [editing, setEditing] = React.useState(false);
  const Icon = provider === "gemini" ? Sparkles : ImageIcon;
  const status = STATUS[account.status] ?? STATUS.error;
  const missing = account.status === "missing";
  const noCredit = account.status === "no_credit";
  const known = account.remainingUsd !== null;

  let amount = "Noma’lum";
  let caption = "Provayder qoldiqni API orqali bermaydi — hisobingizdagi balansni kiriting, eStats sarfni o‘zi ayirib boradi.";
  if (missing) { amount = "—"; caption = "Kalit kiritilmagan."; }
  else if (noCredit) { amount = formatUsd(0); caption = account.statusMessage ?? "Hisobda mablag‘ qolmagan."; }
  else if (known) {
    amount = `≈ ${formatUsd(account.remainingUsd ?? 0)}`;
    caption = `Taxminiy: ${formatUsd(account.balanceUsd ?? 0)} (${clock(account.balanceSetAt)}) − eStats sarfi.`;
  } else if (account.status !== "active" && account.statusMessage) {
    caption = account.statusMessage;
  }

  return (
    <article className="min-w-0 rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span><span className="truncate">{NAME[provider]}</span></span>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", status.tone)}>{status.label}</span>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Wallet className="size-3.5" />Qoldiq</p>
      <p className={cn("mt-1 text-3xl font-semibold tracking-tight tabular-nums", noCredit && "text-[var(--bad)]")}>{amount}</p>
      <p className={cn("mt-1 min-h-8 text-xs leading-relaxed", noCredit || account.status === "invalid" ? "text-[var(--bad)]" : "text-muted-foreground")}>{caption}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-xs">
        {[["Bugun", account.spentTodayUsd], ["Bu oy", account.spentMonthUsd], ["Jami", account.spentTotalUsd]].map(([label, value]) => (
          <div key={label as string} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="mt-0.5 truncate font-medium tabular-nums">{formatUsd(value as number)}</dd></div>
        ))}
      </dl>
      <p className="mt-1 text-[11px] text-muted-foreground">eStats orqali sarflangan{account.checkedAt ? ` · tekshirildi ${clock(account.checkedAt)}` : ""}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {!missing && <Button variant="secondary" size="sm" className="min-h-9 rounded-xl" onClick={() => setEditing(true)}><Pencil /> {account.balanceUsd !== null ? "Balansni o‘zgartirish" : "Balansni kiritish"}</Button>}
        <Button asChild variant="outline" size="sm" className="min-h-9 rounded-xl"><a href={account.billingUrl} target="_blank" rel="noreferrer">Hisobni ochish <ExternalLink /></a></Button>
        {!missing && <Button variant="ghost" size="sm" className="min-h-9 rounded-xl" disabled={checking} onClick={() => void onRecheck()} aria-label="Kalitni qayta tekshirish">{checking ? <Loader2 className="motion-safe:animate-spin" /> : <RefreshCw />}<span className="hidden sm:inline">Tekshirish</span></Button>}
      </div>

      <BalanceDialog provider={provider} account={account} open={editing} onOpenChange={setEditing} onChanged={onChanged} />
    </article>
  );
}

function BalanceDialog({ provider, account, open, onOpenChange, onChanged }: {
  provider: Provider; account: AiAccountState; open: boolean;
  onOpenChange: (open: boolean) => void; onChanged: () => void | Promise<void>;
}) {
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) setValue(account.balanceUsd !== null ? String(account.balanceUsd) : "");
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

  const parsed = Number(value.replace(",", "."));
  const valid = value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
        <DialogHeader className="pr-8">
          <DialogTitle>{NAME[provider]} balansi</DialogTitle>
          <DialogDescription>Hisobingizdagi hozirgi balansni kiriting. Shu paytdan boshlab eStats orqali ketgan sarf undan ayirilib, taxminiy qoldiq ko‘rsatiladi.</DialogDescription>
        </DialogHeader>
        <form className="space-y-2" onSubmit={(event) => { event.preventDefault(); if (valid) void submit(parsed); }}>
          <Label htmlFor={`${provider}-balance`}>Balans, $</Label>
          <Input id={`${provider}-balance`} inputMode="decimal" autoComplete="off" placeholder="10,00" className="min-h-11 rounded-xl" value={value} onChange={(event) => setValue(event.target.value)} disabled={busy} />
          <a href={account.billingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline">Balansni hisobda ko‘rish <ExternalLink className="size-3" /></a>
          <DialogFooter className="pt-2">
            {account.balanceUsd !== null && <Button type="button" variant="ghost" className="min-h-11 rounded-xl text-destructive hover:text-destructive" disabled={busy} onClick={() => void submit(null)}>O‘chirish</Button>}
            <Button type="submit" className="min-h-11 rounded-xl" disabled={busy || !valid}>{busy && <Loader2 className="motion-safe:animate-spin" />}Saqlash</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
