"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { ExternalLink, Eye, Heart, Link2, MessageCircle, Bookmark, Send, Megaphone, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InstagramPost } from "@/lib/types";

const KIND_LABEL: Record<InstagramPost["kind"], string> = {
  image: "Rasm",
  video: "Video",
  carousel: "Karusel",
  reel: "Reels",
  story: "Story",
  text: "Matn",
};

export function PostCard({
  post,
  onLink,
  onUnlink,
  onAdvertise,
  canAdvertise,
}: {
  post: InstagramPost;
  onLink: (post: InstagramPost) => void;
  onUnlink: (post: InstagramPost, productId: number) => void;
  onAdvertise: (post: InstagramPost) => void;
  canAdvertise: boolean;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border">
      <div className="relative aspect-square w-full bg-muted">
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          // Rasmsiz e'lon — bo'sh kulrang kvadrat o'rniga matnning o'zi
          // ko'rinadi, aks holda kartani bir-biridan ajratib bo'lmaydi.
          <p className="line-clamp-[9] p-4 pt-10 text-xs leading-relaxed text-muted-foreground">
            {post.caption}
          </p>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          <Badge variant="secondary">{KIND_LABEL[post.kind]}</Badge>
          {post.publishedByUs && <Badge variant="info">eStats</Badge>}
          {post.hasAd && (
            <Badge variant="warning" className="gap-1">
              <Megaphone className="h-3 w-3" /> Reklama
            </Badge>
          )}
        </div>
        {post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            className="absolute right-2 top-2 rounded-md bg-background/85 p-1.5 backdrop-blur transition-colors hover:bg-background"
            aria-label="Instagram'da ochish"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {post.caption && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{post.caption}</p>
        )}

        <div className="grid grid-cols-3 gap-2 text-xs">
          <Metric icon={Eye} label="Ko'rgan" value={post.reach} hint="boshqa-boshqa odam" />
          <Metric icon={Heart} label="Layk" value={post.likes} />
          <Metric icon={Send} label="Jo'natilgan" value={post.shares} />
          <Metric icon={MessageCircle} label="Izoh" value={post.comments} />
          <Metric icon={Bookmark} label="Saqlagan" value={post.saved} />
          <Metric
            icon={Eye}
            label="Faollik"
            value={post.engagementRate ?? 0}
            suffix="%"
          />
        </div>

        <div className="mt-auto space-y-2">
          {post.products.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {post.products.map((product) => (
                <span
                  key={product.id}
                  className="inline-flex items-center gap-1 rounded-md border bg-muted/50 py-0.5 pl-1.5 pr-1 text-xs"
                >
                  <Link
                    href={`/warehouse/${product.id}` as Route}
                    className="max-w-36 truncate hover:underline"
                  >
                    {product.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onUnlink(post, product.id)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Bog'lanishni uzish"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Tovarga bog'lanmagan</p>
          )}

          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => onLink(post)}>
              <Link2 className="h-3.5 w-3.5" /> Tovar
            </Button>
            <Button
              variant={post.hasAd ? "outline" : "default"}
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => onAdvertise(post)}
              disabled={!canAdvertise}
              title={canAdvertise ? undefined : "Reklama kabineti ulanmagan"}
            >
              <Megaphone className="h-3.5 w-3.5" /> Reklama
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  suffix,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div title={hint}>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className={cn("truncate", hint && "underline decoration-dotted underline-offset-2")}>
          {label}
        </span>
      </div>
      <div className="font-semibold tabular-nums">
        {`${formatNumber(value)}${suffix ?? ""}`}
      </div>
    </div>
  );
}
