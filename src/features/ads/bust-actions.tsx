"use client";

import * as React from "react";
import { Check, ClipboardCheck, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  changeBustCampaign, decideBustAction, markBustActionDone,
  type BustAction, type BustCampaignRow, type BustChangeInput,
} from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";

/**
 * Bust kampaniyasi amallari jurnali va boshqaruvi.
 *
 * * «Tasdiq kutmoqda» — xarajatni oshiruvchi taklif: avto-rejim uni HECH QACHON
 *   o'zi bajarmaydi, faqat sotuvchi «Tasdiqlash» bosganda.
 * * «Kabinetda bajaring» — Uzum'ga yozish yo'li hali o'lchanmagan: aniq ko'rsatma
 *   chiqadi, sotuvchi kabinetda qilib «Bajardim» bosadi.
 */
const ACTION_UZ: Record<string, string> = {
  lower_bid: "Stavkani pasaytirish",
  raise_bid: "Stavkani oshirish",
  suggest_raise: "Stavkani oshirish (taklif)",
  add_minus: "Minus so'z",
  pause: "To'xtatish",
  resume: "Qayta yoqish",
  lower_budget: "Byudjetni kamaytirish",
  raise_budget: "Byudjetni oshirish",
};

const STATUS_UZ: Record<string, { text: string; cls: string }> = {
  pending_approval: { text: "tasdiq kutmoqda", cls: "border-[var(--warn)] text-[var(--warn)]" },
  manual: { text: "kabinetda bajaring", cls: "border-[var(--warn)] text-[var(--warn)]" },
  executing: { text: "bajarilmoqda", cls: "" },
  executed: { text: "Uzum'da bajarildi", cls: "border-[var(--ok)] text-[var(--ok)]" },
  done: { text: "qo'lda bajarildi", cls: "border-[var(--ok)] text-[var(--ok)]" },
  rejected: { text: "rad etildi", cls: "text-muted-foreground" },
  failed: { text: "xato — qo'lda bajaring", cls: "border-[var(--bad)] text-[var(--bad)]" },
};

