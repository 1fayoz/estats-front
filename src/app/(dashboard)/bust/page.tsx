"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { OctagonX, Rocket } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError, fetchBustCampaigns, fetchBustShop, updateBustCampaign,
  type BustCampaignRow, type BustShopRow,
} from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";

/**
 * Bust TOP — do'kon bo'yicha.
 *
 * Yuqorida: har tovar uchun o'lchangan tayyorlik va stavka shifti (beziyon CPM).
 * «Rejani ochish» tovar sahifasidagi «Bust TOP rejasi»ga olib boradi — u yerda
 * Uzum narxlari, AI kalit/minus so'zlar va yaratish.
 * Pastda: eStats orqali yaratilgan kampaniyalar — avto-rejim (faqat pulni tejaydigan
 * amallar o'zi), byudjet shifti va «To'xtatish» (kill switch).
 */
const STATUS = {
  ready: { text: "tayyor", cls: "text-[var(--ok)]" },
  warn: { text: "ehtiyot", cls: "text-[var(--warn)]" },
  blocked: { text: "mumkin emas", cls: "text-[var(--bad)]" },
} as const;

export default function BustPage() {
  const [rows, setRows] = React.useState<BustShopRow[] | null>(null);
  const [campaigns, setCampaigns] = React.useState<BustCampaignRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    fetchBustShop().then(setRows).catch((e: ApiError) => setError(e.message));
    fetchBustCampaigns().then(setCampaigns).catch(() => undefined);
  }, []);
  React.useEffect(load, [load]);

  const update = async (id: number, body: { autopilot?: boolean; maxWeeklyAmount?: number; stop?: boolean }) => {
    try {
      const row = await updateBustCampaign(id, body);
      setCampaigns((list) => list.map((c) => (c.id === id ? row : c)));
      toast.success(body.stop ? "Avto-rejim to'xtatildi" : "Saqlandi");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Rocket className="h-4 w-4" />Bust TOP — qaysi tovar foydali</CardTitle>
          <CardDescription>
            Stavka shifti — 1000 ko&apos;rsatish uchun beziyon narx: dona foydasi × (buyurtma ÷ ko&apos;rsatish) × 1000,
            Uzum voronkasidan. Uzum&apos;ning qidiruvdagi minimal stavkasi odatda 9 500 so&apos;m — shiftdan past bo&apos;lsa,
            reklama har ko&apos;rsatishda zarar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? <p className="text-[var(--bad)] text-sm">{error}</p> : null}
          {!rows && !error ? <Skeleton className="h-40 w-full" /> : null}
          {rows ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left text-xs">
                    <th className="p-2">Tovar</th>
                    <th className="p-2">Holat</th>
                    <th className="p-2 text-right">Shift (1000 ko&apos;rs.)</th>
                    <th className="p-2 text-right">Dona foydasi</th>
                    <th className="p-2 text-right">Sharh</th>
                    <th className="p-2 text-right">Qoldiq</th>
                    <th className="p-2 text-right">Nishon so&apos;z</th>
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.externalId} className="border-t align-top">
                      <td className="max-w-[320px] p-2">
                        <div className="truncate font-medium" title={r.title}>{r.title}</div>
                        {r.readiness.length ? (
                          <div className="text-muted-foreground text-xs">{r.readiness.map((x) => x.text).join(" · ")}</div>
                        ) : null}
                      </td>
                      <td className={`p-2 text-xs ${STATUS[r.status].cls}`}>{STATUS[r.status].text}</td>
                      <td className="p-2 text-right">
                        {r.bidCeiling != null ? (
                          <span className={r.bidCeiling >= 9500 ? "font-semibold text-[var(--ok)]" : ""}>
                            {formatNumber(r.bidCeiling)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-2 text-right">{r.unitProfit != null ? formatNumber(r.unitProfit) : "—"}</td>
                      <td className="p-2 text-right">{r.reviews ?? "—"}</td>
                      <td className="p-2 text-right">{r.onHand}</td>
                      <td className="p-2 text-right">{r.targets}</td>
                      <td className="p-2 text-right">
                        <Link className="text-primary text-xs underline-offset-2 hover:underline"
                              href={`/warehouse/${r.productId}` as Route}>Rejani ochish</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kampaniyalar va avto-rejim</CardTitle>
          <CardDescription>
            Avto-rejim faqat pulni tejaydigan amallarni o&apos;zi qiladi: shiftdan yuqori stavkani pasaytiradi, buyurtmasiz
            sarf bo&apos;layotgan so&apos;rovni minusga qo&apos;yadi (nishon so&apos;zni emas), qoldiq 0 bo&apos;lsa to&apos;xtatadi.
            Xarajatni oshirish — faqat sizning tasdig&apos;ingiz bilan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!campaigns.length ? (
            <p className="text-muted-foreground text-sm">
              Hali eStats orqali kampaniya yaratilmagan — tovar sahifasidagi «Bust TOP rejasi»dan yarating.
            </p>
          ) : null}
          {campaigns.map((c) => <CampaignRow key={c.id} c={c} onUpdate={update} />)}
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignRow({ c, onUpdate }: {
  c: BustCampaignRow;
  onUpdate: (id: number, body: { autopilot?: boolean; maxWeeklyAmount?: number; stop?: boolean }) => Promise<void>;
}) {
  const [cap, setCap] = React.useState(String(c.maxWeeklyAmount));
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{c.name}</span>
        {c.uzumCampaignId ? <Badge variant="outline">Uzum #{c.uzumCampaignId}</Badge> : null}
        <span className="text-muted-foreground text-xs">
          haftasiga {formatNumber(c.weeklyAmount)} so&apos;m · {formatDate(c.createdAt)}
        </span>
        {c.stoppedAt ? <Badge variant="destructive">to&apos;xtatilgan</Badge> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={c.autopilot} onChange={(e) => void onUpdate(c.id, { autopilot: e.target.checked })} />
          AI avto-rejim
        </label>
        <label className="flex items-center gap-2 text-xs">
          Byudjet shifti
          <Input className="h-8 w-32" type="number" value={cap} onChange={(e) => setCap(e.target.value)}
                 onBlur={() => Number(cap) !== c.maxWeeklyAmount && void onUpdate(c.id, { maxWeeklyAmount: Number(cap) })} />
        </label>
        <Button size="sm" variant="destructive" onClick={() => void onUpdate(c.id, { stop: true })}>
          <OctagonX className="h-3.5 w-3.5" />To&apos;xtatish
        </Button>
      </div>
      {c.actions.length ? (
        <ul className="text-muted-foreground space-y-1 text-xs">
          {c.actions.slice().reverse().map((a, i) => (
            <li key={i}>{formatDate(a.at)} · {a.action}{a.query ? ` «${a.query}»` : ""} — {a.why}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-xs">Avto-rejim hali hech narsa qilmagan.</p>
      )}
    </div>
  );
}
