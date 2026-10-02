"use client";

/*
 * Brauzer hisoblari (Gemini Web, ChatGPT Web) — har AI uchun XOHLAGANCHA hisob
 * (2026-10-02, sotuvchi talabi): «+» bilan qo'shiladi, har biri ixcham bitta
 * qator. Ish oiladagi BO'SHROQ hisobga ketadi (backend `router._balanced`),
 * ya'ni hisob qancha ko'p bo'lsa — rasm va matn shuncha parallel.
 *
 * Ikki oila BITTA komponent bilan chiziladi (`FamilyGroup`) — ilgari har hisob
 * uchun alohida katta karta va qattiq yozilgan «2-hisob» bor edi.
 */

import * as React from "react";
import {
  Bot,
  Loader2,
  MessageSquare,
  MonitorSmartphone,
  MoreHorizontal,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AI_FAMILY_NAME, aiAccountLabel, aiFamily, aiNumber, type AiFamily } from "@/lib/ai-accounts";
import { ApiError, addAiWebAccount, deleteAiWebAccount, startAiWebLogin, verifyAiWebAccount } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import type { AiWebAccountState } from "@/lib/types";
import { AiWebVncDialog } from "./ai-web-vnc-dialog";

const FAMILIES: { key: AiFamily; site: string; does: string; icon: typeof Sparkles }[] = [
  { key: "gemini_web", site: "gemini.google.com", does: "Rasm yasash, rasm tahlili va tekshiruv", icon: Sparkles },
  { key: "chatgpt_web", site: "chatgpt.com", does: "Matn, SEO, MXIK va turkum", icon: Bot },
];

const pad = (n: number) => String(n).padStart(2, "0");
const hm = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

type State = { tone: "ok" | "warn" | "bad" | "off"; text: string };

function stateOf(a: AiWebAccountState): State {
  const saved = Boolean(a.saved || (a.id > 0 && a.status !== "needs_auth"));
  if (a.limitResetsAt && new Date(a.limitResetsAt).getTime() > Date.now()) {
    return { tone: "warn", text: `Limit · ${a.limitExact ? "" : "≈ "}${hm(a.limitResetsAt)} da tiklanadi` };
  }
  if (a.status === "active") return { tone: "ok", text: "Ulangan" };
  if (a.status === "rate_limited") return { tone: "warn", text: "Vaqtincha limitda" };
  if (a.status === "captcha") return { tone: "bad", text: "Bot tekshiruvi — oynada o‘ting" };
  if (!saved) return { tone: "off", text: "Ulanmagan" };
  return { tone: "bad", text: a.lastError ? "Qayta kirish kerak" : "Ulanmagan" };
}

const DOT: Record<State["tone"], string> = {
  ok: "bg-[var(--ok)]",
  warn: "bg-[var(--warn)]",
  bad: "bg-[var(--bad)]",
  off: "bg-muted-foreground/40",
};