export function BustActions({ campaign, onChange }: {
  campaign: BustCampaignRow;
  onChange: (row: BustCampaignRow) => void;
}) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const run = async (key: string, fn: () => Promise<{ campaign: BustCampaignRow; action: BustAction }>) => {
    setBusy(key);
    try {
      const res = await fn();
      onChange(res.campaign);
      const st = res.action.status;
      toast.success(st === "manual" ? "Navbatga qo'yildi — kabinetda bajaring (ko'rsatma pastda)" : "Saqlandi");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const actions = campaign.actions.slice().reverse();
  const open = actions.filter((a) => a.status === "pending_approval" || a.status === "manual" || a.status === "failed");
  const closed = actions.filter((a) => !open.includes(a));

  return (
    <div className="space-y-3">
      <ChangeForm campaign={campaign} busy={busy === "change"}
                  onSubmit={(body) => run("change", () => changeBustCampaign(campaign.id, body))} />
      {open.length ? (
        <ul className="space-y-2">
          {open.map((a) => (
            <li key={a.id ?? a.at} className="space-y-1 rounded-md border border-[var(--warn)]/50 p-2 text-xs">
              <ActionLine a={a} />
              {a.instructions ? <p className="bg-muted rounded p-2">{a.instructions}</p> : null}
              {a.error ? <p className="text-[var(--bad)]">{a.error}</p> : null}
              {a.id ? (
                <div className="flex flex-wrap gap-2">
                  {a.status === "pending_approval" ? (
                    <>
                      <Button size="sm" disabled={busy !== null}
                              onClick={() => run(a.id!, () => decideBustAction(campaign.id, a.id!, "approve"))}>
                        <Check className="h-3.5 w-3.5" />Tasdiqlash
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy !== null}
                              onClick={() => run(a.id!, () => decideBustAction(campaign.id, a.id!, "reject"))}>
                        <X className="h-3.5 w-3.5" />Rad etish
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" disabled={busy !== null}
                            onClick={() => run(a.id!, () => markBustActionDone(campaign.id, a.id!))}>
                      <ClipboardCheck className="h-3.5 w-3.5" />Bajardim
                    </Button>
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {closed.length ? (
        <ul className="text-muted-foreground space-y-1 text-xs">
          {closed.slice(0, 15).map((a, i) => <li key={a.id ?? i}><ActionLine a={a} /></li>)}
        </ul>
      ) : !open.length ? (
        <p className="text-muted-foreground text-xs">Avto-rejim hali hech narsa qilmagan.</p>
      ) : null}
    </div>
  );
}

function ActionLine({ a }: { a: BustAction }) {
  const st = a.status ? STATUS_UZ[a.status] : null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span>{formatDate(a.at)}</span>
      <span className="font-medium">{ACTION_UZ[a.action] ?? a.action}</span>
      {a.query ? <span>«{a.query}»</span> : null}
      {a.words?.length ? <span>{a.words.map((w) => `«${w}»`).join(", ")}</span> : null}
      {a.value ? <span>→ {formatNumber(a.value)} so&apos;m</span> : null}
      {st ? <Badge variant="outline" className={st.cls}>{st.text}</Badge> : null}
      {a.kind === "increase" ? <Badge variant="outline">xarajat oshadi</Badge> : null}
      <span>— {a.why}</span>
      {a.by ? <span className="opacity-70">({a.by})</span> : null}
    </div>
  );
}

function ChangeForm({ campaign, busy, onSubmit }: {
  campaign: BustCampaignRow;
  busy: boolean;
  onSubmit: (body: BustChangeInput) => void;
}) {
  const [kind, setKind] = React.useState<BustChangeInput["kind"]>("bid");
  const [query, setQuery] = React.useState("");
  const [value, setValue] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);

  const body = (): BustChangeInput | null => {
    if (kind === "pause" || kind === "resume") return { kind, confirm: true };
    if (kind === "minus") {
      const words = query.split(",").map((w) => w.trim()).filter(Boolean);
      return words.length ? { kind, words, confirm: true } : null;
    }
    const v = Number(value);
    if (!(v > 0)) return null;
    return kind === "bid" ? (query.trim() ? { kind, query: query.trim(), value: v, confirm: true } : null)
      : { kind, value: v, confirm: true };
  };
  const ready = body();

  return (
    <div className="flex flex-wrap items-end gap-2 text-xs">
      <label className="flex flex-col gap-1">
        O&apos;zgartirish
        <select className="h-8 rounded-md border bg-transparent px-2" value={kind}
                onChange={(e) => { setKind(e.target.value as BustChangeInput["kind"]); setConfirming(false); }}>
          <option value="bid">Stavka</option>
          <option value="budget">Haftalik byudjet</option>
          <option value="minus">Minus so&apos;z</option>
          <option value="pause">To&apos;xtatish</option>
          <option value="resume">Qayta yoqish</option>
        </select>
      </label>
      {kind === "bid" || kind === "minus" ? (
        <Input className="h-8 w-48" placeholder={kind === "bid" ? "so'rov" : "so'zlar, vergul bilan"}
               value={query} onChange={(e) => setQuery(e.target.value)} />
      ) : null}
      {kind === "bid" || kind === "budget" ? (
        <Input className="h-8 w-32" type="number" placeholder={kind === "bid" ? "CPM, so'm" : `≤ ${campaign.maxWeeklyAmount}`}
               value={value} onChange={(e) => setValue(e.target.value)} />
      ) : null}
      {confirming ? (
        <>
          <span className="text-[var(--warn)]">Reklama xarajatiga ta&apos;sir qiladi. Ishonchingiz komilmi?</span>
          <Button size="sm" disabled={busy || !ready} onClick={() => { if (ready) onSubmit(ready); setConfirming(false); }}>
            Ha, o&apos;zgartirish
          </Button>
          <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>Bekor</Button>
        </>
      ) : (
        <Button size="sm" variant="outline" disabled={busy || !ready} onClick={() => setConfirming(true)}>Yuborish</Button>
      )}
    </div>
  );
}
