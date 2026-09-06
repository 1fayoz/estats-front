"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, CheckCircle2, ChevronRight, Clock3,
  PackagePlus, PackageX, Sparkles, Truck, XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CardHead, CardList, CardStats, DataCard, TableWrap,
} from "@/components/dashboard/data-cards";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WarehouseProduct } from "@/lib/types";

interface ProductTableProps {
  items: WarehouseProduct[];
  onIntake: (product: WarehouseProduct) => void;
  /**
   * Uzum tovar ID'si → joylangan AI qoralamasi ID'si. Bo'lsa,
   * tegishli tovar qatorida "AI kartochka" tugmasi chiqadi —
   * joylangan qoralamani ("Tahrirlash", "Uzumda tekshirish")
   * qayta ochishning yagona yo'li.
   */
  aiDraftByProduct?: Map<string, number>;
  onOpenAiDraft?: (draftId: number) => void;
}

// ── Kartochka bo'yicha guruhlash (Uzum kabinetidagi kabi) ──────
// Uzum'da bir KARTOCHKA (tovar) ostida bir necha SKU (rang/o'lcham)
// ichma-ich turadi: matn, tavsif — bitta, faqat rang/narx/qoldiq
// har variant uchun alohida. Bizda ular `external_product_id`
// bilan bog'lanadi.
interface Group {
  key: string;
  /** Ko'rsatiladigan asosiy qator (birinchi variant — sarlavha/rasm umumiy). */
  card: WarehouseProduct;
  variants: WarehouseProduct[];
  isGroup: boolean;
}

function groupByCard(items: WarehouseProduct[]): Group[] {
  const map = new Map<string, WarehouseProduct[]>();
  const order: string[] = [];
  for (const it of items) {
    const key = it.externalProductId ? `p:${it.externalProductId}` : `s:${it.id}`;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(it);
  }
  return order.map((key) => {
    const variants = map.get(key)!;
    return { key, card: variants[0], variants, isGroup: variants.length > 1 };
  });
}

function sum(variants: WarehouseProduct[], pick: (v: WarehouseProduct) => number): number {
  return variants.reduce((a, v) => a + (pick(v) || 0), 0);
}

function priceRange(variants: WarehouseProduct[]): { min: number; max: number } | null {
  const ps = variants.map((v) => v.marketplacePrice).filter((p): p is number => p != null && p > 0);
  if (!ps.length) return null;
  return { min: Math.min(...ps), max: Math.max(...ps) };
}

function costOf(v: WarehouseProduct): number | null {
  if (v.lastCost != null) return v.lastCost;
  if (v.averageCost > 0) return v.averageCost;
  return null;
}

// "Bloklangan edi, tuzatilib qayta yuborildi" / "Tasdiqlangan edi,
// o'zgartirilib qayta moderatsiyaga tushdi" — bu ikkalasi ham tashqi
// ko'zga oddiy "Moderatsiyada" bo'lib ko'rinadi, lekin sotuvchi UCHUN
// farqi katta: birinchisida xato TUZATILGAN, ikkinchisida esa TIRIK
// (bloklanmagan) kartochkani O'ZI o'zgartirgan.
function resubmitHint(item: WarehouseProduct): string | null {
  const pending = ["ON_MODERATION", "ON_PREMODERATION", "NOT_MODERATED"].includes(
    item.uzumModerationValue ?? "",
  );
  if (item.uzumBlocked || !pending) return null;
  if (item.uzumHadBlock) return "Tuzatildi → qayta moderatsiyada";
  if (item.uzumWasModerated) return "Tahrirlandi → qayta moderatsiyada";
  return null;
}

