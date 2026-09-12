"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle, ArrowDownToLine, ArrowLeft, ArrowUpRight, Boxes, Check, Copy,
  History, LayoutGrid, Loader2, Megaphone, Package, PackagePlus, Radar, RefreshCw,
  ShoppingCart, Sparkles, TrendingUp, Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TopbarSlot } from "@/components/layout/topbar-slot";
import { BreakEvenCard } from "@/features/warehouse/components/break-even-card";
import { ChangeHistoryCard } from "@/features/warehouse/components/change-history-card";
import { ComplaintDialog } from "@/features/warehouse/components/complaint-dialog";
import { IntakeDialog } from "@/features/warehouse/components/intake-dialog";
import { MarketCard } from "@/features/warehouse/components/market-card";
import { ReturnsCard } from "@/features/warehouse/components/returns-card";
import { ProductGallery } from "@/features/warehouse/components/product-gallery";
import { ProductModerationCard } from "@/features/warehouse/components/product-moderation-card";
import { DetailIntakes, DetailSales } from "@/features/warehouse/components/detail-ledgers";
import { SiblingsCard } from "@/features/warehouse/components/siblings-card";
import { ProductStats } from "@/features/warehouse/components/product-stats";
import { UzumFactsCard } from "@/features/warehouse/components/uzum-facts-card";
import { PositionsBlock } from "@/features/seo/components/positions-block";
import { SeoAuditCard } from "@/features/seo/components/seo-audit-card";
import { FunnelCard } from "@/features/warehouse/components/funnel-card";
import { ProductInstagramCard } from "@/features/instagram/components/product-instagram-card";
import { ProductNetworksCard } from "@/features/social/components/product-networks-card";
import { AdVerdictCard } from "@/features/social/components/ad-verdict-card";
import { AiGenerationTray } from "@/features/products-ai/components/generation-tray";
import { ProductAiModal } from "@/features/products-ai/components/product-modal";
import { useAiDrafts } from "@/features/products-ai/use-drafts";
import { useDraftParam } from "@/features/products-ai/use-draft-param";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { ApiError, fetchProductDetail, regenerateProductUzum } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { useQueryState } from "@/lib/use-query-state";
import { cn } from "@/lib/utils";
import { useCan, useUserStore } from "@/stores/user-store";
import type { ProductDetail, WarehouseProduct } from "@/lib/types";
import styles from "@/features/warehouse/components/product-detail.module.css";

const SECTIONS = [
  { value: "umumiy", label: "Umumiy", Icon: LayoutGrid },
  { value: "savdo", label: "Savdo", Icon: ShoppingCart },
  { value: "bozor", label: "Bozor va SEO", Icon: Radar },
  { value: "reklama", label: "Reklama", Icon: Megaphone },
  { value: "tarix", label: "O‘zgarishlar tarixi", Icon: History },
];

export default function ProductDetailPageRoute() {
  const params = useParams<{ id: string }>();
  const activeShopId = useUserStore((state) => state.activeShopId);
  const workspaceId = useUserStore((state) => state.workspaceId);
  return (
    <React.Suspense fallback={<PageSkeleton />}>
      <ProductDetailPage key={`${workspaceId}:${activeShopId}:${params.id}`} id={Number(params.id)} />
    </React.Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Tovar ma’lumotlari yuklanmoqda">
      <Skeleton className="h-11 w-44 rounded-xl" />
      <div className="grid gap-5 rounded-2xl border p-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-11 w-44 rounded-xl" /></div>
      </div>
      <Skeleton className="h-28 rounded-2xl" />
    </div>
  );
}

