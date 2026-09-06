"use client";

import * as React from "react";
import { AlertTriangle, Boxes, Headphones, Info, Package, Plus, RefreshCw, Search, Wallet, X } from "lucide-react";
import { toast } from "sonner";

import { InventoryHeader, InventoryStat } from "@/features/warehouse/components/inventory-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductTable } from "@/features/warehouse/components/product-table";
import { SupportRequestDialog } from "@/features/warehouse/components/support-request-dialog";
import { IntakeDialog } from "@/features/warehouse/components/intake-dialog";
import { DraftStrip } from "@/features/products-ai/components/draft-strip";
import { ProductAiModal } from "@/features/products-ai/components/product-modal";
import { useAiDrafts } from "@/features/products-ai/use-drafts";
import { useDraftParam } from "@/features/products-ai/use-draft-param";
import { useWarehouseProducts } from "@/features/warehouse/store";
import { useActiveShop, useCan } from "@/stores/user-store";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { formatNumber, formatSum } from "@/lib/format";
import { bulkAutoFixProductsUzum, bulkCheckProductsUzum, fetchProducts } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { WarehouseProduct } from "@/lib/types";

// ── Uzum sotuvchi kabineti holat-tablari ──────────────────────
type StatusTab =
  | "all" | "selling" | "ending" | "not_selling"
  | "blocked" | "moderation" | "resubmitted" | "re_moderation"
  | "attrs" | "archived";

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "selling", label: "Sotuvda" },
  { key: "ending", label: "Tugayapti" },
  { key: "not_selling", label: "Sotuvda emas" },
  { key: "blocked", label: "Bloklangan" },
  { key: "moderation", label: "Moderatsiyada" },
  // Ikkalasi ham "moderation"ning ICHIDA (kesishadi) — sotuvchiga
  // "nega qayta moderatsiyada?" degan savolga aniq javob kerak: xato
  // tuzatilganmi (avval bloklangan edi) yoki tirik kartochka o'zi
  // tahrirlanganmi (bloklanmagan, tasdiqlangan edi).
  { key: "resubmitted", label: "Tuzatildi → qayta yuborildi" },
  { key: "re_moderation", label: "Tahrirlandi → qayta moderatsiyada" },
  { key: "attrs", label: "Xususiyat to'ldirilmagan" },
  { key: "archived", label: "Arxiv" },
];

//: "Tugayapti" — Uzum ham shunga o'xshash kam qoldiqni ajratadi.
const ENDING_STOCK = 5;

function isBlocked(i: WarehouseProduct): boolean {
  return (
    i.uzumBlocked ||
    i.uzumStatusValue === "BLOCKED" ||
    i.uzumStatusValue === "SKU_BLOCKED" ||
    i.uzumModerationValue === "HAS_COMPLAINTS"
  );
}

const MODERATION_PENDING = ["ON_MODERATION", "ON_PREMODERATION", "NOT_MODERATED"];

function matchesTab(i: WarehouseProduct, tab: StatusTab): boolean {
  const s = i.uzumStatusValue ?? "";
  const m = i.uzumModerationValue ?? "";
  const pending = MODERATION_PENDING.includes(m);
  switch (tab) {
    case "all":
    case "archived":
      return true;
    case "selling":
      // Uzum "Sotuvdagi": sotuvda + moderatsiyadan o'tган + bloklanmagan.
      return s === "IN_STOCK" && !isBlocked(i) && !pending;
    case "ending":
      return (
        s === "IN_STOCK" && !isBlocked(i) &&
        i.marketplaceStock != null && i.marketplaceStock > 0 &&
        i.marketplaceStock <= ENDING_STOCK
      );
    case "not_selling":
      // Uzum "Sotuvda bo'lmaganlar": tugagan yoki yetkazishga tayyor
      // emas. Qoldiq 0 bo'lgan IN_STOCK ni bu yerga QO'SHMAYMIZ —
      // Uzum ham qo'shmaydi (u "Sotuvdagi"da qoladi).
      return !isBlocked(i) && ["RUN_OUT", "NO_SKU", "NOT_READY_TO_SEND"].includes(s);
    case "blocked":
      return isBlocked(i);
    case "moderation":
      return !isBlocked(i) && pending;
    case "resubmitted":
      // Avval bloklangan edi, tuzatilib qayta moderatsiyaga yuborilgan.
      return !isBlocked(i) && pending && i.uzumHadBlock;
    case "re_moderation":
      // Bloklanmagan, tasdiqlangan edi — matn/rasm o'zgartirilib qayta
      // moderatsiyaga tushgan (hech qachon bloklanmagan).
      return !isBlocked(i) && pending && !i.uzumHadBlock && i.uzumWasModerated;
    case "attrs": {
      const a = i.uzumValidation?.areas?.attributes;
      return a != null && a !== "ok";
    }
    default:
      return true;
  }
}