export function ProductTable({
  items,
  onIntake,
  aiDraftByProduct,
  onOpenAiDraft,
}: ProductTableProps) {
  const router = useRouter();
  const groups = React.useMemo(() => groupByCard(items), [items]);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const aiDraftId = (item: WarehouseProduct): number | null =>
    (item.externalProductId && aiDraftByProduct?.get(item.externalProductId)) || null;

  const statusBadge = (item: WarehouseProduct) => {
    const summary = item.uzumValidation?.summary;
    const label = item.uzumBlocked
      ? "Bloklangan"
      : item.uzumModerationTitle || item.uzumStatusTitle || "Holati noma’lum";
    const tone = item.uzumBlocked
      ? "destructive"
      : summary?.error
        ? "destructive"
        : summary?.warning
          ? "secondary"
          : "outline";
    const Icon = item.uzumBlocked
      ? XCircle
      : summary?.error
        ? AlertTriangle
        : item.uzumModerationValue?.includes("MODERATION")
          ? Clock3
          : CheckCircle2;
    return (
      <Badge variant={tone as "outline"} className="max-w-full gap-1 whitespace-normal text-left [&_svg]:shrink-0">
        <Icon className="h-3 w-3" /> {label}
      </Badge>
    );
  };

  // Guruh uchun status — eng "yomon"i: bloklangan bo'lsa bloklangan.
  const groupStatusItem = (g: Group): WarehouseProduct =>
    g.variants.find((v) => v.uzumBlocked) ??
    g.variants.find((v) => v.uzumValidation?.summary?.error) ??
    g.card;

  if (!items.length) {
    return (
      <EmptyState
        icon={PackageX}
        title="Tovar topilmadi"
        description="Uzum katalogini sinxronlang yoki qidiruv shartini o'zgartiring."
      />
    );
  }

  return (
    <>
      {/* ── Mobil: guruh — bitta karta, variantlar chip bilan ── */}
      <CardList className="grid min-w-0 gap-4 space-y-0 sm:grid-cols-2 md:grid xl:hidden">
        {groups.map((g) => {
          const item = g.card;
          const hasCost = costOf(item) != null;
          const draftId = aiDraftId(item);
          const range = priceRange(g.variants);
          const open = expanded.has(g.key);
          const statusItem = groupStatusItem(g);
          const variantsId = `product-variants-${item.id}`;
          return (
            <DataCard key={g.key} className="min-w-0 self-start rounded-2xl border-border/70 p-4 shadow-sm">
              <Link
                href={`/warehouse/${item.id}`}
                className="block min-h-11 min-w-0 rounded-lg transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <CardHead
                  image={item.image}
                  title={item.title}
                  note={
                    g.isGroup
                      ? `${g.variants.length} variant · ` +
                        g.variants.map((variant) => variant.variantName).filter(Boolean).join(", ")
                      : [item.variantName, item.skuCode].filter(Boolean).join(" · ") || "—"
                  }
                />
              </Link>
              <div className="mt-3 flex flex-wrap items-start gap-1.5">
                {statusBadge(statusItem)}
                {resubmitHint(statusItem) && (
                  <Badge variant="outline" className="max-w-full whitespace-normal text-xs text-muted-foreground">
                    {resubmitHint(statusItem)}
                  </Badge>
                )}
              </div>
              {statusItem.uzumBlockingReason && (
                <p className="mt-2 break-words text-xs leading-relaxed text-destructive">
                  {statusItem.uzumBlockingReason}
                </p>
              )}
              <CardStats
                className="mt-4 gap-y-3 rounded-xl bg-muted/40 p-3 [&_dd]:whitespace-normal [&_dd]:break-words [&_dd]:leading-relaxed"
                items={[
                  {
                    label: "Uzum narxi",
                    value: g.isGroup
                      ? range
                        ? range.min === range.max
                          ? formatSum(range.min)
                          : `${formatSum(range.min)} – ${formatSum(range.max)}`
                        : "—"
                      : item.marketplacePrice
                        ? formatSum(item.marketplacePrice)
                        : "—",
                  },
                  {
                    label: "Tan narx",
                    value: hasCost ? (
                      formatSum(costOf(item)!)
                    ) : (
                      <Badge variant="secondary">kiritilmagan</Badge>
                    ),
                  },
                  {
                    label: "Qoldiq",
                    value: `${formatNumber(sum(g.variants, (v) => v.stockQuantity))} dona`,
                  },
                  {
                    label: "Zaxira qiymati",
                    value: (() => {
                      const sv = sum(g.variants, (v) => v.stockValue);
                      return sv > 0 ? formatSum(sv) : "—";
                    })(),
                  },
                  {
                    label: "Keldi / sotildi",
                    value: `${formatNumber(sum(g.variants, (v) => v.totalIntakeQuantity))} / ${formatNumber(
                      sum(g.variants, (v) => v.totalSoldQuantity),
                    )}`,
                  },
                  {
                    label: "Uzum qoldig'i",
                    value: formatNumber(sum(g.variants, (v) => v.marketplaceStock ?? 0)),
                  },
                ]}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {g.isGroup ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
                    aria-expanded={open}
                    aria-controls={variantsId}
                    onClick={() => toggle(g.key)}
                  >
                    <ChevronRight className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
                    Variantlar ({g.variants.length})
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
                    aria-label={`${item.title}: kirim qo'shish`}
                    onClick={() => onIntake(item)}
                  >
                    <PackagePlus className="h-3.5 w-3.5" /> Kirim qo&apos;shish
                  </Button>
                )}
                <Button asChild variant="outline" className="h-11 rounded-xl">
                  <Link href={`/warehouse/${item.id}`} aria-label={`${item.title}: batafsil`}>
                    Batafsil <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                {draftId != null && onOpenAiDraft && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-xl"
                    aria-label={`${item.title}: AI kartochkani ochish`}
                    onClick={() => onOpenAiDraft(draftId)}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> AI kartochka
                  </Button>
                )}
              </div>
              {g.isGroup && (
                <div id={variantsId} hidden={!open} className="mt-4 space-y-3 border-t pt-4">
                  {open && g.variants.map((variant) => (
                    <div key={variant.id} className="min-w-0 rounded-xl border border-border/70 p-3">
                      <Link
                        href={`/warehouse/${variant.id}`}
                        className="block min-h-11 min-w-0 rounded-lg transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <CardHead
                          image={variant.image}
                          title={variant.variantName || variant.title}
                          note={variant.skuCode || "SKU kiritilmagan"}
                        />
                      </Link>
                      <div className="mt-2">{statusBadge(variant)}</div>
                      <CardStats
                        className="gap-y-3 [&_dd]:whitespace-normal [&_dd]:break-words [&_dd]:leading-relaxed"
                        items={[
                          {
                            label: "Uzum narxi",
                            value: variant.marketplacePrice ? formatSum(variant.marketplacePrice) : "—",
                          },
                          {
                            label: "Tan narx",
                            value: costOf(variant) != null
                              ? formatSum(costOf(variant)!)
                              : <Badge variant="secondary">kiritilmagan</Badge>,
                          },
                          {
                            label: "Qoldiq",
                            value: `${formatNumber(variant.stockQuantity)} dona`,
                          },
                          {
                            label: "Uzum qoldig'i",
                            value: formatNumber(variant.marketplaceStock ?? 0),
                          },
                        ]}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 flex-1 rounded-xl text-foreground [&_svg]:text-[color:var(--ok)]"
                          aria-label={`${variant.variantName || variant.title}, ${variant.skuCode || "variant"}: kirim qo'shish`}
                          onClick={() => onIntake(variant)}
                        >
                          <PackagePlus className="h-4 w-4" /> Kirim
                        </Button>
                        <Button asChild variant="ghost" className="h-11 rounded-xl">
                          <Link
                            href={`/warehouse/${variant.id}`}
                            aria-label={`${variant.variantName || variant.title}, ${variant.skuCode || "variant"}: batafsil`}
                          >
                            Batafsil <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DataCard>
          );
        })}
      </CardList>

      <TableWrap className="rounded-2xl border-border/70 shadow-sm md:hidden xl:block">
      <table className="w-full min-w-[1160px] text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="w-8 px-1 py-3" />
            <th className="px-4 py-3 text-left font-medium">Tovar</th>
            <th className="px-3 py-3 text-left font-medium">Status</th>
            <th className="px-3 py-3 text-right font-medium">Uzum narxi</th>
            <th className="px-3 py-3 text-right font-medium">Tan narx</th>
            <th className="px-3 py-3 text-right font-medium" title="Butun davr bo'yicha kirim">Keldi</th>
            <th className="px-3 py-3 text-right font-medium" title="Butun davr bo'yicha sotuv">Sotildi</th>
            <th className="px-3 py-3 text-right font-medium" title="Zakaz qilingan, lekin qaytarilgan">Qaytdi</th>
            <th className="px-3 py-3 text-right font-medium" title="Keldi − sotildi">Qoldiq</th>
            <th className="px-3 py-3 text-right font-medium">Zaxira qiymati</th>
            <th className="px-3 py-3 text-right font-medium">Uzum qoldig&apos;i</th>
            <th className="px-4 py-3 text-right font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {groups.map((g) => {
            const open = expanded.has(g.key);
            return (
              <React.Fragment key={g.key}>
                {/* ── ASOSIY qator (kartochka) ── */}
                <ProductRow
                  item={g.card}
                  group={g}
                  open={open}
                  onToggleOpen={() => toggle(g.key)}
                  router={router}
                  statusBadge={statusBadge}
                  groupStatusItem={groupStatusItem}
                  onIntake={onIntake}
                  aiDraftId={aiDraftId}
                  onOpenAiDraft={onOpenAiDraft}
                />
                {/* ── Variantlar (ochilganda) ── */}
                {g.isGroup && open &&
                  g.variants.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => router.push(`/warehouse/${v.id}`)}
                      tabIndex={0}
                      role="link"
                      onKeyDown={(e) => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/warehouse/${v.id}`);
                        }
                      }}
                      className="cursor-pointer bg-muted/20 text-[13px] transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                    >
                      <td className="px-1 py-2" />
                      <td className="max-w-[380px] px-4 py-2">
                        <div className="flex items-center gap-3 pl-6">
                          {v.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={v.image}
                              alt=""
                              className="h-9 w-9 shrink-0 rounded-md border object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-9 w-9 shrink-0 rounded-md border bg-muted" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {v.variantName || "Variant"}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">{v.skuCode || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {v.uzumBlocked ? (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" /> Bloklangan
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {v.uzumStatusTitle || "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {v.marketplacePrice ? formatSum(v.marketplacePrice) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {costOf(v) != null ? (
                          formatSum(costOf(v)!)
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {formatNumber(v.totalIntakeQuantity)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {formatNumber(v.totalSoldQuantity)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {v.totalReturnedQuantity ? formatNumber(v.totalReturnedQuantity) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">
                        {formatNumber(v.stockQuantity)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {v.stockValue > 0 ? formatSum(v.stockValue) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {v.marketplaceStock ?? 0}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`${v.variantName || v.title}, ${v.skuCode || "variant"}: kirim qo'shish`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onIntake(v);
                          }}
                        >
                          <PackagePlus className="h-3.5 w-3.5" /> Kirim
                        </Button>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      </TableWrap>
    </>
  );
}

// ── ASOSIY (kartochka) qator ─────────────────────────────────────
function ProductRow(props: {
  item: WarehouseProduct;
  group: Group;
  open: boolean;
  onToggleOpen: () => void;
  router: ReturnType<typeof useRouter>;
  statusBadge: (i: WarehouseProduct) => React.ReactNode;
  groupStatusItem: (g: Group) => WarehouseProduct;
  onIntake: (p: WarehouseProduct) => void;
  aiDraftId: (i: WarehouseProduct) => number | null;
  onOpenAiDraft?: (id: number) => void;
}) {
  const {
    item, group: g, open, onToggleOpen, router, statusBadge, groupStatusItem,
    onIntake, aiDraftId, onOpenAiDraft,
  } = props;

  const hasCost = costOf(item) != null;
  const draftId = aiDraftId(item);
  const range = priceRange(g.variants);
  const q = (pick: (v: WarehouseProduct) => number) => sum(g.variants, pick);

  // Guruh bo'lsa: qatorni bosish — ochish/yopish; alohida tovar bo'lsa
  // — detalga o'tish (avvalgidek).
  const onRowClick = () => (g.isGroup ? onToggleOpen() : router.push(`/warehouse/${item.id}`));

  return (
    <tr
      onClick={onRowClick}
      tabIndex={0}
      role={g.isGroup ? "button" : "link"}
      aria-expanded={g.isGroup ? open : undefined}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onRowClick();
        }
      }}
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none",
        g.isGroup && open && "bg-muted/30",
      )}
    >
      <td className="px-1 py-3 text-center">
        {g.isGroup && (
          <ChevronRight
            className={cn(
              "mx-auto h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
        )}
      </td>
      <td className="max-w-[380px] px-4 py-3">
        <div className="flex items-center gap-3">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt=""
              className="h-10 w-10 shrink-0 rounded-md border object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-md border bg-muted" />
          )}
          <div className="min-w-0">
            <div className="truncate font-medium">{item.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              {g.isGroup ? (
                <span className="inline-flex items-center gap-1">
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    {g.variants.length} variant
                  </Badge>
                  {g.variants.map((v) => v.variantName).filter(Boolean).join(", ") || item.skuCode}
                </span>
              ) : (
                [item.variantName, item.skuCode].filter(Boolean).join(" · ") || "—"
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col items-start gap-1">
          {statusBadge(groupStatusItem(g))}
          {groupStatusItem(g).uzumBlockingReason && (
            <div
              className="max-w-[220px] truncate text-xs text-destructive"
              title={groupStatusItem(g).uzumBlockingReason ?? undefined}
            >
              {groupStatusItem(g).uzumBlockingReason}
            </div>
          )}
          {resubmitHint(groupStatusItem(g)) && (
            <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
              {resubmitHint(groupStatusItem(g))}
            </Badge>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-right tabular-nums">
        {g.isGroup ? (
          range ? (
            range.min === range.max ? (
              formatSum(range.min)
            ) : (
              <span className="text-xs">
                {formatSum(range.min)} – {formatSum(range.max)}
              </span>
            )
          ) : (
            "—"
          )
        ) : item.marketplacePrice ? (
          formatSum(item.marketplacePrice)
        ) : (
          "—"
        )}
        {!g.isGroup && item.commissionRate != null && (
          <div className="text-xs text-muted-foreground">komissiya {item.commissionRate}%</div>
        )}
      </td>
      <td className="px-3 py-3 text-right tabular-nums">
        {g.isGroup ? (
          (() => {
            const cs = g.variants.map(costOf).filter((c): c is number => c != null);
            if (!cs.length) return <Badge variant="secondary">kiritilmagan</Badge>;
            const mn = Math.min(...cs);
            const mx = Math.max(...cs);
            return (
              <span className={cs.length < g.variants.length ? "text-amber-600 dark:text-amber-500" : ""}>
                {mn === mx ? formatSum(mn) : `${formatSum(mn)} – ${formatSum(mx)}`}
              </span>
            );
          })()
        ) : hasCost ? (
          <>
            <div className="font-medium">{formatSum(costOf(item)!)}</div>
            {item.averageCost > 0 &&
              item.lastCost != null &&
              Math.round(item.averageCost) !== Math.round(item.lastCost) && (
                <div className="text-xs text-muted-foreground">
                  o&apos;rtacha {formatSum(item.averageCost)}
                </div>
              )}
          </>
        ) : (
          <Badge variant="secondary">kiritilmagan</Badge>
        )}
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
        {formatNumber(q((v) => v.totalIntakeQuantity))}
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
        {formatNumber(q((v) => v.totalSoldQuantity))}
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
        {q((v) => v.totalReturnedQuantity) ? (
          <>
            {formatNumber(q((v) => v.totalReturnedQuantity))}
            {q((v) => v.pendingReturnQuantity) > 0 && (
              <div
                className="flex items-center justify-end gap-1 text-xs text-amber-600 dark:text-amber-500"
                title="Hisobda qoldiqqa qaytgan, lekin jismonan hali kelmagan"
              >
                <Truck className="h-3 w-3" />
                {`${formatNumber(q((v) => v.pendingReturnQuantity))} yo'lda`}
              </div>
            )}
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="px-3 py-3 text-right tabular-nums font-medium">
        {formatNumber(q((v) => v.stockQuantity))}
      </td>
      <td className="px-3 py-3 text-right tabular-nums">
        {q((v) => v.stockValue) > 0 ? formatSum(q((v) => v.stockValue)) : "—"}
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
        {formatNumber(q((v) => v.marketplaceStock ?? 0))}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {draftId != null && onOpenAiDraft && (
            <Button
              size="sm"
              variant="ghost"
              className="text-primary"
              aria-label={`${item.title}: AI kartochkani ochish`}
              title="AI kartochkasini ochish — Uzum'da tahrirlash yoki tekshirish"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAiDraft(draftId);
              }}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI
            </Button>
          )}
          {!g.isGroup && (
            <Button
              size="sm"
              variant="outline"
              aria-label={`${item.title}: kirim qo'shish`}
              onClick={(e) => {
                e.stopPropagation();
                onIntake(item);
              }}
            >
              <PackagePlus className="h-3.5 w-3.5" /> Kirim
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
