"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Search, Send, Share2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstagramPanel } from "@/features/instagram/components/instagram-panel";
import { LinkPostDialog } from "@/features/social/components/link-post-dialog";
import { PostTile } from "@/features/social/components/post-tile";
import { PublishEverywhereDialog } from "@/features/social/components/publish-everywhere-dialog";
import {
  fetchNetworksOverview, fetchProducts, fetchSocialAccounts, fetchSocialPosts, unlinkSocialPost,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { NetworkIcon } from "@/components/brand/network-icons";
import { PLATFORM_LABEL, PLATFORM_ORDER } from "@/lib/platforms";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { useQueryState } from "@/lib/use-query-state";
import { cn } from "@/lib/utils";
import type {
  NetworksOverview, SocialAccount, SocialPlatform, SocialPost, WarehouseProduct,
} from "@/lib/types";

/**
 * Ijtimoiy tarmoqlarning yagona bo'limi.
 *
 * Ikki savol bir joyda: "shu tarmoqda nima bor" (tarmoq tablari) va
 * "shu tovar qayerda bor" (Bog'lanishlar tabi). Ilgari ular ikki
 * boshqa sahifada edi va tovarni tarmoqlar bo'ylab kuzatib bo'lmasdi.
 */
export default function SocialsPage() {
  const [posts, setPosts] = React.useState<SocialPost[]>([]);
  const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
  const [products, setProducts] = React.useState<WarehouseProduct[]>([]);
  const [overview, setOverview] = React.useState<NetworksOverview | null>(null);
  const [linking, setLinking] = React.useState<SocialPost | null>(null);
  const [publishing, setPublishing] = React.useState<WarehouseProduct | null>(null);
  const [query, setQuery] = useQueryState("q", "");
  const [tab, setTab] = useQueryState("tab", "coverage");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const [postList, accountList, productPage, stats] = await Promise.all([
        fetchSocialPosts(),
        fetchSocialAccounts(),
        fetchProducts({ page: 1, size: 200 }),
        fetchNetworksOverview().catch(() => null),
      ]);
      setPosts(postList);
      setAccounts(accountList);
      setProducts(productPage.results);
      setOverview(stats);
    } catch {
      /* qisman yuklansa ham sahifa ishlashi kerak */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load);

  const onUnlink = async (post: SocialPost, productId: number) => {
    try {
      await unlinkSocialPost(post.id, productId);
      await load();
    } catch {
      toast.error("Uzilmadi.");
    }
  };

  /** Tovar -> qaysi tarmoqda qaysi e'lon. Bu sahifaning asosiy javobi. */
  const coverage = React.useMemo(() => {
    const map = new Map<number, Map<SocialPlatform, SocialPost[]>>();
    for (const post of posts) {
      for (const product of post.products) {
        if (!map.has(product.id)) map.set(product.id, new Map());
        const byPlatform = map.get(product.id)!;
        byPlatform.set(post.platform, [...(byPlatform.get(post.platform) ?? []), post]);
      }
    }
    return map;
  }, [posts]);

  const connected = React.useMemo(
    () => PLATFORM_ORDER.filter((p) => accounts.some((a) => a.platform === p)),
    [accounts],
  );

  const visibleProducts = products.filter((p) =>
    p.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarmoqlar"
        description="Qaysi tovar qayerda e'lon qilingan va nimani qayerga joylash kerak"
        actions={
          <Link href={"/integrations" as Route}>
            <Button variant="outline" size="sm" className="gap-1.5">
              Integratsiyalar <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />

      {/* Auditoriya alohida sahifa emas: bu bitta qator savolga javob
          beradi — qayerda qancha odam bor — va uni tarmoqlar bo'limidan
          ajratib qo'yishning ma'nosi yo'q edi. */}
      {overview && overview.networks.some((n) => n.accounts > 0) && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {overview.networks
            .filter((n) => n.accounts > 0)
            .map((n) => (
              <div key={n.platform} className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <NetworkIcon platform={n.platform} colored className="h-4 w-4" />
                  <span className="text-sm font-medium">{n.label}</span>
                  {n.accounts > 1 && (
                    <span className="text-xs text-muted-foreground">{`${n.accounts} ta`}</span>
                  )}
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold tabular-nums">
                    {formatNumber(n.followers)}
                  </span>
                  <span className="text-xs text-muted-foreground">obunachi</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {`${formatNumber(n.posts)} e'lon`}
                  {n.audience > 0 && ` · ${formatNumber(n.audience)} ko'rish`}
                  {n.engagementRate != null && n.engagementRate > 0 &&
                    ` · faollik ${n.engagementRate.toFixed(1)}%`}
                </div>
              </div>
            ))}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="coverage" className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Bog&apos;lanishlar
          </TabsTrigger>
          {PLATFORM_ORDER.map((platform) => {
            const count = posts.filter((p) => p.platform === platform).length;
            return (
              <TabsTrigger key={platform} value={platform} className="gap-1.5">
                <NetworkIcon platform={platform} colored className="h-3.5 w-3.5" />
                {PLATFORM_LABEL[platform]}
                {count > 0 && (
                  <span className="rounded bg-background/70 px-1 text-[10px]">{count}</span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="coverage" className="mt-4 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tovar qidirish…"
              className="pl-8"
            />
          </div>

          {connected.length === 0 && (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Hech qanday tarmoq ulanmagan.{" "}
              <Link href={"/integrations" as Route} className="text-primary hover:underline">
                Integratsiyalar
              </Link>{" "}
              sahifasidan boshlang.
            </p>
          )}

          <div className="space-y-2">
            {visibleProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i, 12) * 0.02 }}
                className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
              >
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md border object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-md border bg-muted" />
                )}

                <Link
                  href={`/warehouse/${product.id}` as Route}
                  className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                >
                  {product.title}
                </Link>

                <div className="flex flex-wrap items-center gap-1.5">
                  {PLATFORM_ORDER.map((platform) => {
                    const linked = coverage.get(product.id)?.get(platform) ?? [];
                    const on = linked.length > 0;
                    const href = linked[0]?.permalink;
                    const body = (
                      <>
                        <NetworkIcon platform={platform} colored className="h-3 w-3" />
                        {on ? (linked.length > 1 ? `${linked.length}` : "bor") : "yo'q"}
                      </>
                    );
                    return on && href ? (
                      <a
                        key={platform}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        title={`${PLATFORM_LABEL[platform]}da ochish`}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-1 text-xs text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                      >
                        {body}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span
                        key={platform}
                        title={`${PLATFORM_LABEL[platform]}: e'lon yo'q`}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-1.5 py-1 text-xs",
                          on
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {body}
                      </span>
                    );
                  })}
                </div>

                <Button
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => setPublishing(product)}
                  disabled={accounts.filter((a) => a.canPublish).length === 0}
                >
                  <Send className="h-3.5 w-3.5" /> Joylash
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {PLATFORM_ORDER.map((platform) => {
          const mine = posts.filter((p) => p.platform === platform);
          const hasAccount = accounts.some((a) => a.platform === platform);
          return (
            <TabsContent key={platform} value={platform} className="mt-4">
              {platform === "instagram" ? (
                // Instagram'ning o'z oqimi bor — reklama, qamrov, post
                // qilinmagan tovarlar. Uni umumiy ro'yxatga siqib
                // qo'yish yarim imkoniyatni yashirib qo'yardi.
                <InstagramPanel />
              ) : !hasAccount ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  {PLATFORM_LABEL[platform]} ulanmagan.{" "}
                  <Link href={"/integrations" as Route} className="text-primary hover:underline">
                    Integratsiyalar
                  </Link>{" "}
                  sahifasidan ulang.
                </p>
              ) : mine.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Hali e&apos;lon yo&apos;q.
                  {platform === "telegram" && (
                    <>
                      {" "}
                      Ochiq kanalning eski e&apos;lonlari ham tortiladi, yopiq kanalda esa
                      faqat bot qo&apos;shilgandan keyingilari — bu Telegram cheklovi.
                    </>
                  )}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {mine.map((post) => (
                    <PostTile
                      key={post.id}
                      post={post}
                      onLink={setLinking}
                      onUnlink={onUnlink}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <LinkPostDialog
        post={linking}
        onOpenChange={(open) => !open && setLinking(null)}
        onSaved={load}
      />
      <PublishEverywhereDialog
        product={publishing}
        accounts={accounts}
        onOpenChange={(open) => !open && setPublishing(null)}
      />
    </div>
  );
}
