"use client";

import * as React from "react";
import { ExternalLink, Send, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PublishEverywhereDialog } from "./publish-everywhere-dialog";
import { fetchSocialAccounts, fetchSocialPosts } from "@/lib/api";
import { NetworkIcon } from "@/components/brand/network-icons";
import { PLATFORM_LABEL, PLATFORM_ORDER } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import type { SocialAccount, SocialPost, WarehouseProduct } from "@/lib/types";

/**
 * Tovar sahifasidagi "tarmoqlar" bloki.
 *
 * Bitta savolga javob beradi: shu tovar qayerda e'lon qilingan va
 * qayerda yo'q. Joylash ham shu yerdan — tovarni tanlab, keyin boshqa
 * bo'limga o'tishning hojati yo'q.
 */
export function ProductNetworksCard({ product }: { product: WarehouseProduct }) {
  const [posts, setPosts] = React.useState<SocialPost[]>([]);
  const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
  const [publishing, setPublishing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const [postList, accountList] = await Promise.all([
        fetchSocialPosts({ productId: product.id }),
        fetchSocialAccounts(),
      ]);
      setPosts(postList);
      setAccounts(accountList);
    } catch {
      /* ulanmagan bo'lsa blok ko'rsatilmaydi */
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Skeleton className="h-36 w-full rounded-xl" />;
  if (accounts.length === 0) return null;

  const missing = PLATFORM_ORDER.filter(
    (p) => accounts.some((a) => a.platform === p) && !posts.some((x) => x.platform === p),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Share2 className="h-4 w-4" /> Tarmoqlar
            </CardTitle>
            <CardDescription>
              {missing.length > 0
                ? `${missing.map((p) => PLATFORM_LABEL[p]).join(", ")} — bu tovar hali yo'q.`
                : "Ulangan tarmoqlarning hammasida e'lon bor."}
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setPublishing(true)}
            disabled={accounts.filter((a) => a.canPublish).length === 0}
          >
            <Send className="h-3.5 w-3.5" /> Joylash
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {PLATFORM_ORDER.filter((p) => accounts.some((a) => a.platform === p)).map((platform) => {
          const mine = posts.filter((x) => x.platform === platform);
          return (
            <div key={platform} className="flex items-center gap-2.5 rounded-lg border p-2.5">
              <NetworkIcon platform={platform} colored className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-sm">
                {PLATFORM_LABEL[platform]}
              </span>
              {mine.length === 0 ? (
                <Badge variant="outline">yo&apos;q</Badge>
              ) : (
                <>
                  <Badge variant="success">{`${mine.length} ta e'lon`}</Badge>
                  {mine[0].permalink && (
                    <a
                      href={mine[0].permalink}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "rounded-md border p-1.5 transition-colors hover:bg-accent",
                      )}
                      aria-label={`${PLATFORM_LABEL[platform]}da ochish`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </>
              )}
            </div>
          );
        })}
      </CardContent>

      <PublishEverywhereDialog
        product={publishing ? product : null}
        accounts={accounts}
        onOpenChange={(open) => !open && setPublishing(false)}
      />
    </Card>
  );
}
