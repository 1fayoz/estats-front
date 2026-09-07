"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, Check, CheckCircle2, Clock3, ImageIcon, Loader2, Send, Tag } from "lucide-react";

import { NetworkIcon } from "@/components/brand/network-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatNumber, formatSum } from "@/lib/format";
import { PLATFORM_LABEL } from "@/lib/platforms";
import type { BroadcastResult, SocialAccount } from "@/lib/types";
import styles from "./publish-composer.module.css";

export function PublishComposer({
  open, onOpenChange, title, description, loading = false, loadError, onRetry,
  submitting, submitError, onSubmit, submitDisabled, submitLabel = "Joylash",
  completed = false, children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  loading?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
  submitting: boolean;
  submitError?: string | null;
  onSubmit: () => void;
  submitDisabled: boolean;
  submitLabel?: string;
  completed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialog} data-busy={submitting} aria-busy={submitting || loading}
        onEscapeKeyDown={(event) => { if (submitting) event.preventDefault(); }}
        onPointerDownOutside={(event) => { if (submitting) event.preventDefault(); }}>
        <DialogHeader className={styles.header}>
          <div className={styles.eyebrow}><Send aria-hidden="true" /> Yangi e&apos;lon</div>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
          <DialogDescription className={styles.description}>{description}</DialogDescription>
        </DialogHeader>
        <div className={styles.body}>
          {loading ? (
            <div className={styles.empty} role="status"><Loader2 className={styles.spinner} aria-hidden="true" /><p>E&apos;lon tayyorlanmoqda…</p></div>
          ) : loadError ? (
            <div className={styles.empty} role="alert"><AlertCircle aria-hidden="true" /><p>{loadError}</p>{onRetry && <Button type="button" variant="outline" className={styles.action} onClick={onRetry}>Qayta urinish</Button>}</div>
          ) : children}
          {submitError && <div className={styles.error} role="alert"><AlertCircle aria-hidden="true" /><p>{submitError}</p></div>}
        </div>
        <div className={styles.footer}>
          <p className={styles.footerNote}>{completed ? "Natijani pastdagi holat panelida ham kuzatish mumkin." : "Joylashdan oldin matn va tanlovlarni tekshiring."}</p>
          <div className={styles.footerActions}>
            <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)} className={styles.action}>{completed ? "Yopish" : "Bekor qilish"}</Button>
            {!completed && <Button type="button" className={styles.action} disabled={submitDisabled || submitting || loading || Boolean(loadError)} onClick={onSubmit}>
              {submitting ? <Loader2 className={styles.spinner} aria-hidden="true" /> : <Send aria-hidden="true" />}
              {submitting ? "Yuborilmoqda…" : submitLabel}
            </Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PublishDestinations({ accounts, selected, onToggle, disabled }: {
  accounts: SocialAccount[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className={styles.section} disabled={disabled}>
      <legend className={styles.sectionHeading}>Qayerga joylaymiz? <span>{accounts.filter((account) => selected.has(account.id)).length} ta akkaunt tanlandi</span></legend>
      {accounts.length ? <div className={styles.destinations}>
        {accounts.map((account) => <button key={account.id} type="button" aria-pressed={selected.has(account.id)} onClick={() => onToggle(account.id)} className={styles.destination}>
          <span className={styles.networkIcon}><NetworkIcon platform={account.platform} /></span>
          <span className={styles.destinationText}><strong>{account.name || account.username || account.externalId}</strong><span>{PLATFORM_LABEL[account.platform] || account.platform}{account.isDefault ? " · Asosiy" : ""}</span></span>
          <span className={styles.checkbox}>{selected.has(account.id) && <Check aria-hidden="true" />}</span>
        </button>)}
      </div> : <div className={styles.notice}><AlertCircle aria-hidden="true" /><div><p>Joylash uchun ulangan akkaunt yo&apos;q.</p><Link href="/integrations" className={styles.inlineLink}>Tarmoq ulash <ArrowUpRight aria-hidden="true" /></Link></div></div>}
    </fieldset>
  );
}

export function PublishComposerFields({ title, availableImages, images, onToggleImage, caption, onCaptionChange,
  disabled, captionHint, maxCaption, warning, priceOption, fixedDestination,
}: {
  title: string;
  availableImages: string[];
  images: string[];
  onToggleImage: (url: string) => void;
  caption: string;
  onCaptionChange: (value: string) => void;
  disabled: boolean;
  captionHint?: string;
  maxCaption?: number;
  warning?: string | null;
  priceOption?: { value: boolean; price: number | null; onChange: (value: boolean) => void };
  fixedDestination?: string;
}) {
  const captionId = React.useId();
  const captionHintId = React.useId();
  const hasCustomCaption = caption.trim().length > 0;
  const knownPrice = typeof priceOption?.price === "number" && Number.isFinite(priceOption.price) && priceOption.price > 0;
  const previewImage = images[0] || availableImages[0];
  return <div className={styles.fields}>
    <div className={styles.product}>
      <div className={styles.productImage}>{previewImage ? <img src={previewImage} alt="" /> : <ImageIcon aria-hidden="true" />}</div>
      <div className={styles.productText}><span>TANLANGAN TOVAR</span><strong>{title}</strong>{fixedDestination && <span className={styles.fixedDestination}><NetworkIcon platform={fixedDestination} />{PLATFORM_LABEL[fixedDestination] || fixedDestination} · asosiy akkaunt</span>}</div>
    </div>
    {warning && <div className={styles.notice}><AlertCircle aria-hidden="true" /><p>{warning}</p></div>}
    <div className={styles.section}>
      <div className={styles.sectionHeading}><label htmlFor={captionId}>E&apos;lon matni</label><span>{formatNumber(caption.length)}{maxCaption ? ` / ${formatNumber(maxCaption)}` : ""} belgi</span></div>
      <textarea id={captionId} aria-describedby={captionHintId} rows={6} disabled={disabled} value={caption} onChange={(event) => onCaptionChange(event.target.value)} placeholder="Tovaringiz haqida yozing…" className={styles.caption} />
      <p id={captionHintId} className={styles.hint}>{captionHint || "Matn tarmoq imkoniyatlariga mos ravishda joylanadi."}</p>
    </div>
    {priceOption && <button type="button" role="switch" aria-checked={priceOption.value && !hasCustomCaption && knownPrice} disabled={disabled || hasCustomCaption || !knownPrice} className={styles.priceOption} onClick={() => priceOption.onChange(!priceOption.value)}>
      <Tag aria-hidden="true" /><span><strong>Narxni matnga qo&apos;shish</strong><span>{hasCustomCaption ? "O'z matningizga narx avtomatik qo'shilmaydi." : !knownPrice ? "Tovarning narxi hozircha noma'lum." : priceOption.value ? `${formatSum(priceOption.price as number)} matnga yoziladi.` : "Narx yozilmaydi. Joriy narx Uzum havolasida ko'rinadi."}</span></span><span className={styles.switch}><span /></span>
    </button>}
    <fieldset className={styles.section} disabled={disabled}>
      <legend className={styles.sectionHeading}>Rasmlar <span>{images.length} / 10 tanlandi</span></legend>
      {availableImages.length ? <div className={styles.images}>
        {availableImages.map((url, imageIndex) => {
          const selectionIndex = images.indexOf(url);
          return <button key={url} type="button" className={styles.imageChoice} aria-pressed={selectionIndex >= 0} aria-label={`${imageIndex + 1}-rasm${selectionIndex >= 0 ? `, ${selectionIndex + 1}-o'rinda tanlangan` : "ni tanlash"}`} disabled={selectionIndex < 0 && images.length >= 10} onClick={() => onToggleImage(url)}>
            <img src={url} alt="" loading="lazy" /><span className={styles.imageNumber}>{selectionIndex >= 0 ? selectionIndex + 1 : <span className={styles.imagePlus}>+</span>}</span>
          </button>;
        })}
      </div> : <div className={styles.notice}><ImageIcon aria-hidden="true" /><p>Tovarda rasm yo&apos;q. Avval tovar kartochkasiga rasm qo&apos;shing.</p></div>}
      <p className={styles.hint}>Bosish tartibi e&apos;londagi tartibni belgilaydi. Ko&apos;pi bilan 10 ta rasm.</p>
    </fieldset>
  </div>;
}

export function PublishQueuedResult({ result }: { result: BroadcastResult }) {
  return <div className={styles.queued}>
    <div className={styles.queueSummary} role="status">
      {result.active ? <Clock3 aria-hidden="true" /> : result.failed ? <AlertCircle aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
      <div><h3>{result.active ? "E'lon navbatga qo'yildi" : result.failed ? "Joylash yakunlandi, ayrim xatolar bor" : "E'lon joylandi"}</h3><p>{result.active ? "Oynani yopishingiz mumkin. E'lon fonda joylanadi, natija har bir akkaunt uchun alohida ko'rinadi." : `${result.sent} ta akkauntga joylandi${result.failed ? ` · ${result.failed} ta akkauntda xato` : ""}.`}</p></div>
    </div>
    <div className={styles.queueItems}>{result.items.map((item) => <div className={styles.queueItem} key={item.accountId} data-status={item.status}>
      <NetworkIcon platform={item.platform} /><div><strong>{item.account}</strong><span>{PLATFORM_LABEL[item.platform]} · {item.status === "done" ? "Joylandi" : item.status === "failed" ? "Joylanmadi" : item.status === "running" ? "Joylanmoqda" : "Navbatda"}</span>{item.error && <p>{item.error}</p>}</div>
      {item.permalink && /^https?:\/\//i.test(item.permalink) && <a href={item.permalink} target="_blank" rel="noreferrer" aria-label={`${item.account} e'lonini ochish`} className={styles.postLink}><ArrowUpRight aria-hidden="true" /></a>}
    </div>)}</div>
  </div>;
}

export function togglePublishImage(current: string[], url: string) {
  return current.includes(url) ? current.filter((image) => image !== url) : [...current, url].slice(0, 10);
}

export function togglePublishAccount(current: Set<number>, accountId: number) {
  const next = new Set(current);
  if (next.has(accountId)) next.delete(accountId);
  else next.add(accountId);
  return next;
}
