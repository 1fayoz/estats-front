"use client";

import * as React from "react";
import { Camera, ExternalLink, Eye, Heart, ImagePlus, Megaphone, Send } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdDialog } from "./ad-dialog";
import { PublishDialog } from "./publish-dialog";
import { fetchInstagramAccount, fetchInstagramPosts } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { InstagramAccount, InstagramPost } from "@/lib/types";

/**
 * Tovar sahifasidagi Instagram bloki.
 *
 * Savol sodda: shu tovar Instagram'da bormi, bo'lsa qanday ishlayapti va
 * unga reklama yoqilganmi. Ulanmagan bo'lsa blok umuman ko'rinmaydi —
 * ishlatilmaydigan bo'limlar sahifani chalg'itadi.
 */
export function ProductInstagramCard({ productId }: { productId: number }) {
  const [account, setAccount] = React.useState<InstagramAccount | null>(null);
  const [posts, setPosts] = React.useState<InstagramPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [publishing, setPublishing] = React.useState(false);
  const [advertising, setAdvertising] = React.useState<InstagramPost | null>(null);

  const load = React.useCallback(async () => {
    try {
      const acc = await fetchInstagramAccount();
      setAccount(acc);
      if (acc.connected) setPosts(await fetchInstagramPosts(productId));
    } catch {
      /* ulanmagan bo'lsa blok ko'rsatilmaydi */
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (!account?.connected) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-4 w-4" /> Instagram
            </CardTitle>
            <CardDescription>
              {posts.length > 0
                ? "Shu tovarga bog'langan postlar va ularning natijasi."
                : "Bu tovar hali Instagram'da yo'q."}
            </CardDescription>
          </div>
          {posts.length === 0 && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setPublishing(true)}
              disabled={!account.canPublish}
              title={account.canPublish ? undefined : "Instagram ulanmagan"}
            >
              <ImagePlus className="h-3.5 w-3.5" /> Post qilish
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {posts.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Uzum&apos;dagi rasm va matn bilan bir tugmada joylash mumkin.
          </p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex items-center gap-3 rounded-lg border p-3">
              {post.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.thumbnail} alt="" className="h-14 w-14 rounded-md border object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-md border bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {post.publishedByUs && <Badge variant="info">MyStats</Badge>}
                  {post.hasAd && (
                    <Badge variant="warning" className="gap-1">
                      <Megaphone className="h-3 w-3" /> Reklama
                    </Badge>
                  )}
                  {post.postedAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.postedAt).toLocaleDateString("uz-UZ")}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1" title="Nechta boshqa-boshqa odam ko'rgan">
                    <Eye className="h-3 w-3" /> {formatNumber(post.reach)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {formatNumber(post.likes)}
                  </span>
                  <span className="inline-flex items-center gap-1" title="Direct orqali jo'natilgan">
                    <Send className="h-3 w-3" /> {formatNumber(post.shares)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setAdvertising(post)}
                  disabled={!account.canAdvertise}
                  title={account.canAdvertise ? undefined : "Reklama kabineti ulanmagan"}
                >
                  <Megaphone className="h-3.5 w-3.5" /> Reklama
                </Button>
                {post.permalink && (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border p-2 transition-colors hover:bg-accent"
                    aria-label="Instagram'da ochish"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>

      <PublishDialog
        productId={publishing ? productId : null}
        onOpenChange={(open) => !open && setPublishing(false)}
        onPublished={load}
      />
      <AdDialog
        post={advertising}
        onOpenChange={(open) => !open && setAdvertising(null)}
        onSaved={load}
      />
    </Card>
  );
}
