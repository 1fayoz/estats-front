"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Boxes, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductTable } from "@/features/warehouse/components/product-table";
import { IntakeDialog } from "@/features/warehouse/components/intake-dialog";
import { DraftStrip } from "@/features/products-ai/components/draft-strip";
import { ProductAiModal } from "@/features/products-ai/components/product-modal";
import { useAiDrafts } from "@/features/products-ai/use-drafts";
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
  | "blocked" | "moderation" | "attrs" | "archived";

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "selling", label: "Sotuvda" },
  { key: "ending", label: "Tugayapti" },
  { key: "not_selling", label: "Sotuvda emas" },
  { key: "blocked", label: "Bloklangan" },
  { key: "moderation", label: "Moderatsiyada" },
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
  const { items: activeItems, error, isInitialLoading, refresh } = useWarehouseProducts();
  // Tugma o'rniga: sahifaga qaytganda va vaqti-vaqti bilan o'zi yangilanadi.
  useAutoRefresh(refresh);
  const shop = useActiveShop();
  const [query, setQuery] = React.useState("");
  const [intakeFor, setIntakeFor] = React.useState<WarehouseProduct | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
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
  // Son har doim ko'rinsin — tab ochilmasa ham. Bitta yengil so'rov.
  React.useEffect(() => {
    fetchProducts({ archived: true, size: 1 })
      .then((page) => setArchivedCount(page.count))
      .catch(() => setArchivedCount(null));
  }, []);
  React.useEffect(() => {
    if (view !== "archived" || archivedItems.length) return;
    setArchivedLoading(true);
    fetchProducts({ archived: true, size: 500 })
      .then((page) => {
        setArchivedItems(page.results);
        setArchivedCount(page.count);
      })
      .finally(() => setArchivedLoading(false));
  }, [view, archivedItems.length]);
  const items = view === "archived" ? archivedItems : activeItems;

  // ── Tovar qo'shish (AI) ────────────────────────────────────
  // Alohida sahifa emas, shu yerdagi oyna: tovar qo'shish —
  // omborning ICHIDAGI ish. Alohida bo'limda sotuvchi katalogdan
  // chiqib ketardi va qaytganda qayerda qolgani yo'qolardi.
  const canSeeAi = useCan("products_ai.view");
  const canAddAi = useCan("products_ai.control");
  const drafts = useAiDrafts(canSeeAi);

  // ── Oyna holati URL'DA turadi ──────────────────────────────
  // Ilgari u oddiy `useState` edi va sahifa yangilanganda oyna
  // yopilib qolardi — quvur bir necha daqiqa ishlaydi, sotuvchi
  // esa shu vaqt ichida sahifani yangilashi butunlay normal.
  // Havolani hamkasbiga tashlash ham imkonsiz edi.
  //   ?draft=12   — mavjud qoralama
  //   ?draft=new  — yangi tovar qo'shish
  // `useSearchParams()` FAQAT boshlang'ich qiymat uchun — reload
  // yoki havola orqali ochilganda. Undan KEYIN mahalliy holat
  // (`draftParam`) yagona manba: Next'ning `router.replace()`i
  // BILAN sinovda topilgan real xato bor edi — yopishda
  // (`?draft=3` → bo'sh) `history.replaceState` HAR SAFAR eski
  // "?draft=3"ni QAYTA yozib qo'yardi (brauzer konsolida
  // `history.replaceState`ni ushlab tekshirilgan — Next'ning o'z
  // marshrutlash keshi bilan bog'liq bo'lishi mumkin). Natija:
  // × tugmasi bosilardi-yu, oyna hech qachon yopilmasdi. Endi
  // React holati DARHOL, sinxron yangilanadi (router kutilmaydi);
  // URL esa faqat ULASHISH/YANGILASH uchun brauzerning O'Z
  // `history.replaceState`i bilan yoziladi — Next routerisiz.
  const searchParams = useSearchParams();
  const [draftParam, setDraftParamState] = React.useState<string | null>(
    () => searchParams.get("draft"),
  );
  // Orqaga/oldinga tugmasi — brauzerning o'z hodisasidan
  // (`popstate`), Next hookidan emas: yuqoridagi sababga ko'ra.
  React.useEffect(() => {
    const onPop = () => {
      setDraftParamState(new URLSearchParams(window.location.search).get("draft"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const aiOpen = draftParam !== null;
  const aiDraftId = draftParam && draftParam !== "new" ? Number(draftParam) : null;

  const setDraftParam = React.useCallback((value: string | null) => {
    setDraftParamState(value);
    const next = new URLSearchParams(window.location.search);
    if (value === null) next.delete("draft");
    else next.set("draft", value);
    const query = next.toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const openAi = (id: number | null) => setDraftParam(id === null ? "new" : String(id));

  // Tab sonlari — FAOL ro'yxatdan (arxiv alohida). Uzum ham
  // shunday: har tab yonida son, ustma-ust bo'lishi mumkin
  // (bloklangan tovar ham "Barchasi"ga kiradi).
  const tabCounts = React.useMemo(() => {
    const c: Record<StatusTab, number> = {
      all: activeItems.length, selling: 0, ending: 0, not_selling: 0,
      blocked: 0, moderation: 0, attrs: 0,
      archived: archivedCount ?? archivedItems.length,
    };
    for (const it of activeItems) {
      for (const t of ["selling", "ending", "not_selling", "blocked", "moderation", "attrs"] as StatusTab[]) {
        if (matchesTab(it, t)) c[t] += 1;
      }
    }
    return c;
  }, [activeItems, archivedItems.length, archivedCount]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!matchesTab(item, tab)) return false;
      if (!q) return true;
      return [item.title, item.skuCode, item.barcode, item.sellerSku, item.categoryName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [items, query, tab]);

  React.useEffect(() => {
    setSelectedIds(new Set());
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ombor"
        description="Uzum katalogingiz va har bir tovarning tan narxi. Tovar kelganda 'Kirim' tugmasi orqali qo'shing; yangi kartochka esa 'Tovar qo'shish' orqali yasaladi."
        actions={
          canAddAi ? (
            <Button
              onClick={() => openAi(null)}
              className="bg-[#00904d] text-white hover:bg-[#00a457]"
            >
              <Plus className="h-4 w-4" /> Tovar qo&apos;shish
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Tovarlar" value={formatNumber(totals.goods)} />
        <StatTile label="Ombordagi qoldiq" value={`${formatNumber(totals.onHand)} dona`} />
        <StatTile label="Zaxira qiymati" value={formatSum(totals.stockValue)} />
        <StatTile
          label="Tan narxsiz"
          value={`${formatNumber(totals.withoutCost)} ta`}
          hint={totals.withoutCost > 0 ? "kirim kiriting" : undefined}
        />
      </div>

      {canSeeAi && <DraftStrip rows={drafts.rows} onOpen={(id) => openAi(id)} />}

      {/* Uzum sotuvchi kabinetidagi kabi holat-tablari. */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b pb-1">
        {STATUS_TABS.map(({ key, label }) => {
          const active = tab === key;
          const count = tabCounts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                  active ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nom, SKU, barcode yoki kategoriya..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          disabled={selectedIds.size === 0}
          onClick={async () => {
            const res = await bulkCheckProductsUzum(Array.from(selectedIds));
            setBulkResult(`${res.checked} ta tekshirildi: ${res.ready} ready, ${res.warning} warning, ${res.error} error`);
            refresh();
          }}
        >
          Uzum tekshiruvi
        </Button>
        <Button
          variant="outline"
          disabled={selectedIds.size === 0}
          onClick={async () => {
            const res = await bulkAutoFixProductsUzum(Array.from(selectedIds));
            setBulkResult(`${res.checked} ta uchun auto-fix draft tayyorlandi: ${res.ready} ready, ${res.warning} warning, ${res.error} error`);
            drafts.reload();
          }}
        >
          Xavfsiz Auto-Fix
        </Button>
      </div>

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
        <div className="rounded-lg border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          &quot;Sotildi&quot; va &quot;Qoldiq&quot; ustunlari{" "}
          <span className="font-medium text-foreground">
            {shop.salesSyncedFrom} … {shop.salesSyncedTo}
          </span>{" "}
          oralig&apos;idagi yuklangan sotuvlarga asoslangan. Undan oldingi sotuvlar
          hisobga olinmagan — kerak bo&apos;lsa o&apos;sha davrni ham yuklang.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {(view === "active" ? isInitialLoading : archivedLoading && items.length === 0) ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <ProductTable
          items={filtered}
          onIntake={setIntakeFor}
          // Joylangan AI qoralamasi tovarning o'zidan ochiladi:
          // joylangach u "AI qoralamalari" qatoridan chiqadi va
          // qayta ochishning boshqa yo'li yo'q edi.
          aiDraftByProduct={canSeeAi ? drafts.draftByProduct : undefined}
          onOpenAiDraft={openAi}
          selectedIds={selectedIds}
          onToggleSelected={(productId) =>
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(productId)) next.delete(productId);
              else next.add(productId);
              return next;
            })
          }
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

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Boxes className="h-3.5 w-3.5" />
          {label}
        </div>
        <div className="text-lg font-semibold tabular-nums">{value}</div>
        {hint && <div className="text-xs text-amber-600 dark:text-amber-500">{hint}</div>}
      </CardContent>
    </Card>
  );
}
