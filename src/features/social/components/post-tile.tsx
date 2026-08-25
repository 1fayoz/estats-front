"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eye, ExternalLink, Link2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { PLATFORM_LABEL } from "@/lib/platforms";
import type { SocialPost } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  image: "Rasm",
  video: "Video",
  carousel: "Karusel",
  reel: "Reels",
  story: "Story",
  text: "Matn",
};

/** Bitta e'lon — tarmoqdan qat'i nazar bir xil ko'rinishda. */
export function PostTile({
  post,
  onLink,
  onUnlink,
}: {
  post: SocialPost;
  onLink: (post: SocialPost) => void;
  onUnlink: (post: SocialPost, productId: number) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-square w-full bg-muted">
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <p className="line-clamp-[9] p-4 pt-10 text-xs leading-relaxed text-muted-foreground">
            {post.caption}
          </p>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge variant="secondary">{KIND_LABEL[post.kind] ?? post.kind}</Badge>
          {post.publishedByUs && <Badge variant="info">eStats</Badge>}
        </div>

        {post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            className="absolute right-2 top-2 rounded-md bg-background/85 p-1.5 backdrop-blur transition-colors hover:bg-background"
            aria-label={`${PLATFORM_LABEL[post.platform]}da ochish`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {post.reach !== null && (
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-background/85 px-1.5 py-1 text-xs backdrop-blur">
            <Eye className="h-3 w-3" /> {formatNumber(post.reach)}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        {post.caption && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{post.caption}</p>
        )}

        {post.products.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {post.products.map((product) => (
              <span
                key={product.id}
                className="inline-flex max-w-full items-center gap-1 rounded-md border bg-muted/50 py-0.5 pl-1.5 pr-1 text-xs"
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
          <p className="text-xs text-muted-foreground">Tovarga bog&apos;lanmagan</p>
        )}

        <Button
          variant="outline"
          size="sm"
          className="mt-auto w-full gap-1.5"
          onClick={() => onLink(post)}
        >
          <Link2 className="h-3.5 w-3.5" /> Tovarga bog&apos;lash
        </Button>
      </div>
    </div>
  );
}
