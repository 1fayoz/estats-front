"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Failed, Loading, NoData, PeriodPicker, usePeriod } from "@/features/market/shared";
import { formatCompact, formatDate, formatNumber } from "@/lib/format";
import { LEGAL_FORM_LABELS, market, type MarketSellerDetail } from "@/lib/market";

function formatJoinDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return `${formatDate(d)} ${d.getFullYear()}`;
}

export default function MarketSellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const days = usePeriod();
  const [detail, setDetail] = React.useState<MarketSellerDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    setDetail(null);
    market.sellerDetail(Number(id), days).then(setDetail).catch((e) => setError(e.message));
  }, [id, days]);

  if (error) return <Failed message={error} />;
  if (!detail) return <Loading />;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/market/sellers"><ArrowLeft className="h-3.5 w-3.5" /> Sotuvchilarga qaytish</Link>
      </Button>

      <PageHeader
        title={detail.seller.title || `Sotuvchi #${detail.seller.seller_id}`}
        description={
          detail.seller.legal_form
            ? LEGAL_FORM_LABELS[detail.seller.legal_form] ?? detail.seller.legal_form
            : detail.seller.tin
              ? `STIR: ${detail.seller.tin}`
              : "Yuridik shakli aniqlanmagan"
        }
        actions={<PeriodPicker />}
      />

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {[
          ["Do'konlar", formatNumber(detail.totals.shops)],
          ["Tushum", formatCompact(detail.totals.revenue)],
          ["Sotuv, dona", formatNumber(detail.totals.units)],
          ["Uzumda", `${formatJoinDate(detail.totals.joined_at)}dan beri`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card p-3.5">
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="air-num mt-0.5 text-lg font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <section className="space-y-2.5">
        <div className="font-semibold">Do&apos;konlari</div>
        {detail.shops.length === 0 ? (
          <NoData>Bu sotuvchining do&apos;koni topilmadi.</NoData>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {detail.shops.map((shop) => (
              // Tashqi <div>, ICHKI <Link>: pastdagi "Uzumda ko'rish"
              // haqiqiy <a> — ikkalasini bitta <Link> (o'zi <a> bo'lib
              // chiqadi) ichiga solish HTML'da <a> ichida <a> bo'lib,
              // hydratsiya xatosi berardi (brauzerda ko'rilgan).
              <div
                key={shop.shop_id}
                className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                <Link href={`/market/shops/${shop.shop_id}`}>
                  <div
                    className="h-16 w-full bg-muted bg-cover bg-center"
                    style={shop.banner ? { backgroundImage: `url(${shop.banner})` } : undefined}
                  />
                  <div className="-mt-6 flex items-end gap-2.5 px-3.5">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted">
                      {shop.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={shop.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 p-3.5 pt-2 pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-medium group-hover:text-primary">{shop.title}</div>
                      {shop.official && <Badge variant="info">Rasmiy</Badge>}
                    </div>
                    {shop.description && (
                      <div className="line-clamp-2 text-xs text-muted-foreground">{shop.description}</div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <div className="text-muted-foreground">Tushum ({days} kun)</div>
                        <div className="air-num font-semibold">{formatCompact(shop.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Buyurtmalar</div>
                        <div className="air-num font-semibold">{formatNumber(shop.orders_total)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {shop.rating != null ? `⭐ ${formatNumber(Number(shop.rating.toFixed(1)))}` : "Reyting yo'q"}
                        {" · "}
                        {formatNumber(shop.reviews)} sharh
                      </span>
                      {shop.registered_at && <span>{formatJoinDate(shop.registered_at)}dan beri</span>}
                    </div>
                  </div>
                </Link>
                {shop.url && (
                  <div className="p-3.5 pt-2">
                    <a
                      href={shop.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Uzumda ko&apos;rish
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
