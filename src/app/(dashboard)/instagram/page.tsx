"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, ImagePlus, Camera as InstagramIcon,
  Loader2, Megaphone, Pause, Play, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdDialog } from "@/features/instagram/components/ad-dialog";
import { LinkDialog } from "@/features/instagram/components/link-dialog";
import { PostCard } from "@/features/instagram/components/post-card";
import { PublishDialog } from "@/features/instagram/components/publish-dialog";
import {
  ApiError, deleteInstagramAd, fetchInstagramAccount, fetchInstagramAds,
  fetchInstagramCoverage, fetchInstagramPosts, startInstagramAd, stopInstagramAd,
  unlinkPostFromProduct,
} from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { cn } from "@/lib/utils";
import type {
  CoverageItem, InstagramAccount, InstagramAd, InstagramCoverage, InstagramPost,
} from "@/lib/types";

export default function InstagramPage() {
  const [account, setAccount] = React.useState<InstagramAccount | null>(null);
  const [posts, setPosts] = React.useState<InstagramPost[]>([]);
  const [coverage, setCoverage] = React.useState<InstagramCoverage | null>(null);
  const [ads, setAds] = React.useState<InstagramAd[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [linking, setLinking] = React.useState<InstagramPost | null>(null);
  const [advertising, setAdvertising] = React.useState<InstagramPost | null>(null);
  const [publishing, setPublishing] = React.useState<CoverageItem | null>(null);
  const [busy, setBusy] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    try {
      const acc = await fetchInstagramAccount();
      setAccount(acc);
      if (!acc.connected) return;
      const [postList, cov, adList] = await Promise.all([
        fetchInstagramPosts(),
        fetchInstagramCoverage(),
        fetchInstagramAds().catch(() => [] as InstagramAd[]),
      ]);
      setPosts(postList);
      setCoverage(cov);
      setAds(adList);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load);

  const onUnlink = async (post: InstagramPost, productId: number) => {
    try {
      await unlinkPostFromProduct(post.id, productId);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Uzilmadi.");
    }
  };

  const onToggleAd = async (ad: InstagramAd) => {
    setBusy(ad.id);
    try {
      if (ad.status === "active") {
        await stopInstagramAd(ad.id);
        toast.success("Reklama to'xtatildi");
      } else {
        await startInstagramAd(ad.id);
        toast.success("Reklama yoqildi");
      }
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setBusy(null);
    }
  };

  const onDeleteAd = async (ad: InstagramAd) => {
    setBusy(ad.id);
    try {
      await deleteInstagramAd(ad.id);
      toast.success("O'chirildi");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirilmadi.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!account?.connected) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Instagram"
          description="Postlarni tovarga bog'lang, statistikani ko'ring va bir tugma bilan reklama yoqing."
        />
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <InstagramIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Instagram hali ulanmagan</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Ulangandan keyin postlaringiz shu yerga tortiladi: qaysi post qaysi
                tovarga tegishli ekanini belgilaysiz, nechta odam ko&apos;rgani va
                jo&apos;natgani ko&apos;rinadi.
              </p>
            </div>
            <Link
              href={"/settings" as Route}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sozlamalarda ulash <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeAds = ads.filter((a) => a.status === "active");
  const totalSpend = ads.reduce((sum, a) => sum + a.spend, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instagram"
        description="Postlarni tovarga bog'lang, statistikani ko'ring va reklamani shu yerdan boshqaring."
        badge={
          account.username ? (
            <Badge variant="secondary">{`@${account.username}`}</Badge>
          ) : null
        }
      />

      {account.missing.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
          <div>
            <div className="font-medium">Ba&apos;zi imkoniyatlar yopiq</div>
            <ul className="mt-1 list-inside list-disc text-muted-foreground">
              {account.missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href={"/settings" as Route} className="mt-1 inline-block text-primary hover:underline">
              Sozlamalarga o&apos;tish
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Obunachi" value={formatNumber(account.followers)} />
        <Stat label="Post" value={formatNumber(posts.length)} />
        <Stat
          label="Bog'langan tovar"
          value={`${coverage?.posted ?? 0} / ${coverage?.total ?? 0}`}
        />
        <Stat
          label="Reklamaga ketgan"
          value={formatSum(totalSpend)}
          hint={activeAds.length > 0 ? `${activeAds.length} ta ishlayapti` : undefined}
        />
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">{`Postlar (${posts.length})`}</TabsTrigger>
          <TabsTrigger value="missing">{`Qo'yilmagan (${coverage?.missing ?? 0})`}</TabsTrigger>
          <TabsTrigger value="ads">{`Reklama (${ads.length})`}</TabsTrigger>
        </TabsList>

        {/* ── Postlar ──────────────────────────────────────────────────── */}
        <TabsContent value="posts" className="mt-4">
          {posts.length === 0 ? (
            <Empty text="Post topilmadi. Instagram'da post joylang yoki «Qo'yilmagan» bo'limidan tovar joylang." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLink={setLinking}
                  onUnlink={onUnlink}
                  onAdvertise={setAdvertising}
                  canAdvertise={account.canAdvertise}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Qo'yilmagan tovarlar ─────────────────────────────────────── */}
        <TabsContent value="missing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instagram&apos;da yo&apos;q tovarlar</CardTitle>
              <CardDescription>
                Eng ko&apos;p sotilgani yuqorida. Bir tugma bilan Uzum&apos;dagi rasm va
                matn bilan post qilinadi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(coverage?.items ?? []).length === 0 ? (
                <Empty text="Hamma tovar Instagram'da bor." />
              ) : (
                coverage!.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="h-11 w-11 rounded-md border object-cover" />
                    ) : (
                      <div className="h-11 w-11 rounded-md border bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/warehouse/${item.productId}` as Route}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {`${formatNumber(item.soldQuantity)} sotilgan · qoldiq ${formatNumber(item.stock)} · ${item.imageCount} ta rasm`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 gap-1.5"
                      onClick={() => setPublishing(item)}
                      disabled={!item.canPublish || !account.canPublish}
                      title={item.reason ?? undefined}
                    >
                      <ImagePlus className="h-3.5 w-3.5" /> Post qilish
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Reklama ──────────────────────────────────────────────────── */}
        <TabsContent value="ads" className="mt-4">
          {ads.length === 0 ? (
            <Empty text="Hali reklama yoqilmagan. «Postlar» bo'limidan istalgan postga reklama yoqing." />
          ) : (
            <div className="space-y-3">
              {ads.map((ad) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-xl border p-4",
                    ad.status === "active" && "border-emerald-500/40 bg-emerald-500/5",
                    ad.status === "failed" && "border-destructive/40 bg-destructive/5"
                  )}
                >
                  <div className="flex flex-wrap items-start gap-3">
                    {ad.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ad.thumbnail} alt="" className="h-14 w-14 rounded-md border object-cover" />
                    ) : (
                      <div className="h-14 w-14 rounded-md border bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{ad.title}</span>
                        <AdStatusBadge status={ad.status} />
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {`${formatSum(ad.dailyBudget)}/kun · ${ad.audience ?? ""}`}
                      </div>
                      {ad.error && (
                        <div className="mt-1 text-xs text-destructive">{ad.error}</div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {ad.status !== "failed" && (
                        <Button
                          variant={ad.status === "active" ? "outline" : "default"}
                          size="sm"
                          onClick={() => onToggleAd(ad)}
                          disabled={busy === ad.id}
                          className="gap-1.5"
                        >
                          {busy === ad.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : ad.status === "active" ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          {ad.status === "active" ? "To'xtatish" : "Yoqish"}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteAd(ad)}
                        disabled={busy === ad.id}
                        className="text-destructive hover:text-destructive"
                        aria-label="O'chirish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {ad.spend > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 sm:grid-cols-4">
                      <Mini label="Sarflandi" value={formatSum(ad.spend)} />
                      <Mini label="Ko'rsatildi" value={formatNumber(ad.impressions)} />
                      <Mini label="Bosildi" value={formatNumber(ad.clicks)} />
                      <Mini
                        label="Bir bosish"
                        value={ad.costPerClick ? formatSum(ad.costPerClick) : "—"}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <LinkDialog
        post={linking}
        onOpenChange={(open) => !open && setLinking(null)}
        onSaved={load}
      />
      <AdDialog
        post={advertising}
        onOpenChange={(open) => !open && setAdvertising(null)}
        onSaved={load}
      />
      <PublishDialog
        productId={publishing?.productId ?? null}
        onOpenChange={(open) => !open && setPublishing(null)}
        onPublished={load}
      />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-xs text-emerald-600 dark:text-emerald-400">{hint}</div>}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

const AD_STATUS = {
  draft: { label: "Qoralama", variant: "secondary" },
  paused: { label: "To'xtatilgan", variant: "secondary" },
  active: { label: "Ishlayapti", variant: "success" },
  finished: { label: "Tugagan", variant: "secondary" },
  failed: { label: "Xato", variant: "destructive" },
} as const;

function AdStatusBadge({ status }: { status: InstagramAd["status"] }) {
  const item = AD_STATUS[status] ?? AD_STATUS.draft;
  return (
    <Badge variant={item.variant} className="gap-1">
      {status === "active" && <Megaphone className="h-3 w-3" />}
      {item.label}
    </Badge>
  );
}