// `useSearchParams` Suspense chegarasini talab qiladi — usiz Next
// qurilishda yiqiladi. Sahifaning o'zi allaqachon mijoz komponenti,
// shuning uchun chegara shu yerda, eng tashqarida turadi.
export default function WarehousePage() {
  return (
    <React.Suspense fallback={<WarehouseSkeleton />}>
      <WarehouseContent />
    </React.Suspense>
  );
}

function WarehouseSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

function WarehouseContent() {
  const { items: activeItems, status, error, isInitialLoading, refresh } = useWarehouseProducts();
  // Tugma o'rniga: sahifaga qaytganda va vaqti-vaqti bilan o'zi yangilanadi.
  useAutoRefresh(refresh);
  const shop = useActiveShop();
  const [query, setQuery] = React.useState("");
  // "Tan narxsiz" kartasi bosilganda: faqat tan narxi kiritilmagan
  // tovarlarni ko'rsatish — hint "kirim kiriting" ko'rinishidan
  // amalda hech narsa qilmasligi CHALG'ITARDI, endi haqiqiy filtr.
  const [onlyNoCost, setOnlyNoCost] = React.useState(false);
  const [intakeFor, setIntakeFor] = React.useState<WarehouseProduct | null>(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [bulkResult, setBulkResult] = React.useState<string | null>(null);

  // ── Holat bo'yicha filtr — Uzum sotuvchi kabinetidagi kabi ──
  // Uzum'da tovarlar tepasida: "Barchasi · Sotuvda · Tugayapti ·
  // Sotuvda emas · Bloklangan · Moderatsiyada · Xususiyat
  // to'ldirilmagan · Arxiv", har birida son. Bir xil qildik:
  // filtr MIJOZ tomonida (`uzumStatusValue`/`uzumModerationValue`
  // sync bilan keladi), faqat Arxiv alohida so'rov.
  //
  // ATAYLAB asosiy do'kondan (`useWarehouseProducts`) ALOHIDA: u
  // sahifalar bo'ylab umumiy kesh, "faqat FAOL tovarlar" degan
  // ma'noni beradi — arxiv bilan aralashtirish boshqa ekranlarni
  // buzardi. Arxiv faqat so'ralganda yuklanadi.
  const [tab, setTab] = React.useState<StatusTab>("all");
  const view = tab === "archived" ? "archived" : "active";
  const [archivedItems, setArchivedItems] = React.useState<WarehouseProduct[]>([]);
  const [archivedCount, setArchivedCount] = React.useState<number | null>(null);
  const [archivedLoading, setArchivedLoading] = React.useState(false);
  const [archivedError, setArchivedError] = React.useState<string | null>(null);
  const [archiveAttempt, setArchiveAttempt] = React.useState(0);
  // Son har doim ko'rinsin — tab ochilmasa ham. Bitta yengil so'rov.
  React.useEffect(() => {
    fetchProducts({ archived: true, size: 1 })
      .then((page) => setArchivedCount(page.count))
      .catch(() => setArchivedCount(null));
  }, []);
  React.useEffect(() => {
    if (view !== "archived" || archivedItems.length) return;
    let cancelled = false;
    setArchivedLoading(true);
    setArchivedError(null);
    fetchProducts({ archived: true, size: 500 })
      .then((page) => {
        if (cancelled) return;
        setArchivedItems(page.results);
        setArchivedCount(page.count);
        setArchivedLoading(false);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setArchivedError(reason instanceof Error ? reason.message : "Arxivni yuklab bo‘lmadi");
          setArchivedLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [view, archivedItems.length, archiveAttempt]);
  const items = view === "archived" ? archivedItems : activeItems;

  // ── Tovar qo'shish (AI) ────────────────────────────────────
  // Alohida sahifa emas, shu yerdagi oyna: tovar qo'shish —
  // omborning ICHIDAGI ish. Alohida bo'limda sotuvchi katalogdan
  // chiqib ketardi va qaytganda qayerda qolgani yo'qolardi.
  const canSeeAi = useCan("products_ai.view");
  const canAddAi = useCan("products_ai.control");
  const drafts = useAiDrafts(canSeeAi);

  // Oyna holati URL'DA turadi (`?draft=12`/`?draft=new`) — endi
  // `useDraftParam()`da, `/warehouse/[id]` sahifasi bilan BIR XIL
  // (izoh o'sha faylda: nega URL'da, nega Next router emas).
  const { aiOpen, aiDraftId, setDraftParam, openAi } = useDraftParam();

  // Tab sonlari — FAOL ro'yxatdan (arxiv alohida). Uzum ham
  // shunday: har tab yonida son, ustma-ust bo'lishi mumkin
  // (bloklangan tovar ham "Barchasi"ga kiradi).
  const tabCounts = React.useMemo(() => {
    const c: Record<StatusTab, number> = {
      all: activeItems.length, selling: 0, ending: 0, not_selling: 0,
      blocked: 0, moderation: 0, resubmitted: 0, re_moderation: 0, attrs: 0,
      archived: archivedCount ?? archivedItems.length,
    };
    for (const it of activeItems) {
      for (const t of [
        "selling", "ending", "not_selling", "blocked",
        "moderation", "resubmitted", "re_moderation", "attrs",
      ] as StatusTab[]) {
        if (matchesTab(it, t)) c[t] += 1;
      }
    }
    return c;
  }, [activeItems, archivedItems.length, archivedCount]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!matchesTab(item, tab)) return false;
      if (onlyNoCost && (item.lastCost || item.averageCost)) return false;
      if (!q) return true;
      return [item.title, item.skuCode, item.barcode, item.sellerSku, item.categoryName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [items, query, tab, onlyNoCost]);

  React.useEffect(() => {
    setBulkResult(null);
  }, [tab, query]);

  const totals = React.useMemo(
    () => ({
      goods: items.length,
      onHand: items.reduce((sum, i) => sum + i.stockQuantity, 0),
      stockValue: items.reduce((sum, i) => sum + i.stockValue, 0),
      withoutCost: items.filter((i) => !i.lastCost && !i.averageCost).length,
    }),
    [items]
  );
  const loading = view === "active" ? status === "idle" || isInitialLoading : archivedLoading && items.length === 0;
  const visibleError = view === "archived" ? archivedError : error;
  const hasFilters = query.trim().length > 0 || onlyNoCost || tab !== "all";
  const clearFilters = () => {
    setQuery("");
    setOnlyNoCost(false);
    setTab("all");
  };

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <InventoryHeader
        active="warehouse"
        actions={
          canAddAi ? (
            <Button
              onClick={() => openAi(null)}
              className="min-h-11 rounded-xl bg-[#00904d] px-5 text-white shadow-sm hover:bg-[#007d43]"
            >
              <Plus className="h-4 w-4" /> Tovar qo&apos;shish
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 sm:gap-3">
        <InventoryStat loading={loading} icon={Boxes} label="Jami tovarlar" value={formatNumber(totals.goods)} hint="Katalogdagi SKUlar" />
        <InventoryStat loading={loading} icon={Package} label="Ombordagi qoldiq" value={`${formatNumber(totals.onHand)} dona`} hint="Kirim va sotuvlar bo‘yicha" />
        <InventoryStat loading={loading} icon={Wallet} label="Zaxira qiymati" value={formatSum(totals.stockValue)} hint="Tan narx bo‘yicha" />
        <InventoryStat
          loading={loading}
          tone={totals.withoutCost > 0 ? "warning" : "default"}
          icon={AlertTriangle}
          label="Tan narxsiz"
          value={`${formatNumber(totals.withoutCost)} ta`}
          hint={
            loading || visibleError ? undefined : totals.withoutCost > 0
              ? onlyNoCost
                ? "hammasini ko'rsatish"
                : "Tovarlarni ko‘rish →"
              : "Barchasiga tan narx kiritilgan"
          }
          active={onlyNoCost}
          onClick={
            totals.withoutCost > 0 ? () => setOnlyNoCost((v) => !v) : undefined
          }
        />
      </div>

      {canSeeAi && <DraftStrip rows={drafts.rows} onOpen={(id) => openAi(id)} />}

      {/* Uzum sotuvchi kabinetidagi kabi holat-tablari. */}
      <section aria-label="Tovarlarni qidirish va filtrlash" className="min-w-0 space-y-4 rounded-2xl border bg-card p-3.5 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Tovarlar katalogi</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Holatni tanlang yoki kerakli tovarni qidiring.</p>
        </div>
        <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
          {loading ? "Yuklanmoqda…" : `${formatNumber(filtered.length)} / ${formatNumber(items.length)} ta SKU`}
        </span>
      </div>
      <label className="block space-y-1.5 md:hidden">
        <span className="text-xs font-medium text-muted-foreground">Tovar holati</span>
        <select
          value={tab}
          onChange={(event) => setTab(event.target.value as StatusTab)}
          className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {STATUS_TABS.map(({ key, label }) => <option key={key} value={key}>{label} ({tabCounts[key]})</option>)}
        </select>
      </label>
      <div className="hidden flex-wrap items-center gap-1.5 md:flex" role="group" aria-label="Tovar holati">
        {STATUS_TABS.slice(0, 5).map(({ key, label }) => {
          const active = tab === key;
          const count = tabCounts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={active}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary/10 font-semibold text-primary ring-1 ring-primary/20"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
        <select
          aria-label="Boshqa tovar holatlari"
          value={STATUS_TABS.slice(5).some((statusTab) => statusTab.key === tab) ? tab : "more"}
          onChange={(event) => setTab(event.target.value as StatusTab)}
          className={cn("h-11 max-w-full rounded-lg border bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", STATUS_TABS.slice(5).some((statusTab) => statusTab.key === tab) && "border-primary/30 bg-primary/10 text-primary")}
        >
          <option value="more" disabled>Boshqa holatlar</option>
          {STATUS_TABS.slice(5).map(({ key, label }) => <option key={key} value={key}>{label} ({tabCounts[key]})</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full min-w-0 sm:min-w-64 sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Tovarlarni qidirish"
            placeholder="Tovar nomi, SKU yoki barkod..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 rounded-xl pl-9 pr-11 text-base sm:text-sm"
          />
          {query && <button type="button" aria-label="Qidiruvni tozalash" onClick={() => setQuery("")} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-4 w-4" /></button>}
        </div>
        {/* Ommaviy amallar — belgilash o'rniga: shu tabda KO'RINAYOTGAN
            tovarlarga (Uzum kabinetiga o'xshab, checkbox'siz). Faqat
            «Bloklangan» / «Xususiyat to'ldirilmagan» tablarida — o'sha
            yerda ommaviy tuzatish mantiqiy. */}
        {(tab === "blocked" || tab === "attrs") && filtered.length > 0 && (
          <>
            <Button
              variant="outline"
              className="min-h-11 rounded-xl"
              disabled={bulkBusy}
              onClick={async () => {
                setBulkBusy(true);
                try {
                  const res = await bulkCheckProductsUzum(filtered.map((p) => p.id));
                  setBulkResult(
                    `${res.checked} ta tekshirildi: ${res.ready} ready, ${res.warning} warning, ${res.error} error`,
                  );
                  refresh();
                } catch (reason) {
                  toast.error(reason instanceof Error ? reason.message : "Tekshiruvni boshlashda xatolik yuz berdi");
                } finally {
                  setBulkBusy(false);
                }
              }}
            >
              Uzum tekshiruvi ({filtered.length})
            </Button>
            <Button
              variant="outline"
              className="min-h-11 rounded-xl"
              disabled={bulkBusy}
              onClick={async () => {
                setBulkBusy(true);
                try {
                  const res = await bulkAutoFixProductsUzum(filtered.map((p) => p.id));
                  setBulkResult(
                    `${res.checked} ta uchun auto-fix draft tayyorlandi: ${res.ready} ready, ${res.warning} warning, ${res.error} error`,
                  );
                  drafts.reload();
                } catch (reason) {
                  toast.error(reason instanceof Error ? reason.message : "Tuzatishlarni tayyorlab bo‘lmadi");
                } finally {
                  setBulkBusy(false);
                }
              }}
            >
              Xavfsiz Auto-Fix ({filtered.length})
            </Button>
          </>
        )}
        {/* Uzum qo'llab-quvvatlashiga DO'KON darajasidagi savol:
            ombordagi qaytarilgan/nuqsonli tovarlar, mablag' yechish.
            Matn haqiqiy raqamlardan tuziladi, xabar sotuvchining
            O'Z Telegram hisobidan ketadi va fonda yuboriladi. */}
        <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => setSupportOpen(true)}>
          <Headphones className="h-4 w-4" /> Uzum yordami
        </Button>
      </div>
      {hasFilters && <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2"><span className="text-xs text-muted-foreground">{onlyNoCost ? "Tan narxi kiritilmagan tovarlar" : STATUS_TABS.find((statusTab) => statusTab.key === tab)?.label}</span><Button variant="ghost" className="min-h-11 rounded-xl text-xs" onClick={clearFilters}><X className="h-3.5 w-3.5" /> Filtrlarni tozalash</Button></div>}
      </section>

      <SupportRequestDialog open={supportOpen} onOpenChange={setSupportOpen} />

      {bulkResult && (
        <div className="rounded-lg border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
          {bulkResult}
        </div>
      )}

      {/* Qoldiq = keldi − sotildi. "Sotildi" esa faqat YUKLANGAN sotuvlardan
          chiqadi, shuning uchun qaysi davr yuklangani yonida turishi shart —
          aks holda qoldiq to'liq haqiqatdek ko'rinadi. */}
      {shop && !shop.salesSyncedFrom && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
          <div>
            <div className="font-medium">Sotuvlar birinchi marta yuklanmoqda</div>
            <div className="text-muted-foreground">
              Bu bir necha daqiqa oladi — oxirgi 6 oylik tarix tortiladi. Shu vaqtgacha
              &quot;Sotildi&quot; va &quot;Qoldiq&quot; ustunlari bo&apos;sh ko&apos;rinadi.
              Holatni Sozlamalar → Uzum ma&apos;lumoti bo&apos;limida kuzatishingiz mumkin.
            </div>
          </div>
        </div>
      )}
      {shop?.salesSyncedFrom && (
        <details className="rounded-xl border bg-muted/30 px-3.5 text-xs text-muted-foreground">
          <summary className="min-h-11 cursor-pointer py-3 leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Info className="mr-1.5 inline h-3.5 w-3.5" /> Sotuvlar davri: {shop.salesSyncedFrom} — {shop.salesSyncedTo}</summary>
          <p className="pb-3 leading-relaxed">
          &quot;Sotildi&quot; va &quot;Qoldiq&quot; ustunlari{" "}
          <span className="font-medium text-foreground">
            {shop.salesSyncedFrom} … {shop.salesSyncedTo}
          </span>{" "}
          oralig&apos;idagi yuklangan sotuvlarga asoslangan. Undan oldingi sotuvlar
          hisobga olinmagan — kerak bo&apos;lsa o&apos;sha davrni ham yuklang.
          </p>
        </details>
      )}

      {visibleError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span>{visibleError}</span>
          <Button variant="outline" className="min-h-11 shrink-0 rounded-xl" onClick={() => view === "archived" ? setArchiveAttempt((attempt) => attempt + 1) : refresh()}><RefreshCw className="h-4 w-4" /> Qayta urinish</Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : visibleError && items.length === 0 ? null : (
        <ProductTable
          items={filtered}
          onIntake={setIntakeFor}
          // Joylangan AI qoralamasi tovarning o'zidan ochiladi:
          // joylangach u "AI qoralamalari" qatoridan chiqadi va
          // qayta ochishning boshqa yo'li yo'q edi.
          aiDraftByProduct={canSeeAi ? drafts.draftByProduct : undefined}
          onOpenAiDraft={openAi}
        />
      )}

      <IntakeDialog
        product={intakeFor}
        onOpenChange={(open) => !open && setIntakeFor(null)}
        onSaved={refresh}
      />

      <ProductAiModal
        open={aiOpen}
        draftId={aiDraftId}
        onClose={() => setDraftParam(null)}
        onDraft={drafts.upsert}
        onDeleted={drafts.remove}
      />
    </div>
  );
}
