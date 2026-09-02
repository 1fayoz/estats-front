"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { fetchProducts } from "@/lib/api";
import type { WarehouseProduct } from "@/lib/types";

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

  // ── Arxiv ── ATAYLAB asosiy do'kondan (`useWarehouseProducts`)
  // ALOHIDA: u sahifalar bo'ylab umumiy kesh, boshqa joylarda ham
  // ishlatiladi va "faqat FAOL tovarlar" degan ma'noni bergani
  // uchun uni arxiv bilan aralashtirish boshqa ekranlarni ham
  // buzardi. Arxiv sukut bo'yicha yashiringan — faqat so'ralganda
  // alohida so'rov bilan yuklanadi.
  const [view, setView] = React.useState<"active" | "archived">("active");
  const [archivedItems, setArchivedItems] = React.useState<WarehouseProduct[]>([]);
  const [archivedLoading, setArchivedLoading] = React.useState(false);
  React.useEffect(() => {
    if (view !== "archived") return;
    setArchivedLoading(true);
    fetchProducts({ archived: true })
      .then((page) => setArchivedItems(page.results))
      .finally(() => setArchivedLoading(false));
  }, [view]);
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const draftParam = searchParams.get("draft");
  const aiOpen = draftParam !== null;
  const aiDraftId = draftParam && draftParam !== "new" ? Number(draftParam) : null;

  const setDraftParam = React.useCallback(
    (value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null) next.delete("draft");
      else next.set("draft", value);
      const query = next.toString();
      // `replace` — `push` EMAS: oynani ochib-yopish brauzer
      // tarixini to'ldirmasligi kerak, "orqaga" tugmasi sotuvchini
      // ombordan chiqarib yuborishi kerak, o'ndan oldingi oyna
      // holatiga emas. `scroll: false` — jadval o'z joyida qolsin.
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const openAi = (id: number | null) => setDraftParam(id === null ? "new" : String(id));

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.skuCode, item.barcode, item.sellerSku, item.categoryName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [items, query]);

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
        <div className="flex overflow-hidden rounded-md border">
          <button
            type="button"
            onClick={() => setView("active")}
            className={
              view === "active"
                ? "bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                : "px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            }
          >
            Faol
          </button>
          <button
            type="button"
            onClick={() => setView("archived")}
            className={
              view === "archived"
                ? "bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                : "px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            }
          >
            Arxiv
          </button>
        </div>
      </div>

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
        <ProductTable items={filtered} onIntake={setIntakeFor} />
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