export function AiWebAccounts({ accounts, onChanged, onOpenSessions }: {
  accounts: AiWebAccountState[];
  onChanged: () => void | Promise<void>;
  /** `null` — tarix; hisob kaliti — shu hisob bilan «Sinov suhbati». */
  onOpenSessions: (provider: string | null) => void;
}) {
  const shopId = useUserStore((s) => s.activeShopId);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [vnc, setVnc] = React.useState<string | null>(null);
  const [forget, setForget] = React.useState<AiWebAccountState | null>(null);

  const openLogin = async (provider: string) => {
    if (!shopId) {
      toast.error("Avval do‘konni tanlang.");
      return;
    }
    const result = await startAiWebLogin(provider);
    if (result.status === "busy") {
      toast.error("Kirish oynasi hozir boshqa ulanish bilan band — biroz kutib qayta urining.");
      return;
    }
    if (result.status !== "ready") {
      toast.error(result.message || "Oynani ochib bo‘lmadi.");
      return;
    }
    setVnc(provider);
  };

  const run = async (tag: string, action: () => Promise<void>) => {
    if (busy) return;
    setBusy(tag);
    try {
      await action();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Amal bajarilmadi.");
    } finally {
      setBusy(null);
    }
  };

  const add = (family: AiFamily) => run(`add:${family}`, async () => {
    // Oilaning yagona hisobi hali ulanmagan bo'lsa — yangisini ochmaymiz, o'shani ulaymiz.
    const empty = accounts.find((a) => aiFamily(a.provider) === family && !a.saved && a.status !== "active");
    const key = empty ? empty.provider : (await addAiWebAccount(family)).provider;
    if (!empty) await onChanged();
    await openLogin(key);
  });

  const verify = (a: AiWebAccountState) => run(`verify:${a.provider}`, async () => {
    const res = await verifyAiWebAccount(a.provider);
    if (res.status === "active") toast.success(`${aiAccountLabel(a.provider)}: hisob ishlayapti`);
    else toast.error(res.lastError || `${aiAccountLabel(a.provider)}: hisob faol emas`);
    await onChanged();
  });

  const remove = (a: AiWebAccountState) => run(`delete:${a.provider}`, async () => {
    await deleteAiWebAccount(a.provider);
    setForget(null);
    toast.success(`${aiAccountLabel(a.provider)} olib tashlandi`);
    await onChanged();
  });

  return (
    <section className="min-w-0 rounded-2xl border bg-card">
      <header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <MonitorSmartphone className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Brauzer hisoblari</h3>
          <p className="text-xs text-muted-foreground">
            O‘z Gemini va ChatGPT hisobingiz — kalit puli ketmaydi. Hisob ko‘p bo‘lsa ish ular orasida bo‘linadi.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="min-h-9 rounded-xl text-xs" onClick={() => onOpenSessions(null)}>
          <MessageSquare className="size-3.5" /> Suhbatlar tarixi
        </Button>
      </header>

      <div className="grid min-w-0 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {FAMILIES.map((fam) => {
          const rows = accounts
            .filter((a) => aiFamily(a.provider) === fam.key)
            .sort((x, y) => aiNumber(x.provider) - aiNumber(y.provider));
          const live = rows.filter((a) => a.status === "active").length;
          const Icon = fam.icon;
          return (
            <div key={fam.key} className="min-w-0 p-3">
              <div className="flex items-center gap-2 px-1 pb-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {AI_FAMILY_NAME[fam.key]}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">{live} ta ulangan</span>
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{fam.does}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 rounded-xl"
                  aria-label={`${AI_FAMILY_NAME[fam.key]} hisobi qo‘shish`}
                  title="Hisob qo‘shish"
                  disabled={Boolean(busy)}
                  onClick={() => void add(fam.key)}
                >
                  {busy === `add:${fam.key}` ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                </Button>
              </div>

              <ul className="space-y-1">
                {rows.map((a) => (
                  <AccountRow
                    key={a.provider}
                    account={a}
                    busy={busy}
                    onLogin={() => void run(`vnc:${a.provider}`, () => openLogin(a.provider))}
                    onVerify={() => void verify(a)}
                    onChat={() => onOpenSessions(a.provider)}
                    onForget={() => setForget(a)}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="flex items-start gap-1.5 border-t px-4 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        Sayt oynada ochiladi — hisobingizga o‘zingiz kirasiz, parol eStats’da saqlanmaydi.
      </p>

      {shopId && vnc && (
        <AiWebVncDialog
          open
          onOpenChange={(open) => { if (!open) setVnc(null); }}
          provider={vnc}
          title={aiAccountLabel(vnc)}
          shopId={shopId}
          onConnected={() => void onChanged()}
        />
      )}

      <Dialog open={forget !== null} onOpenChange={(open) => { if (!open && !busy) setForget(null); }}>
        <DialogContent className="w-[calc(100%_-_2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="pr-8">{forget ? aiAccountLabel(forget.provider) : ""} olib tashlansinmi?</DialogTitle>
            <DialogDescription>
              Hisob va uning brauzer sessiyasi o‘chiriladi. Ishlab turgan AI vazifalari boshqa hisoblarga o‘tadi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="min-h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => setForget(null)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" className="min-h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => forget && void remove(forget)}>
              {busy?.startsWith("delete:") && <Loader2 className="size-4 animate-spin" />}
              Olib tashlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function AccountRow({ account, busy, onLogin, onVerify, onChat, onForget }: {
  account: AiWebAccountState;
  busy: string | null;
  onLogin: () => void;
  onVerify: () => void;
  onChat: () => void;
  onForget: () => void;
}) {
  const st = stateOf(account);
  const saved = Boolean(account.saved || account.id > 0);
  const connected = account.status === "active";
  const who = account.accountEmail || account.login || `${aiNumber(account.provider)}-hisob`;
  const working = busy?.endsWith(`:${account.provider}`);

  return (
    <li className="flex min-h-12 items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-muted/30">
      <span className={cn("size-2 shrink-0 rounded-full", DOT[st.tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm [overflow-wrap:anywhere]" title={who}>{who}</p>
        <p
          className={cn(
            "truncate text-[11px]",
            st.tone === "bad" ? "text-[var(--bad)]" : st.tone === "warn" ? "text-[var(--warn)]" : "text-muted-foreground",
          )}
          title={account.lastError || undefined}
        >
          {st.text}
        </p>
      </div>

      {!connected && (
        <Button size="sm" className="min-h-8 shrink-0 rounded-lg px-3 text-xs" disabled={Boolean(busy)} onClick={onLogin}>
          {busy === `vnc:${account.provider}` && <Loader2 className="size-3 animate-spin" />}
          {account.saved ? "Qayta kirish" : "Ulash"}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0 rounded-lg" aria-label={`${who}: amallar`}>
            {working && !busy?.startsWith("vnc:") ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem onSelect={onLogin} disabled={Boolean(busy)}>
            <MonitorSmartphone className="size-4" /> {connected ? "Oyna orqali qayta kirish" : "Oyna orqali kirish"}
          </DropdownMenuItem>
          {account.saved && (
            <DropdownMenuItem onSelect={onVerify} disabled={Boolean(busy)}>
              <RefreshCw className="size-4" /> Tekshirish
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={onChat} disabled={!connected}>
            <MessageSquare className="size-4" /> Sinov suhbati
          </DropdownMenuItem>
          {saved && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onForget} className="text-destructive focus:text-destructive">
                <Trash2 className="size-4" /> Olib tashlash
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
