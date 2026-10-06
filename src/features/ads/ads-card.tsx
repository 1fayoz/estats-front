"use client";

import * as React from "react";
import { Megaphone, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, fetchAdReport, syncAdReport } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { AdReport } from "@/lib/types";

/**
 * Uzum «Buyurtmalarni ko'paytirish» (CPO) — kabinetdan o'qilgan holat.
 *
 * Raqamlar Uzum reklama voronkasining o'zi; xarajat CPO'da faqat buyurtma
 * bo'lganda yoziladi (buyurtmasiz kunda Uzum xarajat ko'rsatmaydi).
 * Komissiya beziyon DRR'dan yuqori bo'lsa «Bugun» sahifasi ogohlantiradi.
 */
export function AdsCard() {
  const [data, setData] = React.useState<AdReport | null>(null);
  const [hidden, setHidden] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setData(await fetchAdReport());
    } catch (err) {
      if (err instanceof ApiError && [403, 404, 405].includes(err.status)) setHidden(true);
      else setData(null);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (!data?.running) return;
    const t = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(t);
  }, [data?.running, load]);

  if (hidden || !data) return null;

  const sync = async () => {
    try {
      setData(await syncAdReport());
      toast.success("Uzum kabinetidan o'qilmoqda (~1 daqiqa)");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Boshlab bo'lmadi");
    }
  };

  const funnel = new Map(data.funnel.map((r) => [String(r.product_id), r]));
  const num = (v: unknown) => (v == null || v === "" ? "—" : formatNumber(Number(v)));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4" /> Uzum reklama (CPO)
            </CardTitle>
            <CardDescription>
              Kabinetdan o&apos;qilgan, oxirgi 30 kun
              {data.syncedAt ? ` · ${new Date(data.syncedAt).toLocaleString("ru-RU")}` : " · hali o'qilmagan"}.
              CPO'da to&apos;lov faqat buyurtma uchun: narx × komissiya %.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => void sync()} disabled={data.running}>
            <RefreshCw className={data.running ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />
            {data.running ? "O'qilmoqda…" : "Yangilash"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {data.error && <p className="text-amber-600 dark:text-amber-500">{data.error}</p>}
        {data.campaigns.length === 0 ? (
          <p className="text-muted-foreground">Kampaniya topilmadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-3 font-medium">Tovar</th>
                  <th className="py-1.5 pr-3 font-medium">Holat</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Komissiya</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Ko&apos;rsatish</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Klik</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Savat</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Buyurtma</th>
                  <th className="py-1.5 text-right font-medium">Xarajat</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.campaigns.map((c) => {
                  const f = funnel.get(String(c.productId));
                  return (
                    <tr key={c.id}>
                      <td className="max-w-[260px] truncate py-1.5 pr-3">
                        {c.productDetails?.title?.uz ?? c.productDetails?.title?.ru ?? c.productId}
                      </td>
                      <td className="py-1.5 pr-3">
                        <Badge variant={c.status === "ACTIVE" ? "default" : "secondary"}>
                          {c.status === "ACTIVE" ? "faol" : c.status === "PAUSED" ? "to'xtatilgan" : c.status}
                        </Badge>
                      </td>
                      <td className="py-1.5 pr-3 text-right">{c.commissionPercentage}%</td>
                      <td className="py-1.5 pr-3 text-right">{num(f?.impressions)}</td>
                      <td className="py-1.5 pr-3 text-right">{num(f?.clicks)}</td>
                      <td className="py-1.5 pr-3 text-right">{num(f?.atc)}</td>
                      <td className="py-1.5 pr-3 text-right">{num(f?.ordered)}</td>
                      <td className="py-1.5 text-right">{num(f?.spendings)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
