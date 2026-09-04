"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, PackagePlus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardHead, CardList, CardStats, DataCard } from "@/components/dashboard/data-cards";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreakEvenCard } from "@/features/warehouse/components/break-even-card";
import { ChangeHistoryCard } from "@/features/warehouse/components/change-history-card";
import { IntakeDialog } from "@/features/warehouse/components/intake-dialog";
import { MarketCard } from "@/features/warehouse/components/market-card";
import { ReturnsCard } from "@/features/warehouse/components/returns-card";
import { ProductGallery } from "@/features/warehouse/components/product-gallery";
import { SiblingsCard } from "@/features/warehouse/components/siblings-card";
import { ProductStats } from "@/features/warehouse/components/product-stats";
import { UzumFactsCard } from "@/features/warehouse/components/uzum-facts-card";
import { PositionsBlock } from "@/features/seo/components/positions-block";
import { ProductInstagramCard } from "@/features/instagram/components/product-instagram-card";
import { ProductNetworksCard } from "@/features/social/components/product-networks-card";
import { AdVerdictCard } from "@/features/social/components/ad-verdict-card";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import {
  aiFixProductUzum,
  autoFixProductUzum,
  checkProductUzum,
  fetchProductDetail,
  syncModerationReasons,
} from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { useQueryState } from "@/lib/use-query-state";
import { cn } from "@/lib/utils";
import type { ProductDetail, ProductValidationFinding, SalesPeriod, WarehouseProduct } from "@/lib/types";

