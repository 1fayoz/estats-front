"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, ExternalLink, FileText, ImageOff, Link2, Megaphone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/format";
import { PLATFORM_LABEL } from "@/lib/platforms";
import type { LinkedProduct, PostKind } from "@/lib/types";
import styles from "./post-card.module.css";

const KIND_LABEL: Record<PostKind, string> = {
  image: "Rasm",
  video: "Video",
  carousel: "Karusel",
  reel: "Reels",
  story: "Story",
  text: "Matn",
};

interface PostMetric {
  key: string;
  label: string;
  value: number | null;
  suffix?: string;
  hint?: string;
}

interface PostContent {
  kind: PostKind;
  caption: string | null;
  thumbnail: string | null;
  permalink: string | null;
  postedAt: string | null;
  publishedByUs: boolean;
  products: LinkedProduct[];
}

export function SocialPostCard({
  post,
  platform,
  metrics,
  insightsAvailable = true,
  hasAd = false,
  onLink,
  onUnlink,
  onAdvertise,
  canAdvertise = false,
}: {
  post: PostContent;
  platform: string;
  metrics: PostMetric[];
  insightsAvailable?: boolean;
  hasAd?: boolean;
  onLink: () => void;
  onUnlink: (productId: number) => void;
  onAdvertise?: () => void;
  canAdvertise?: boolean;
}) {
  const [failedImage, setFailedImage] = React.useState<string | null>(null);
  const hasImage = Boolean(post.thumbnail && failedImage !== post.thumbnail);
  const platformLabel = PLATFORM_LABEL[platform] ?? platform;
  const postedDate = post.postedAt ? new Date(post.postedAt) : null;
  const validDate = postedDate !== null && Number.isFinite(postedDate.getTime());
  const dateLabel = validDate ? `${formatDate(postedDate)} ${postedDate.getFullYear()}` : "Sana ko‘rsatilmagan";

  return (
    <article className={styles.card} aria-label={`${platformLabel} · ${KIND_LABEL[post.kind]} · ${dateLabel}`}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.platform}>{platformLabel}</span>
          <time className={styles.date} dateTime={validDate ? post.postedAt! : undefined}>{dateLabel}</time>
        </div>
        {post.permalink && <a href={post.permalink} target="_blank" rel="noopener noreferrer" className={styles.iconButton} aria-label={`${platformLabel}da ochish (yangi oynada)`}><ExternalLink size={16} aria-hidden="true" /></a>}
      </div>

      <div className={styles.media}>
        {hasImage ? <img src={post.thumbnail!} alt="" loading="lazy" className={styles.image} onError={() => setFailedImage(post.thumbnail)} /> : (
          <div className={styles.textPost}>
            {post.caption ? <p>{post.caption}</p> : <span className={styles.noMedia}><FileText size={28} aria-hidden="true" />E’lon matni mavjud emas</span>}
            {post.thumbnail && <span className={styles.imageError}><ImageOff size={13} aria-hidden="true" />Rasm yuklanmadi</span>}
          </div>
        )}
        <div className={styles.mediaLabels}>
          <span>{KIND_LABEL[post.kind]}</span>
          {post.publishedByUs && <span>eStats</span>}
          {hasAd && <span><Megaphone size={12} aria-hidden="true" />Reklama</span>}
        </div>
      </div>

      <div className={styles.body}>
        {hasImage && <p className={styles.caption}>{post.caption || "E’lon matni mavjud emas"}</p>}
        <dl className={styles.metrics}>{metrics.slice(0, 3).map((metric) => <Metric key={metric.key} metric={metric} />)}</dl>
        {metrics.length > 3 && (
          <details className={styles.details}>
            <summary>Batafsil statistika<ChevronDown className={styles.chevron} size={15} aria-hidden="true" /></summary>
            <dl className={styles.metrics}>{metrics.slice(3).map((metric) => <Metric key={metric.key} metric={metric} />)}</dl>
          </details>
        )}
        {!insightsAvailable && <p className={styles.insightNotice}>Bu tarmoq batafsil statistikani taqdim etmaydi.</p>}

        <div className={styles.footer}>
          <div className={styles.productHeading}><Link2 size={13} aria-hidden="true" /><span>{post.products.length ? `${post.products.length} ta bog‘langan tovar` : "Tovar bog‘lanmagan"}</span></div>
          {post.products.length > 0 && (
            <ul className={styles.products}>
              {post.products.map((product) => (
                <li key={product.id} className={styles.product}>
                  <Link href={`/warehouse/${product.id}` as Route} title={product.title}>{product.title}</Link>
                  <button type="button" className={styles.iconButton} onClick={() => onUnlink(product.id)} aria-label={`${product.title} bilan bog‘lanishni uzish`}><X size={14} aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.actions}>
            <Button type="button" variant="outline" className="h-11 min-w-0 flex-1 rounded-xl px-3 text-xs" onClick={onLink}><Link2 aria-hidden="true" />{onAdvertise ? "Tovar bog‘lash" : "Tovarga bog‘lash"}</Button>
            {onAdvertise && <Button type="button" variant="outline" className="h-11 min-w-0 flex-1 rounded-xl px-3 text-xs" onClick={onAdvertise} disabled={!canAdvertise} title={canAdvertise ? undefined : "Reklama kabineti ulanmagan"}><Megaphone aria-hidden="true" />Reklama</Button>}
          </div>
          {onAdvertise && !canAdvertise && <p className={styles.insightNotice}>Reklama uchun reklama kabinetini ulang.</p>}
        </div>
      </div>
    </article>
  );
}

function Metric({ metric }: { metric: PostMetric }) {
  const available = metric.value !== null && Number.isFinite(metric.value);
  return (
    <div className={styles.metric} title={metric.hint}>
      <dt>{metric.label}</dt>
      <dd>{available ? `${formatNumber(metric.value!)}${metric.suffix ?? ""}` : <span aria-label="Ma’lumot mavjud emas">—</span>}</dd>
    </div>
  );
}