function ProductDetailPage({ id }: { id: number }) {
  const [rawPeriod, setPeriod] = useQueryState("view", "daily");
  const [rawSection, setSection] = useQueryState("section", "umumiy");
  const section = SECTIONS.some((item) => item.value === rawSection) ? rawSection : "umumiy";
  const period = ["daily", "monthly", "yearly"].includes(rawPeriod) ? rawPeriod : "daily";
  const canSeeAi = useCan("products_ai.view");
  const { aiOpen, aiDraftId, setDraftParam, openAi } = useDraftParam();
  // Burchakdagi panel (`AiGenerationTray`) va bu sahifaning O'Z
  // tovari uchun fonda ishlayotgan qoralama — bir xil manba
  // (ombor jadvalidagi bilan BIR XIL hook), shuning uchun
  // qoralama holati sahifalar orasida qayta hisoblanmaydi.
  const drafts = useAiDrafts(canSeeAi);

  // "AI kartochka" — qoralama hali yo'q bo'lsa (§9.13): yangi
  // qoralama tovarning Uzum'dagi ma'lumotidan backfill qilib
  // fonda yaratiladi va to'liq AI quvuri darhol ishga tushadi.
  const handleEditAi = async (productId: number) => {
    setEditingAi(true);
    try {
      const { draftId } = await regenerateProductUzum(productId);
      openAi(draftId);
      // Ro'yxatni darhol yangilaymiz — aks holda yangi qoralama
      // modalning O'Z birinchi so'ragan pollashigacha (bir necha
      // soniya) burchakdagi panelda ko'rinmay turardi.
      void drafts.reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Tahrirlashni boshlab bo'lmadi.");
    } finally {
      setEditingAi(false);
    }
  };
  const [data, setData] = React.useState<ProductDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [intakeFor, setIntakeFor] = React.useState<WarehouseProduct | null>(null);
  const [editingAi, setEditingAi] = React.useState(false);
  const [complaintFor, setComplaintFor] = React.useState<number | null>(null);
  const requestVersion = React.useRef(0);
  const navigationRef = React.useRef<HTMLElement>(null);

  const load = React.useCallback(async () => {
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Tovar manzili noto‘g‘ri. Ombordan tovarni qayta tanlang.");
      setLoading(false);
      return;
    }
    const version = ++requestVersion.current;
    setLoading(true);
    try {
      const detail = await fetchProductDetail(id);
      if (version !== requestVersion.current) return;
      setData(detail);
      setError(null);
    } catch (failure) {
      if (version === requestVersion.current) setError(failure instanceof Error ? failure.message : "Tovar ma’lumotlarini yuklab bo‘lmadi.");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void load();
    return () => { requestVersion.current += 1; };
  }, [load]);
  useAutoRefresh(load);

  React.useEffect(() => {
    const navigation = navigationRef.current;
    if (!navigation) return;
    const reveal = () => {
      if (navigation.scrollWidth <= navigation.clientWidth) return;
      const button = navigation.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!button) return;
      const bounds = button.getBoundingClientRect();
      navigation.scrollTo({
        left: navigation.scrollLeft + bounds.left - navigation.getBoundingClientRect().left - (navigation.clientWidth - bounds.width) / 2,
        behavior: "instant",
      });
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(navigation);
    return () => observer.disconnect();
  }, [section, Boolean(data)]);

  const onUpdated = (detail: ProductDetail) => {
    requestVersion.current += 1;
    setData(detail);
    setError(null);
    setLoading(false);
  };

  // «Omborga qaytish» — sahifa ichida EMAS, yuqori qatorda
  // (foydalanuvchi so'rovi). U yerda u ilovaning doimiy burchagida
  // turadi va oq idishning ichidan butun bir qator joy yemaydi.
  // Uslub yuqori qatordagi boshqa boshqaruvlar bilan bir xil
  // (`air-control` + oq matn) — shisha ustida to'q tugma yamoqdek
  // ko'rinardi.
  //
  // Uchala holatda ham (skelet, xato, ma'lumot) ko'rinadi: qaytish
  // yo'li tovar ochilmaganda AYNIQSA kerak.
  const backLink = (
    <TopbarSlot>
      <Button asChild variant="outline" size="sm" className="air-control gap-2 text-white hover:text-white">
        <Link href="/warehouse" aria-label="Omborga qaytish">
          <ArrowLeft className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="hidden sm:inline">Omborga qaytish</span>
        </Link>
      </Button>
    </TopbarSlot>
  );

  if (loading && !data) return <>{backLink}<PageSkeleton /></>;

  if (!data) {
    return (
      <div className="space-y-5">
        {backLink}
        <div role="alert" className="rounded-2xl border bg-card px-5 py-12 text-center">
          <Package className="mx-auto size-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold">Tovar ochilmadi</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{error ?? "Tovar topilmadi."}</p>
          {Number.isSafeInteger(id) && id > 0 && <Button variant="outline" className="mt-5 min-h-11 rounded-xl" onClick={() => void load()}>Qayta urinish <RefreshCw /></Button>}
        </div>
      </div>
    );
  }

  const product = data.product;
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const profitPositive = data.totalProfit >= 0;
  const salesRows = period === "monthly" ? data.monthly : period === "yearly" ? data.yearly : data.daily;

  return (
    <div className={cn(styles.workspace, "min-w-0 space-y-5 sm:space-y-6")}>
      {backLink}

      {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-4 text-sm"><AlertCircle className="mt-0.5 size-5 shrink-0 text-[var(--warn)]" /><div><p className="font-medium">Ma’lumotlar yangilanmadi</p><p className="mt-1 text-muted-foreground">{error} Avvalgi ma’lumotlar ko‘rsatilmoqda.</p></div></div>}

      <section aria-label="Tovar haqida" className="grid min-w-0 gap-5 rounded-2xl border bg-card p-4 sm:gap-7 sm:p-6 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)]">
        <ProductGallery images={images} title={product.title} uzumUrl={product.uzumUrl} />
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary"><Package className="size-3.5" />{product.source === "uzum" ? "Uzum Market" : "Ombor tovari"}</span>
            <span className={cn("rounded-full border px-3 py-1.5 font-medium", product.uzumBlocked ? "border-destructive/20 bg-destructive/5 text-destructive" : "text-muted-foreground")}>
              {product.uzumBlocked ? "Bloklangan" : product.uzumModerationTitle || product.uzumStatusTitle || "Holat noma’lum"}
            </span>
          </div>
          <h1 className="mt-4 break-words text-xl font-semibold leading-snug tracking-tight sm:text-2xl xl:text-[1.7rem]">{product.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{[product.categoryName, product.variantName].filter(Boolean).join(" · ") || "Tovar ma’lumotlari"}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b pb-4">
            <ProductCode label="SKU" value={product.skuCode} />
            <ProductCode label="Shtrix-kod" value={product.barcode} />
          </div>
          <div className="mt-5 grid min-w-0 grid-cols-2 gap-3 sm:gap-5">
            <div className="min-w-0"><p className="text-xs text-muted-foreground">Uzumdagi narx</p><p className="mt-2 break-words text-lg font-semibold tracking-tight tabular-nums sm:text-2xl">{product.marketplacePrice != null ? formatSum(product.marketplacePrice) : "—"}</p><p className="mt-1 text-xs text-muted-foreground">{product.marketplaceStock != null ? `Uzum qoldig‘i: ${formatNumber(product.marketplaceStock)} dona` : "Uzum qoldig‘i ko‘rsatilmagan"}</p></div>
            <div className="min-w-0 border-l pl-3 sm:pl-5"><p className="text-xs text-muted-foreground">Hisobdagi qoldiq</p><p className="mt-2 text-lg font-semibold tracking-tight tabular-nums sm:text-2xl">{formatNumber(data.onHand)} <span className="text-sm font-normal text-muted-foreground">dona</span></p><p className="mt-1 break-words text-xs text-muted-foreground">Qiymati: {formatSum(data.stockValue)}</p></div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <Button className="min-h-11 flex-1 rounded-xl px-5 sm:flex-none" onClick={() => setIntakeFor(product)}><PackagePlus /> Kirim qo‘shish</Button>
            {canSeeAi && (() => {
              // Shu tovar uchun fonda ishlayotgan qoralama bo'lsa —
              // tugma jarayonga mos, progress bilan ko'rinadi
              // (foydalanuvchi so'rovi: qayta generatsiya
              // qilinayotgan tovar "boshqacharoq" ko'rinsin, oyna
              // yopiq bo'lsa ham). `aiDraftId` (holat yuklangandagi
              // bir martalik qiymat) dan USTUN — u ishlayotgan
              // quvurni bilmaydi.
              const productRegen = product.externalProductId
                ? drafts.runningByProduct.get(product.externalProductId)
                : undefined;
              if (productRegen) {
                return (
                  <Button
                    variant="outline"
                    className="min-h-11 flex-1 gap-2 rounded-xl border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary sm:flex-none"
                    onClick={() => openAi(productRegen.id)}
                  >
                    <Loader2 className="animate-spin" /> AI yangilamoqda · {productRegen.progress}%
                  </Button>
                );
              }
              if (data.aiDraftId != null) {
                return (
                  <Button variant="outline" className="min-h-11 flex-1 rounded-xl sm:flex-none" onClick={() => openAi(data.aiDraftId)}><Sparkles /> AI kartochka</Button>
                );
              }
              return (
                <Button
                  variant="outline"
                  className="min-h-11 flex-1 rounded-xl sm:flex-none"
                  disabled={editingAi}
                  onClick={() => handleEditAi(product.id)}
                >
                  {editingAi ? <Loader2 className="animate-spin" /> : <Sparkles />} Tahrirlash
                </Button>
              );
            })()}
          </div>
        </div>
      </section>

      <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryTile label="Jami keldi" value={formatNumber(data.totalIntakeQuantity)} unit="dona" note="Barcha kirim partiyalari" Icon={ArrowDownToLine} />
        <SummaryTile label="Jami sotildi" value={formatNumber(data.totalSoldQuantity)} unit="dona" note="Butun davr bo‘yicha" Icon={ShoppingCart} />
        <SummaryTile label="Uzum to‘lovi" value={formatSum(data.totalRevenue)} note="Butun davr bo‘yicha" Icon={Wallet} />
        <SummaryTile label={profitPositive ? "Sof foyda" : "Zarar"} value={formatSum(data.totalProfit)} note={`Tan narx (FIFO): ${formatSum(data.totalCogs)}`} Icon={TrendingUp} tone={profitPositive ? "positive" : "negative"} />
      </div>

      {data.uncoveredQuantity > 0 && <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-[var(--warn)]/25 bg-[var(--warn)]/5 p-4" role="status">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-[var(--warn)]" />
        <div className="min-w-0 flex-1 text-sm leading-relaxed"><p className="font-medium">{formatNumber(data.uncoveredQuantity)} dona sotuvga kirim yetishmaydi</p><p className="mt-1 text-muted-foreground">Bu qismning tan narxi foydadan ayrilmagan. Haqiqiy foyda ko‘rsatilganidan kamroq bo‘lishi mumkin.</p></div>
        <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => setIntakeFor(product)}>Kirim qo‘shish <ArrowUpRight /></Button>
      </div>}

      <nav ref={navigationRef} aria-label="Tovar bo‘limlari" className={styles.navigation}>
        {SECTIONS.map(({ value, label, Icon }) => (
          <button key={value} type="button" aria-pressed={section === value} aria-controls="product-detail-content" onClick={() => setSection(value)} className={cn(styles.sectionButton, section === value && styles.selected)}>
            <Icon className="size-4" />{label}
            {value === "umumiy" && product.uzumBlocked && <span aria-label="E’tibor kerak" className="size-1.5 rounded-full bg-destructive" />}
          </button>
        ))}
      </nav>

      <section id="product-detail-content" key={section} aria-label={SECTIONS.find((item) => item.value === section)?.label} className={cn(styles.content, "min-w-0 space-y-5")}>
        {section === "umumiy" && <>
          <ProductModerationCard data={data} onReload={load} onUpdated={onUpdated} onOpenAi={openAi} onComplaint={() => setComplaintFor(product.id)} canSeeAi={canSeeAi} />
          <BreakEvenCard productId={id} economics={data.economics} onApplied={load} />
          <DetailIntakes intakes={data.intakes} onAdd={() => setIntakeFor(product)} />
        </>}
        {section === "savdo" && <>
          <ProductStats productId={id} tempo={data.tempo} onHand={data.onHand} facts={data.marketplace} />
          <DetailSales rows={[...salesRows].reverse()} period={period} onPeriodChange={setPeriod} />
          <ReturnsCard returns={data.returns} summary={data.returnsSummary} />
        </>}
        {section === "bozor" && <>
          {/* Voronka SEO auditidan OLDIN: u "nega sotilmayapti"
              degan savolga birinchi javob beradi — tovar umuman
              ko'rinyaptimi. SEO audit esa matnni o'lchaydi. */}
          <FunnelCard productId={id} funnel={data?.funnel} />
          <SeoAuditCard productId={id} />
          <PositionsBlock productId={id} />
          <MarketCard productId={id} />
          <SiblingsCard siblings={data.siblings} tempo={data.tempo} />
          <UzumFactsCard facts={data.marketplace} />
        </>}
        {section === "reklama" && <>
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-card p-5">
            <div className="min-w-0"><h2 className="flex items-center gap-2 text-base font-semibold"><Megaphone className="size-4 text-primary" /> Tovarni targ‘ib qilish</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">E’lonlar va reklama natijalarini shu yerda boshqaring. Boshlash uchun ijtimoiy tarmoq akkauntingizni ulang.</p></div>
            <Button asChild variant="outline" className="min-h-11 rounded-xl"><Link href="/integrations">Ulanishlarni sozlash <ArrowUpRight /></Link></Button>
          </div>
          <AdVerdictCard productId={id} />
          <ProductNetworksCard product={product} />
          <ProductInstagramCard productId={id} />
        </>}
        {section === "tarix" && <ChangeHistoryCard productId={id} changeLogs={data.changeLogs ?? []} draftTextPushedAt={data.draftTextPushedAt ?? null} onReverted={load} />}
      </section>

      <ComplaintDialog productId={complaintFor} onOpenChange={(open) => { if (!open) setComplaintFor(null); }} />
      <IntakeDialog product={intakeFor} onOpenChange={(open) => { if (!open) setIntakeFor(null); }} onSaved={load} />
      {canSeeAi && (
        <ProductAiModal
          open={aiOpen}
          draftId={aiDraftId}
          onClose={() => setDraftParam(null)}
          onDraft={(fresh) => { drafts.upsert(fresh); void load(); }}
          onDeleted={() => { drafts.reload(); setDraftParam(null); void load(); }}
        />
      )}
      {canSeeAi && <AiGenerationTray rows={drafts.trayRows} onOpen={(draftId) => openAi(draftId)} />}
    </div>
  );
}

function ProductCode({ label, value }: { label: string; value: string | null }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);
  if (!value) return null;
  return (
    <div className="flex min-w-0 max-w-full items-center gap-2 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span><span className="min-w-0 break-all font-medium">{value}</span>
      <Button type="button" variant="ghost" className="size-11 shrink-0 rounded-xl text-muted-foreground" aria-label={`${label} nusxalash`} onClick={async () => {
        try { await navigator.clipboard.writeText(value); setCopied(true); toast.success(`${label} nusxalandi`); }
        catch { toast.error("Nusxalab bo‘lmadi. Kodni qo‘lda belgilang."); }
      }}>{copied ? <Check /> : <Copy />}</Button>
    </div>
  );
}

function SummaryTile({ label, value, unit, note, Icon, tone }: {
  label: string; value: string; unit?: string; note: string;
  Icon: typeof Boxes; tone?: "positive" | "negative";
}) {
  return (
    <div className={cn("min-w-0 rounded-2xl border bg-card p-3 sm:p-4", tone === "positive" && "border-[var(--ok)]/20 bg-[var(--ok)]/[.035]", tone === "negative" && "border-destructive/20 bg-destructive/[.035]")}>
      <div className="flex items-start justify-between gap-2 text-xs text-muted-foreground"><span>{label}</span><Icon className="hidden size-4 shrink-0 sm:block" /></div>
      <p className={cn("mt-3 break-words text-lg font-semibold leading-snug tracking-tight tabular-nums sm:text-xl", tone === "positive" && "text-[var(--ok)]", tone === "negative" && "text-destructive")}>{value}{unit && <span className="text-xs font-normal text-muted-foreground"> {unit}</span>}</p>
      <p className="mt-2 break-words text-[11px] leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}