export default function ProductDetailPage() {
  const [tab, setTab] = useQueryState("view", "daily");

  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [data, setData] = React.useState<ProductDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [intakeFor, setIntakeFor] = React.useState<WarehouseProduct | null>(null);
  const [busy, setBusy] = React.useState<"" | "check" | "ai" | "auto" | "reason">("");
  const [fixNote, setFixNote] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchProductDetail(id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (Number.isFinite(id)) void load();
  }, [id, load]);
  useAutoRefresh(load);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/warehouse">
            <ArrowLeft className="h-3.5 w-3.5" /> Omborga qaytish
          </Link>
        </Button>
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error ?? "Tovar topilmadi"}
        </div>
      </div>
    );
  }

  const p = data.product;
  const moderationErrors = Array.isArray(data.moderationErrors) ? data.moderationErrors : [];
  const validationAreas =
    p.uzumValidation?.areas && typeof p.uzumValidation.areas === "object"
      ? Object.entries(p.uzumValidation.areas)
      : [];
  const validationFindings = Array.isArray(p.uzumValidation?.findings) ? p.uzumValidation.findings : [];
  const profitPositive = data.totalProfit >= 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/warehouse">
          <ArrowLeft className="h-3.5 w-3.5" /> Omborga qaytish
        </Link>
      </Button>

      <PageHeader
        title={p.title}
        description={[p.variantName, p.skuCode, p.categoryName].filter(Boolean).join(" · ")}
        actions={
          <>
            <Button size="sm" onClick={() => setIntakeFor(p)}>
              <PackagePlus className="h-3.5 w-3.5" /> Kirim
            </Button>
          </>
        }
      />

      <ProductGallery images={p.images} title={p.title} uzumUrl={p.uzumUrl} />

      <Card className={cn("border", p.uzumBlocked && "border-destructive/40 bg-destructive/5")}>
        <CardHeader>
          <CardTitle className="text-base">Uzum tekshiruvi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={p.uzumBlocked ? "destructive" : "outline"}>
              {p.uzumBlocked ? "Blocked" : p.uzumModerationTitle || p.uzumStatusTitle || "Unknown"}
            </Badge>
            {p.uzumValidation && (
              <Badge variant="secondary">Readiness {p.uzumValidation.readiness}%</Badge>
            )}
            {p.uzumBlockingReason && (
              <span className="text-sm text-destructive">{p.uzumBlockingReason}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={busy !== ""}
              onClick={async () => {
                setBusy("check");
                try {
                  setData(await checkProductUzum(id));
                } finally {
                  setBusy("");
                }
              }}
            >
              Uzum tekshiruvi
            </Button>
            {(p.uzumBlocked || p.uzumModerationValue === "HAS_COMPLAINTS") && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy !== ""}
                onClick={async () => {
                  setBusy("reason");
                  setFixNote(null);
                  try {
                    const res = await syncModerationReasons(id);
                    setFixNote(res.message);
                    await load();
                  } catch (e) {
                    setFixNote(e instanceof Error ? e.message : "Xatolik");
                  } finally {
                    setBusy("");
                  }
                }}
              >
                Uzum sababini aniqlash
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={busy !== ""}
              onClick={async () => {
                setBusy("ai");
                try {
                  const res = await aiFixProductUzum(id);
                  window.location.assign(`/warehouse?draft=${res.draftId}`);
                } finally {
                  setBusy("");
                }
              }}
            >
              AI bilan tuzatish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy !== ""}
              onClick={async () => {
                setBusy("auto");
                setFixNote(null);
                try {
                  const res = await autoFixProductUzum(id);
                  const applied = res.deterministicFix?.applied ?? [];
                  const manual = res.deterministicFix?.manual ?? [];
                  const aiUsed = res.deterministicFix?.aiUsed ?? false;
                  if (applied.length || manual.length) {
                    const parts: string[] = [];
                    if (applied.length)
                      parts.push(
                        `${aiUsed ? "tuzatildi (AI tavsifni rasmga mosladi)" : "tuzatildi"}: ${applied.join(", ")}`,
                      );
                    if (manual.length)
                      parts.push(
                        `qo'lda kerak: ${manual
                          .map((m) => m.blockType || m.reason)
                          .filter(Boolean)
                          .join(", ")}`,
                      );
                    setFixNote(parts.join(" · "));
                  }
                  window.location.assign(`/warehouse?draft=${res.draftId}`);
                } catch (e) {
                  setFixNote(e instanceof Error ? e.message : "Xatolik");
                } finally {
                  setBusy("");
                }
              }}
            >
              Avtomatik tuzatish
            </Button>
          </div>

          {fixNote && (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {fixNote}
            </div>
          )}

          {p.uzumValidation && validationAreas.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2">
              {validationAreas.map(([field, state]) => (
                <div key={field} className="rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{field}</span>
                  <span className="ml-2 text-muted-foreground">{state}</span>
                </div>
              ))}
            </div>
          )}

          {moderationErrors.length > 0 && (
            <div className="space-y-2">
              {moderationErrors.map((item) => (
                <div key={item.id} className="rounded-md border border-destructive/30 p-3 text-sm">
                  <div className="font-medium">{item.errorMessage}</div>
                  {item.ruleTitle && (
                    <div className="text-muted-foreground">
                      Qoida: {item.ruleTitle}
                    </div>
                  )}
                  {item.explanation && <div className="text-muted-foreground">{item.explanation}</div>}
                  {item.suggestedFix && <div className="mt-1">{item.suggestedFix}</div>}
                </div>
              ))}
            </div>
          )}

          {validationFindings.length ? (
            <div className="space-y-2">
              {validationFindings.map((finding, index) => (
                <FindingRow key={`${finding.field}-${index}`} finding={finding} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Hali tekshiruv natijasi yo&apos;q.</div>
          )}
        </CardContent>
      </Card>

      <ChangeHistoryCard
        productId={id}
        changeLogs={data.changeLogs ?? []}
        draftTextPushedAt={data.draftTextPushedAt ?? null}
        onReverted={load}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Tile label="Jami keldi" value={`${formatNumber(data.totalIntakeQuantity)} dona`} />
        <Tile label="Jami sotildi" value={`${formatNumber(data.totalSoldQuantity)} dona`} />
        <Tile label="Qoldiq" value={`${formatNumber(data.onHand)} dona`} hint={formatSum(data.stockValue)} />
        <Tile label="Uzum to'lovi" value={formatSum(data.totalRevenue)} />
        <Tile label="Tan narx (FIFO)" value={formatSum(data.totalCogs)} />
        <Tile
          label={profitPositive ? "Sof foyda" : "Zarar"}
          value={formatSum(data.totalProfit)}
          tone={profitPositive ? "positive" : "negative"}
        />
      </div>

      {data.uncoveredQuantity > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
          <span className="font-medium">{data.uncoveredQuantity} dona</span> sotilgan, lekin
          unga mos kirim kiritilmagan — bu qismning tan narxi hisobga olinmagan, ya&apos;ni
          haqiqiy foyda ko&apos;rsatilganidan kamroq.
        </div>
      )}

      <ProductStats
        productId={id}
        tempo={data.tempo}
        onHand={data.onHand}
        facts={data.marketplace}
      />

      <UzumFactsCard facts={data.marketplace} />

      <SiblingsCard siblings={data.siblings} tempo={data.tempo} />

      {/* Qidiruvdagi o'rin — "qaysi so'z bilan izlaganda nechanchimiz".
          Tovarning o'z sahifasida turishi shart: sotuvchi narx va
          qoldiqni ko'rib turib, o'sha yerda kalit so'z qo'shadi. */}
      <PositionsBlock productId={id} />

      <BreakEvenCard productId={id} economics={data.economics} onApplied={load} />

      <ReturnsCard returns={data.returns} summary={data.returnsSummary} />

      <AdVerdictCard productId={id} />

      <ProductNetworksCard product={p} />

      <ProductInstagramCard productId={id} />

      <MarketCard productId={id} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sotuvlar kesimi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="daily">Kunlik</TabsTrigger>
              <TabsTrigger value="monthly">Oylik</TabsTrigger>
              <TabsTrigger value="yearly">Yillik</TabsTrigger>
            </TabsList>
            <TabsContent value="daily"><PeriodTable rows={[...data.daily].reverse()} /></TabsContent>
            <TabsContent value="monthly"><PeriodTable rows={[...data.monthly].reverse()} /></TabsContent>
            <TabsContent value="yearly"><PeriodTable rows={[...data.yearly].reverse()} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kirim partiyalari ({data.intakes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {data.intakes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Hali kirim kiritilmagan.</p>
          ) : (
            <>
            <CardList>
              {data.intakes.map((b) => (
                <DataCard key={b.id}>
                  <CardHead
                    title={b.receivedAt.slice(0, 10)}
                    note={b.supplier ?? "—"}
                    right={
                      b.remainingQuantity === 0 ? (
                        <Badge variant="secondary">tugagan</Badge>
                      ) : (
                        <span className="text-sm font-medium tabular-nums">
                          {formatNumber(b.remainingQuantity)} qoldi
                        </span>
                      )
                    }
                  />
                  <CardStats
                    items={[
                      { label: "Keldi", value: `${formatNumber(b.quantity)} dona` },
                      { label: "Tan narx", value: formatSum(b.costPrice) },
                      { label: "Sotildi", value: formatNumber(b.soldQuantity) },
                      { label: "Jami", value: formatSum(b.costPrice * b.quantity) },
                    ]}
                  />
                </DataCard>
              ))}
            </CardList>

            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Sana</th>
                    <th className="px-3 py-2 text-right font-medium">Keldi</th>
                    <th className="px-3 py-2 text-right font-medium">Tan narx</th>
                    <th className="px-3 py-2 text-right font-medium">Sotildi / qoldi</th>
                    <th className="px-3 py-2 text-left font-medium">Yetkazib beruvchi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.intakes.map((b) => (
                    <tr key={b.id}>
                      <td className="px-3 py-2 tabular-nums">{b.receivedAt.slice(0, 10)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatNumber(b.quantity)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatSum(b.costPrice)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {b.remainingQuantity === 0 ? (
                          <Badge variant="secondary">tugagan</Badge>
                        ) : (
                          `${formatNumber(b.soldQuantity)} / ${formatNumber(b.remainingQuantity)}`
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{b.supplier ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      <IntakeDialog
        product={intakeFor}
        onOpenChange={(open) => !open && setIntakeFor(null)}
        onSaved={load}
      />
    </div>
  );
}

function FindingRow({ finding }: { finding: ProductValidationFinding }) {
  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{finding.field}</span>
        <Badge variant={finding.level === "error" ? "destructive" : finding.level === "warning" ? "secondary" : "outline"}>
          {finding.level}
        </Badge>
      </div>
      <div className="mt-1">{finding.message}</div>
      {finding.ruleTitle && (
        <div className="text-muted-foreground">
          Qoida: {finding.ruleTitle}
        </div>
      )}
      {finding.explanation && <div className="text-muted-foreground">{finding.explanation}</div>}
      {finding.suggestion && <div className="mt-1">{finding.suggestion}</div>}
      {finding.proposedValue && (
        <div className="mt-1 text-muted-foreground">
          Taklif: {finding.proposedValue}
        </div>
      )}
    </div>
  );
}

function PeriodTable({ rows }: { rows: SalesPeriod[] }) {
  if (!rows.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Sotuv yo&apos;q.</p>;
  }
  return (
    <>
    <CardList className="mt-3">
      {rows.map((r) => (
        <DataCard key={r.period}>
          <CardHead
            title={r.period}
            note={`${formatNumber(r.soldQuantity)} dona sotildi`}
            right={
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  r.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                )}
              >
                {formatSum(r.profit)}
              </span>
            }
          />
          <CardStats
            items={[
              { label: "O'rtacha narx", value: formatSum(r.avgPrice) },
              { label: "Uzum to'lovi", value: formatSum(r.revenue) },
              { label: "Tan narx", value: formatSum(r.cogs), tone: "muted" },
            ]}
          />
        </DataCard>
      ))}
    </CardList>

    <div className="mt-3 hidden overflow-x-auto rounded-lg border md:block">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Davr</th>
            <th className="px-3 py-2 text-right font-medium">Sotildi</th>
            <th className="px-3 py-2 text-right font-medium">O&apos;rtacha narx</th>
            <th className="px-3 py-2 text-right font-medium">Uzum to&apos;lovi</th>
            <th className="px-3 py-2 text-right font-medium">Tan narx</th>
            <th className="px-3 py-2 text-right font-medium">Foyda</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.period} className="transition-colors hover:bg-muted/30">
              <td className="px-3 py-2 font-medium tabular-nums">{r.period}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatNumber(r.soldQuantity)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatSum(r.avgPrice)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatSum(r.revenue)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                {formatSum(r.cogs)}
              </td>
              <td
                className={cn(
                  "px-3 py-2 text-right font-medium tabular-nums",
                  r.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                )}
              >
                {formatSum(r.profit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

function Tile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <Card
      className={cn(
        tone === "positive" && "border-emerald-500/40 bg-emerald-500/5",
        tone === "negative" && "border-destructive/40 bg-destructive/5"
      )}
    >
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={cn(
            "font-semibold tabular-nums",
            tone === "positive" && "text-emerald-600 dark:text-emerald-400",
            tone === "negative" && "text-destructive"
          )}
        >
          {value}
        </div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}
