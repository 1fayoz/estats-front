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
import {
  LEGAL_FORM_LABELS,
  market,
  type MarketSellerDetail,
  type MarketSellerRegistry,
} from "@/lib/market";

function formatJoinDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return `${formatDate(d)} ${d.getFullYear()}`;
}


/**
 * Ochiq reyestrdan olingan ma'lumot.
 *
 * NEGA ALOHIDA KARTA. Uzum sotuvchi haqida faqat nomini va STIRini
 * beradi; qolgani (kim egasi, nima bilan shug'ullanadi, qachondan
 * beri, faolmi) ochiq davlat reyestrida. Ikkisi ARALASHTIRILMAYDI:
 * manba boshqa, shuning uchun pastda havola va yangilangan sana
 * turadi — raqam qayerdan kelganini ko'rish mumkin bo'lsin.
 *
 * Reyestrda topilmagan maydon KO'RSATILMAYDI (tire ham qo'yilmaydi):
 * "ma'lumot yo'q" va "qiymat bo'sh" ikki xil narsa.
 */
function RegistryCard({ seller }: { seller: MarketSellerDetail["seller"] }) {
  const reg: MarketSellerRegistry = seller.registry ?? {};
  const rows: [string, React.ReactNode][] = [];
  const add = (label: string, value?: string | null) => {
    if (value) rows.push([label, value]);
  };

  add("Rasmiy nomi", reg.official_name);
  add("Qisqa nomi", reg.short_name);
  add("STIR", seller.tin ?? reg.tin);
  add("Reyestrdagi shakli", reg.legal_form_registry);
  add("Ro'yxatdan o'tgan", reg.registered_on ?? (seller.registered_on ?? undefined));
  add("Ro'yxatga oluvchi", reg.registrar);
  add("Faoliyat turi", reg.activity_name ? `${reg.activity_name}${reg.activity_code ? ` (IFUT ${reg.activity_code})` : ""}` : reg.activity);
  add("Ustav fondi", reg.charter_capital);
  add("Manzili", reg.address ?? (seller.address ?? undefined));
  add("Telefon", reg.phone ?? (seller.phone ?? undefined));
  add("Elektron pochta", reg.email);
  add("Rahbar", reg.director ?? (seller.director ?? undefined));
  add("Barqarorlik reytingi", reg.stability);
  add("Yirik soliq to'lovchi", reg.large_taxpayer);

  const founders = reg.founders ?? [];
  const marks = reg.trademarks ?? [];
  const empty = rows.length === 0 && founders.length === 0 && marks.length === 0;

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold">Yuridik shaxs ma&apos;lumoti</div>
          {reg._match === "name" && (
            // STIR Uzumda yo'q edi — yozuv firma NOMI bo'yicha
            // topilgan. Bu kuchsizroq dalil va yashirilmaydi.
            <Badge variant="warning">nom bo&apos;yicha topilgan</Badge>
          )}
        </div>
        {seller.status && (
          <Badge variant={/mavjud|yuritmoqda|ko'rsatmoqda/i.test(seller.status) ? "success" : "warning"}>
            {seller.status}
          </Badge>
        )}
      </div>

      {empty ? (
        <NoData>
          {seller.legal_form === "yatt" || seller.legal_form === "self_employed"
            ? "Bu sotuvchi jismoniy shaxs (YaTT / o'zini-o'zi band qilgan) — ochiq reyestrdan shaxsiy ma'lumot yig'ilmaydi."
            : seller.tin
              ? "Reyestrda hali topilmadi — navbatda turibdi yoki STIR yuridik shaxslar reyestrida yo'q."
              : "STIR aniqlanmagan, shuning uchun reyestrdan qidirib bo'lmaydi."}
        </NoData>
      ) : (
        <div className="rounded-xl border bg-card p-3.5">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 border-b border-dashed py-1 last:border-0">
                <dt className="shrink-0 text-muted-foreground">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>

          {founders.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <div className="mb-1.5 text-xs text-muted-foreground">Ta&apos;sischilar</div>
              <ul className="space-y-1 text-sm">
                {founders.map((f) => (
                  <li key={f.name} className="flex justify-between gap-3">
                    <span>{f.name}</span>
                    {f.share && <span className="air-num text-muted-foreground">{f.share}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {marks.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <div className="mb-1.5 text-xs text-muted-foreground">Savdo belgilari</div>
              <div className="flex flex-wrap gap-1.5">
                {marks.map((m) => (
                  <Badge key={m} variant="secondary">{m}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-[11px] text-muted-foreground">
            <span>
              Manba: ochiq davlat reyestri
              {seller.registry_synced_at ? ` · ${seller.registry_synced_at} holatiga` : ""}
              {seller.ogrnip && seller.tin && seller.ogrnip !== seller.tin
                ? ` · Uzumdagi raqam: ${seller.ogrnip}`
                : ""}
            </span>
            {seller.registry_url && (
              <a
                href={seller.registry_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Reyestrda ko&apos;rish
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
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

      <RegistryCard seller={detail.seller} />

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
