"use client";

import * as React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StateBanner } from "@/features/market/state-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Failed, Loading, NoData, PeriodPicker, usePeriod } from "@/features/market/shared";
import { formatCompact, formatDate, formatNumber } from "@/lib/format";
import { LEGAL_FORM_LABELS, market, type MarketPage, type MarketSeller } from "@/lib/market";

function formatJoinDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return `${formatDate(d)} ${d.getFullYear()}`;
}

const ORDER_LABELS: Record<string, string> = {
  revenue: "Tushum bo'yicha",
  shops: "Do'konlar soni bo'yicha",
  orders: "Buyurtmalar bo'yicha",
  joined: "Qo'shilgan sana bo'yicha",
};

const PAGE_SIZE = 24;

export default function MarketSellersPage() {
  const days = usePeriod();
  const [q, setQ] = React.useState("");
  const [legalForm, setLegalForm] = React.useState<string>("all");
  const [minShops, setMinShops] = React.useState<string>("");
  const [order, setOrder] = React.useState<"revenue" | "shops" | "orders" | "joined">("revenue");
  const [limit, setLimit] = React.useState(PAGE_SIZE);
  const [data, setData] = React.useState<MarketPage<MarketSeller> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    const timer = setTimeout(() => {
      market
        .sellers({
          days,
          q: q || undefined,
          legal_form: legalForm === "all" ? undefined : legalForm,
          min_shops: minShops ? Number(minShops) : undefined,
          order,
          limit,
        })
        .then(setData)
        .catch((e) => setError(e.message));
    }, 350);
    return () => clearTimeout(timer);
  }, [days, q, legalForm, minShops, order, limit]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sotuvchilar"
        description="Bitta yuridik shaxs bir nechta do'kon ochishi mumkin — bu ko'rinish ularni birlashtirib ko'rsatadi."
        actions={<PeriodPicker />}
      />
      <StateBanner />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Sotuvchi yoki do'kon nomi…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select value={legalForm} onValueChange={setLegalForm}>
          <SelectTrigger className="h-10 w-48">
            <SelectValue placeholder="Yuridik shakl" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hammasi</SelectItem>
            {Object.entries(LEGAL_FORM_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={1}
          placeholder="Kamida N do'kon"
          value={minShops}
          onChange={(e) => setMinShops(e.target.value)}
          className="w-40"
        />
        <Select value={order} onValueChange={(v) => setOrder(v as typeof order)}>
          <SelectTrigger className="h-10 w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ORDER_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {data && <span className="text-xs text-muted-foreground">{formatNumber(data.total)} sotuvchi</span>}
      </div>

      {error ? (
        <Failed message={error} />
      ) : !data ? (
        <Loading />
      ) : data.items.length === 0 ? (
        <NoData>
          Sotuvchilar hali sinxronlanmagan — do'kon aniqlanganidan keyin uning yuridik
          shaxsi kunma-kun navbat bilan aniqlanadi (§ «Bozor → Ma'lumot manbai»).
        </NoData>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((s) => (
              <Link
                key={s.seller_id}
                href={`/market/sellers/${s.seller_id}`}
                className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                <div
                  className="h-16 w-full bg-muted bg-cover bg-center"
                  style={s.banner ? { backgroundImage: `url(${s.banner})` } : undefined}
                />
                <div className="-mt-6 flex items-end gap-2.5 px-3.5">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted">
                    {s.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Building2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 p-3.5 pt-2">
                  <div className="truncate font-medium group-hover:text-primary" title={s.title || s.flagship_shop || ""}>
                    {s.title || s.flagship_shop || `Sotuvchi #${s.seller_id}`}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {s.legal_form && (
                      <Badge variant="secondary">{LEGAL_FORM_LABELS[s.legal_form] ?? s.legal_form}</Badge>
                    )}
                    <Badge variant="outline">{s.shops} do&apos;kon</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <div className="text-muted-foreground">Tushum ({days} kun)</div>
                      <div className="air-num font-semibold">{formatCompact(s.revenue)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Buyurtmalar</div>
                      <div className="air-num font-semibold">{formatNumber(s.orders_total)}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Uzumda {formatJoinDate(s.joined_at)}dan beri{s.joined_is_estimate ? " (taxminiy)" : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data.items.length < data.total && (
            <div className="flex justify-center pt-1">
              <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                Yana ko&apos;rsatish
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
