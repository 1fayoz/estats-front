"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Route } from "next";
import {
  Activity, AlertTriangle, ArrowLeft, Check, Copy, Download, ExternalLink,
  Image as ImageIcon, Loader2, MessageSquare, PenLine, SlidersHorizontal,
  Sparkles, Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttributesBlock } from "@/features/seo/components/attributes-block";
import { FixBlock } from "@/features/seo/components/fix-block";
import { ReviewsBlock } from "@/features/seo/components/reviews-block";
import { RivalsBlock } from "@/features/seo/components/rivals-block";
import { PositionsBlock } from "@/features/seo/components/positions-block";
import { RunPicker } from "@/features/seo/components/run-picker";
import { ScoreRing } from "@/features/seo/components/score-ring";
import {
  ApiError, downloadSeoAudit, fetchProductDetail, fetchSeoAudit, runSeoAnalyse,
  runSeoContent, runSeoMedia,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { useQueryNumber, useQueryState } from "@/lib/use-query-state";
import { cn } from "@/lib/utils";
import type { SeoAudit } from "@/lib/types";

type Job = "analyse" | "media" | "content" | null;

export default function SeoDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [audit, setAudit] = React.useState<SeoAudit | null>(null);
  const [externalId, setExternalId] = React.useState<string | null>(null);
  // Tab va ko'rilayotgan tahlil MANZILDA: yangilash ham, orqaga
  // qaytish ham sahifani boshiga tashlamasin.
  const [tab, setTab] = useQueryState("tab", "audit");
  const [runId, setRunId] = useQueryNumber("run");
  const [job, setJob] = React.useState<Job>(null);
  const [exporting, setExporting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const [row, product] = await Promise.all([
        fetchSeoAudit(productId, runId),
        // Uzum'dagi tahrir sahifasiga havola uchun tashqi id kerak.
        fetchProductDetail(productId).catch(() => null),
      ]);
      setAudit(row);
      setExternalId(product?.product.externalProductId ?? null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }, [productId, runId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const run = async (kind: Exclude<Job, null>) => {
    setJob(kind);
    try {
      const fn =
        kind === "analyse" ? runSeoAnalyse : kind === "media" ? runSeoMedia : runSeoContent;
      setAudit(await fn(productId));
      toast.success(
        kind === "analyse" ? "Tahlil tayyor"
          : kind === "media" ? "Rasmlar ko'rib chiqildi"
            : "Matn yozildi",
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setJob(null);
    }
  };

  /** Ko'rilayotgan tahlilni faylga chiqaradi — tarixdagisini ham. */
  const exportAudit = async () => {
    setExporting(true);
    try {
      await downloadSeoAudit(productId, runId);
      toast.success("Excel fayl yuklab olindi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Fayl chiqmadi.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }
  if (!audit) return null;

  const analysed = Boolean(audit.analyzedAt);

  return (
    <div className="space-y-6">
      <Link
        href={"/seo" as Route}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> SEO audit
      </Link>

      <PageHeader
        title={audit.title}
        description={
          analysed
            ? `Oxirgi tahlil: ${new Date(audit.analyzedAt!).toLocaleString("uz-UZ")}`
            : "Hali tahlil qilinmagan"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={`/warehouse/${audit.productId}` as Route}>
              <Button variant="outline" size="sm" className="gap-1.5">
                Tovar <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
            {analysed ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={exportAudit}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Excel
              </Button>
            ) : null}
            <Button size="sm" className="gap-1.5" onClick={() => run("analyse")} disabled={job !== null}>
              {job === "analyse" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              {analysed ? "Qayta tahlil" : "Tahlil qilish"}
            </Button>
          </div>
        }
      />

      {!analysed ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Tahlil hali yuritilmagan</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Kalit so&apos;zlar yadrosi Uzum qidiruvi orqali o&apos;lchanadi —
                bu bir necha o&apos;n soniya oladi.
              </p>
            </div>
            <Button className="gap-1.5" onClick={() => run("analyse")} disabled={job !== null}>
              {job === "analyse" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Tahlil qilish
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <RunPicker runs={audit.runs} activeId={runId} onPick={setRunId} />
          <ScoreBlock audit={audit} />

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              <TabsTrigger value="audit">Xulosalar</TabsTrigger>
              <TabsTrigger value="keywords">
                {`Kalit so'zlar (${audit.keywordsTotal})`}
              </TabsTrigger>
              <TabsTrigger value="attributes" className="gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Xususiyatlar
                {audit.attributes && audit.attributes.missing.length > 0 && (
                  <span className="rounded bg-amber-500/20 px-1 text-[10px] text-amber-600 dark:text-amber-500">
                    {audit.attributes.missing.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Sharhlar
                {audit.reviews && audit.reviews.total > 0 && (
                  <span className="rounded bg-background/70 px-1 text-[10px]">
                    {audit.reviews.total}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> Rasmlar
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI matn
              </TabsTrigger>
              <TabsTrigger value="fix" className="gap-1.5">
                <PenLine className="h-3.5 w-3.5" /> Tuzatish
                {audit.appliedAt && (
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="positions" className="gap-1.5">
                <Activity className="h-3.5 w-3.5" /> O&apos;rinlar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audit" className="mt-4">
              <VerdictsBlock audit={audit} />
            </TabsContent>

            <TabsContent value="keywords" className="mt-4">
              <KeywordsBlock audit={audit} />
            </TabsContent>

            <TabsContent value="attributes" className="mt-4">
              <AttributesBlock
                attributes={audit.attributes}
                editUrl={
                  externalId
                    ? `https://seller.uzum.uz/seller/product/${externalId}/edit`
                    : null
                }
              />
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <ReviewsBlock reviews={audit.reviews} />
            </TabsContent>

            <TabsContent value="media" className="mt-4">
              <MediaBlock audit={audit} job={job} onRun={() => run("media")} />
            </TabsContent>

            <TabsContent value="content" className="mt-4">
              <ContentBlock audit={audit} job={job} onRun={() => run("content")} />
            </TabsContent>

            <TabsContent value="fix" className="mt-4">
              <FixBlock
                audit={audit}
                externalId={externalId}
                onSaved={setAudit}
              />
            </TabsContent>

            <TabsContent value="positions" className="mt-4 space-y-3">
              <PositionsBlock productId={audit.productId} />
              <RivalsBlock productId={audit.productId} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function ScoreBlock({ audit }: { audit: SeoAudit }) {
  const parts = [
    { label: "Nom", value: audit.titleScore, max: 25 },
    { label: "Tavsif", value: audit.descriptionScore, max: 20 },
    { label: "Kalit so'zlar", value: audit.keywordScore, max: 40 },
    { label: "Xususiyatlar", value: audit.attributeScore, max: 15 },
  ];
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardContent className="flex items-center gap-4 p-4">
          <ScoreRing score={audit.score} size={80} />
          <div className="min-w-0 space-y-1">
            {parts.map((p) => (
              <div key={p.label} className="text-xs">
                <span className="text-muted-foreground">{p.label}: </span>
                <span className="font-medium tabular-nums">{`${p.value}/${p.max}`}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
          <Mini label="Kalit so'z" value={`${audit.keywordsUsed}/${audit.keywordsTotal}`} />
          <Mini label="Qamralgan" value={formatNumber(audit.coverageUsed)} />
          <Mini
            label="Qo'ldan ketyapti"
            value={formatNumber(audit.coverageMissed)}
            tone={audit.coverageMissed > 0 ? "bad" : undefined}
          />
          <Mini label="Ortiqcha so'zlar" value={`${audit.stopRatio}%`} />
        </CardContent>
      </Card>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "bad" }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 text-lg font-bold tabular-nums", tone === "bad" && "text-destructive")}>
        {value}
      </div>
    </div>
  );
}

function VerdictsBlock({ audit }: { audit: SeoAudit }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {audit.verdicts.map((verdict) => (
        <Card key={verdict.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{verdict.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {verdict.good.map((line) => (
              <div key={line} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                <span className="text-muted-foreground">{line}</span>
              </div>
            ))}
            {verdict.warnings.map((line) => (
              <div key={line} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
                <span className="text-muted-foreground">{line}</span>
              </div>
            ))}
            {verdict.good.length === 0 && verdict.warnings.length === 0 && (
              <p className="text-sm text-muted-foreground">Aytadigan gap yo&apos;q.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function KeywordsBlock({ audit }: { audit: SeoAudit }) {
  const [onlyMissing, setOnlyMissing] = React.useState(false);
  const rows = onlyMissing
    ? audit.keywords.filter((k) => !k.inTitle && !k.inDescription)
    : audit.keywords;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Kalit so&apos;zlar yadrosi</CardTitle>
            <CardDescription>
              {audit.aiUsed
                ? "Tovar, raqobatchilar va AI'dan yig'ildi, har biri Uzum qidiruvida o'lchandi."
                : "Tovar va raqobatchilardan yig'ildi. AI kaliti ulansa yadro kengayadi."}
            </CardDescription>
          </div>
          <Button
            variant={onlyMissing ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyMissing((v) => !v)}
          >
            Faqat ishlatilmaganlari
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Kalit so&apos;z</th>
                <th className="pb-2 pr-3 text-right font-medium">Qamrov</th>
                <th className="pb-2 pr-3 text-right font-medium">Raqobat</th>
                <th className="pb-2 pr-3 text-right font-medium">Sharh</th>
                <th className="pb-2 pr-3 text-right font-medium">Nomda</th>
                <th className="pb-2 pr-3 text-right font-medium">Tavsifda</th>
                <th className="pb-2 text-right font-medium">Ulush</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const used = row.inTitle > 0 || row.inDescription > 0;
                return (
                  <tr
                    key={row.phrase}
                    className={cn("border-b last:border-0", !used && "bg-destructive/5")}
                  >
                    <td className="py-2 pr-3">
                      <span className="font-medium">{row.phrase}</span>
                      {row.language && (
                        <span className="ml-1.5 text-[10px] uppercase text-muted-foreground">
                          {row.language}
                        </span>
                      )}
                      {row.category && (
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {row.category}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatNumber(row.coverage)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                      {formatNumber(row.products)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                      {formatNumber(row.reviews)}
                    </td>
                    <td className={cn("py-2 pr-3 text-right tabular-nums", row.inTitle > 0 && "text-emerald-600 dark:text-emerald-500")}>
                      {row.inTitle}
                    </td>
                    <td className={cn("py-2 pr-3 text-right tabular-nums", row.inDescription > 0 && "text-emerald-600 dark:text-emerald-500")}>
                      {row.inDescription}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{row.share}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Hamma kalit so&apos;z ishlatilgan.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MediaBlock({ audit, job, onRun }: { audit: SeoAudit; job: Job; onRun: () => void }) {
  const media = audit.media;
  if (!media) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            AI galereyani ko&apos;rib chiqadi: nechta rasm modelda, qaysilari
            infografika, ularda matn bormi — va rasmda ko&apos;rinib turgan
            faktlarni yozib beradi.
          </p>
          <Button className="gap-1.5" onClick={onRun} disabled={job !== null}>
            {job === "media" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            Rasmlarni tahlil qilish
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-5">
          <Mini label="Jami rasm" value={String(media.total)} />
          <Mini label="Infografika" value={String(media.infographics)} tone={media.infographics === 0 ? "bad" : undefined} />
          <Mini label="Modelda" value={String(media.on_model)} />
          <Mini label="Buyum o'zi" value={String(media.product_only)} />
          <Mini label="Matnli" value={String(media.with_text)} />
        </CardContent>
      </Card>

      {media.summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rasmlardan ko&apos;ringani</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{media.summary}</p>
            {media.facts.length > 0 && (
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {media.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {media.advice.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Galereyani yaxshilash</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {media.advice.map((line) => (
              <div key={line} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
                <span className="text-muted-foreground">{line}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button variant="outline" size="sm" className="gap-1.5" onClick={onRun} disabled={job !== null}>
        {job === "media" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
        Qayta ko&apos;rib chiqish
      </Button>
    </div>
  );
}

function ContentBlock({ audit, job, onRun }: { audit: SeoAudit; job: Job; onRun: () => void }) {
  const made = audit.generated;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Nusxalandi");
    } catch {
      toast.error("Nusxalab bo'lmadi.");
    }
  };

  if (!made) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            AI yadrodagi kalit so&apos;zlarni ishlatib, ikki tilda yangi nom va
            tavsif yozadi. Matn tayyor holda chiqadi — o&apos;zingiz ko&apos;rib,
            keyin Uzum&apos;ga qo&apos;yasiz.
          </p>
          <Button className="gap-1.5" onClick={onRun} disabled={job !== null}>
            {job === "content" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Matn yozdirish
          </Button>
        </CardContent>
      </Card>
    );
  }

  const blocks: { label: string; value: string }[] = [
    { label: "Nom (UZ)", value: made.title_uz },
    { label: "Nom (RU)", value: made.title_ru },
    { label: "Tavsif (UZ)", value: made.description_uz },
    { label: "Tavsif (RU)", value: made.description_ru },
  ];

  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <Card key={block.label}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">{block.label}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{block.value.length} belgi</span>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" onClick={() => copy(block.value)}>
                  <Copy className="h-3 w-3" /> Nusxa
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{block.value}</p>
          </CardContent>
        </Card>
      ))}

      {made.highlights.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Qisqa tezislar</CardTitle>
            <CardDescription>Xaridor uchun foyda — xususiyat emas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {made.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {made.tags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Teglar</CardTitle>
            <CardDescription>
              Matnga tabiiy sig&apos;magan so&apos;rovlar — tavsif oxiriga qo&apos;shiladi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {made.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Button variant="outline" size="sm" className="gap-1.5" onClick={onRun} disabled={job !== null}>
        {job === "content" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        Qayta yozdirish
      </Button>
    </div>
  );
}
