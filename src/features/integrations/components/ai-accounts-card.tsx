"use client";

/*
 * «AI yordamchilar» tabining bosh kartasi: har provayder uchun holat, qoldiq va sarf.
 *
 * Tuzilishi Uzum tabidagi «Ma'lumotlar yangilanishi» kartasi bilan BIR XIL
 * (sarlavha + o'ngda tugma + ichida `bg-muted/15` plitkalar): ilgari balans
 * alohida plitkalar qatori bo'lib sarlavhadan TEPADA turardi va sahifa
 * ierarxiyasini buzardi.
 *
 * Haqiqiy balansni Gemini ham, OpenAI ham oddiy API kalitiga BERMAYDI
 * (prodda o'lchangan — backend `product_ai/ai_account.py`). Shuning uchun
 * raqamlar uch xil manbadan va ular aralashtirilmaydi:
 *   - «Mablag‘ tugagan» — o'lchangan (generatsiya rad etildi), qoldiq aniq 0;
 *   - «≈ $X» — sotuvchi kiritgan balans minus eStats sarfi (taxminiy);
 *   - sarf qatori — faqat eStats orqali ketgan chaqiruvlar.
 */

import * as React from "react";
import { ExternalLink, ImageIcon, Loader2, Pencil, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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

const STATUS: Record<AiAccountState["status"], { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "Faol", variant: "success" },
  rate_limited: { label: "Faol · limitda", variant: "warning" },
  no_credit: { label: "Mablag‘ tugagan", variant: "destructive" },
  invalid: { label: "Kalit yaroqsiz", variant: "destructive" },
  error: { label: "Tekshirib bo‘lmadi", variant: "secondary" },
  missing: { label: "Kalit yo‘q", variant: "secondary" },
};

/** "2 daqiqa oldin" — `uzum-sync-card.tsx` dagi bilan bir xil ko'rinish. */
function ago(iso: string | null): string {
  if (!iso) return "";
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (Number.isNaN(minutes)) return "";
  if (minutes < 1) return "hozirgina";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.round(hours / 24)} kun oldin`;
}

function when(iso: string | null): string {
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

export function AiAccountsCard({ gemini, openai, onRecheck, onChanged }: Props) {
  const [checking, setChecking] = React.useState(false);
  const tiles = ([["gemini", gemini?.account], ["openai", openai?.account]] as const)
    .filter((entry): entry is readonly [Provider, AiAccountState] => Boolean(entry[1]));
  const canCheck = tiles.some(([, account]) => account.status !== "missing");

  const recheck = async () => {
    if (checking) return;
    setChecking(true);
    try { await onRecheck(); } finally { setChecking(false); }
  };

  return (
    <article className="min-w-0 rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rounded-xl bg-primary/10 p-3 text-primary"><Sparkles className="size-5" /></span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">AI yordamchilar</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tovar kartochkalarini tezroq tayyorlang.</p>
          </div>
        </div>
        {canCheck && (
          <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => void recheck()} disabled={checking}>
            <RefreshCw className={cn("size-3.5", checking && "animate-spin")} />
            {checking ? "Tekshirilmoqda…" : "Kalitlarni tekshirish"}
          </Button>
        )}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Gemini matn va xususiyatlar bilan, OpenAI esa tovar rasmlari bilan yordam beradi. Har bir xizmat alohida API kaliti orqali ulanadi.</p>

      {tiles.length > 0 && (
        <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2" aria-busy={checking}>
          {tiles.map(([provider, account]) => (
            <AccountTile key={provider} provider={provider} account={account} onChanged={onChanged} />
          ))}
        </div>
      )}
    </article>
  );
}

function AccountTile({ provider, account, onChanged }: {
  provider: Provider; account: AiAccountState; onChanged: () => void | Promise<void>;
}) {
  const [editing, setEditing] = React.useState(false);
  const Icon = provider === "gemini" ? Sparkles : ImageIcon;
  const status = STATUS[account.status] ?? STATUS.error;
  const missing = account.status === "missing";
  const bad = account.status === "no_credit" || account.status === "invalid";

  let amount = "Noma’lum";
  let caption = "Provayder qoldiqni API orqali bermaydi — hisobingizdagi balansni kiriting.";
  if (missing) { amount = "—"; caption = "Kalit kiritilmagan."; }
  else if (account.status === "no_credit") { amount = formatUsd(0); caption = account.statusMessage ?? "Hisobda mablag‘ qolmagan."; }
  else if (account.remainingUsd !== null) {
    amount = `≈ ${formatUsd(account.remainingUsd)}`;
    caption = `${formatUsd(account.balanceUsd ?? 0)} kiritilgan (${when(account.balanceSetAt)}) — undan eStats sarfi ayriladi.`;
  } else if (account.status !== "active" && account.statusMessage) {
    caption = account.statusMessage;
  }

  const checked = ago(account.checkedAt);

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-muted/15 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground"><Icon className="size-4" /></span>
          <span className="truncate text-sm font-medium">{NAME[provider]}</span>
        </span>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">Qoldiq</p>
        <p className={cn("break-words text-xl font-semibold tracking-tight tabular-nums", account.status === "no_credit" && "text-destructive")}>{amount}</p>
        <p className={cn("text-xs leading-relaxed", bad ? "text-destructive" : "text-muted-foreground")}>{caption}</p>
      </div>

      <div className="mt-auto space-y-3 border-t pt-3">
        <dl className="grid grid-cols-3 gap-2 text-xs">
          {([["Bugun", account.spentTodayUsd], ["Bu oy", account.spentMonthUsd], ["Jami", account.spentTotalUsd]] as const).map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 truncate text-sm font-medium tabular-nums">{formatUsd(value)}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs leading-relaxed text-muted-foreground">eStats orqali sarflangan{checked ? ` · tekshirildi ${checked}` : ""}</p>
        <div className="flex flex-wrap gap-2">
          {!missing && (
            <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => setEditing(true)}>
              <Pencil /> {account.balanceUsd !== null ? "Balansni o‘zgartirish" : "Balansni kiritish"}
            </Button>
          )}
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <a href={account.billingUrl} target="_blank" rel="noreferrer">Hisobni ochish <ExternalLink /></a>
          </Button>
        </div>
      </div>

      <BalanceDialog provider={provider} account={account} open={editing} onOpenChange={setEditing} onChanged={onChanged} />
    </div>
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
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center">
        <DialogHeader className="pr-8">
          <DialogTitle>{NAME[provider]} balansi</DialogTitle>
          <DialogDescription>Hisobingizdagi hozirgi balansni kiriting. Shu paytdan boshlab eStats orqali ketgan sarf undan ayirilib, taxminiy qoldiq ko‘rsatiladi.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (valid) void submit(parsed); }}>
          <div className="space-y-2">
            <Label htmlFor={`${provider}-balance`}>Balans, $</Label>
            <Input id={`${provider}-balance`} inputMode="decimal" autoComplete="off" placeholder="10,00" className="min-h-11 rounded-xl" value={value} onChange={(event) => setValue(event.target.value)} disabled={busy} />
            <a href={account.billingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline">Balansni hisobda ko‘rish <ExternalLink className="size-3" /></a>
          </div>
          <DialogFooter>
            {account.balanceUsd !== null && <Button type="button" variant="ghost" className="min-h-11 rounded-xl text-destructive hover:text-destructive" disabled={busy} onClick={() => void submit(null)}>O‘chirish</Button>}
            <Button type="submit" className="min-h-11 rounded-xl" disabled={busy || !valid}>{busy && <Loader2 className="motion-safe:animate-spin" />}Saqlash</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
