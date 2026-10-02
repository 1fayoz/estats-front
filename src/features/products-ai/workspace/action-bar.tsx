"use client";

import * as React from "react";
import {
  AlertTriangle, ArrowRight, Check, Copy, Link2, Loader2, MoreHorizontal, Pencil, RefreshCw,
  Search, Sparkles, Square, Trash2, Unlink, Upload, Wand2,
} from "lucide-react";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

import { FAILED_PUBLISH, draftShop } from "./lib";
import styles from "./workspace.module.css";

export interface ActionBarHandlers {
  onStart: () => void;
  onSave: () => void;
  onRetry: () => void;
  onCopy: () => void;
  onApprove: () => void;
  onPublish: (categoryManualPath?: string[], resume?: boolean) => void;
  onStopPublish: () => void;
  onLink: () => void;
  onUnlink: () => void;
  onToggleEdit: () => void;
  onEditUzum: (replaceImages: boolean) => void;
  onRegenerate: () => void;
  onVerify: () => void;
  onDelete: () => void;
}

/**
 * Pastki amal paneli — BITTA asosiy tugma, holatga qarab.
 *
 * Ilgari oynaning ost qismida 12 tagacha tugma bir qatorda turardi
 * («Tahrirlash» va «Tahrirlashni yakunlash» alohida, «Uzumga joylash» /
 * «Davom ettirish» / «Chala tovarni davom ettirish» uchta ko'rinishda,
 * «Uzumda tekshirish», «Nusxalash», «Mavjud tovarni yangilash» hammasi
 * yonma-yon). Sotuvchi: «kerakmas dublikat buttonlarni olib tashlash».
 *
 * Endi: chapda holat matni; o'ngda — kerak bo'lsa «Saqlash», holatning
 * ASOSIY amali (yashil) va «⋯» menyusida kamdan-kam kerak bo'ladiganlar.
 */
export function ActionBar({
  draft,
  locked,
  editMode,
  dirty,
  busy,
  filesCount,
  loading,
  blocked,
  tooMany,
  handlers,
}: {
  draft: AiDraft | null;
  locked: boolean;
  editMode: boolean;
  dirty: boolean;
  busy: string;
  filesCount: number;
  loading: boolean;
  /** Tayyorlik tabidagi to'sib turgan kamchiliklar soni. */
  blocked: number;
  /** 100+ SKU — amal o'rniga «bo'lamizmi?» oynasi (`tooManySkus`). */
  tooMany: boolean;
  handlers: ActionBarHandlers;
}) {
  const h = handlers;
  const [pushImages, setPushImages] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const live = Boolean(draft?.uzumPublish?.productId);
  const publish = draft?.uzumPublish ?? null;
  const publishStatus = publish?.status || null;
  const publishing = publishStatus === "queued" || publishStatus === "running";
  const linked = Boolean(publish?.linkedManually && publishStatus === "linked");
  const running = Boolean(draft && draft.progress < 100 && !draft.error);
  const failed = Boolean(draft?.error || draft?.stage === "failed");
  const ready = Boolean(draft && draft.progress >= 95 && !failed);
  const targetShop = draft ? draftShop(draft).title : null;

  // Mavjud tovarga bog'langanda rasmlar ham ketishi kutiladi: qoralamada
  // yangi AI kadrlari turadi, tovarda esa eskisi.
  React.useEffect(() => {
    if (linked) setPushImages(true);
  }, [linked]);
  React.useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 6000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const spin = (name: string, Icon: React.ComponentType<{ className?: string }>) =>
    busy === name ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Icon className="size-4" aria-hidden />;

  // ── Yangi tovar ───────────────────────────────────────────────────
  if (draft === null) {
    return (
      <div className={styles.bar}>
        <p className="min-w-0 flex-1 text-xs text-[color:var(--air-head)]" role="status">
          {loading ? "Qoralama ochilmoqda…"
            : busy === "start" ? "Rasmlar yuklanmoqda…"
              : filesCount ? `${filesCount} ta rasm tayyor — boshlashingiz mumkin.`
                : "Boshlash uchun kamida 1 ta rasm qo'shing."}
        </p>
        <button
          type="button"
          className={cn(styles.btn, styles.btnPrimary)}
          onClick={h.onStart}
          disabled={loading || !filesCount || busy === "start"}
        >
          {busy === "start" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
          {busy === "start" ? "Yuklanmoqda…" : "Kartochka yaratish"}
          {busy !== "start" && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </div>
    );
  }

  // ── Asosiy amal (bitta) ────────────────────────────────────────────
  let primary: React.ReactNode = null;
  // Holat chiplari sarlavhada — bu yerda faqat jarayon yoki saqlanmagan o'zgarish.
  let status: React.ReactNode = dirty
    ? "Saqlanmagan o'zgarishlar bor"
    : draft.progress < 100 ? `${draft.progress}% · ${draft.stageLabel}` : "Kartochka tayyor";

  if (running) {
    primary = (
      <button type="button" className={cn(styles.btn, styles.btnFlat)} disabled>
        <Loader2 className="size-4 animate-spin" aria-hidden /> Tayyorlanmoqda…
      </button>
    );
  } else if (failed) {
    status = <span className="air-bad">To&apos;xtadi: {draft.error}</span>;
    primary = (
      <button type="button" className={cn(styles.btn, styles.btnPrimary)} onClick={h.onRetry} disabled={busy === "retry"}>
        {spin("retry", RefreshCw)} To&apos;xtagan joydan davom ettirish
      </button>
    );
  } else if (live && (editMode || !locked || linked)) {
    primary = (
      <>
        <label className="flex items-center gap-1.5 text-xs text-[color:var(--air-head)]">
          <input type="checkbox" checked={pushImages} onChange={(e) => setPushImages(e.target.checked)} />
          rasmlarni ham
        </label>
        <button
          type="button"
          className={cn(styles.btn, styles.btnPrimary)}
          onClick={() => h.onEditUzum(pushImages)}
          disabled={busy === "editUzum" || publishing}
          title="Nom, tavsif, bo'limlar va (belgilansa) rasmlarni Uzum'dagi tovarga ko'chiradi."
        >
          {publishing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : spin("editUzum", Upload)}
          {publishing ? `Yangilanmoqda… ${publish?.progress ?? 0}%` : "Uzum'da yangilash"}
        </button>
      </>
    );
  } else if (locked && !live) {
    primary = (
      <>
        {publishing && (
          <button type="button" className={cn(styles.btn, styles.btnFlat)} onClick={h.onStopPublish} disabled={busy === "stopPublish"}
            title="Bosqichlar orasida to'xtatadi — brauzer ochiq qoladi, keyinroq shu joydan davom etadi.">
            {spin("stopPublish", Square)} To&apos;xtatish
          </button>
        )}
        <button
          type="button"
          className={cn(styles.btn, styles.btnPrimary, publishStatus && FAILED_PUBLISH.has(publishStatus) && !publishing && styles.btnWarn)}
          onClick={() => h.onPublish()}
          disabled={publishing || busy === "publish"}
          title={publish?.message || (targetShop ? `«${targetShop}» do'koniga joylaydi` : undefined)}
        >
          {publishing || busy === "publish" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
          {publishing ? `Joylanmoqda… ${publish?.progress ?? 0}%` : publishStatus === "stopped" ? "Joylashni davom ettirish" : "Uzumga joylash"}
          {!publishing && publishStatus !== "stopped" && targetShop && (
            <span className="ml-1 hidden font-normal opacity-80 sm:inline">→ {targetShop}</span>
          )}
        </button>
      </>
    );
  } else if (locked && live) {
    primary = (
      <button type="button" className={cn(styles.btn, styles.btnPrimary)} onClick={h.onToggleEdit}
        title="Matn/rasmni o'zgartirib, keyin «Uzum'da yangilash» bilan tirik tovarga ko'chirish.">
        <Pencil className="size-4" aria-hidden /> Tahrirlash
      </button>
    );
  } else if (ready) {
    primary = (
      <button
        type="button"
        className={cn(styles.btn, styles.btnPrimary, blocked > 0 && styles.btnWarn)}
        onClick={h.onApprove}
        disabled={busy === "approve"}
        title={blocked ? `Tayyorlik tabida ${blocked} ta to'sib turgan kamchilik bor` : "Kartochka tayyor — Uzum'ga joylash uchun tasdiqlang."}
      >
        {spin("approve", Check)} Tasdiqlash{blocked ? ` (${blocked})` : ""}
      </button>
    );
  }

  const verified = publish?.verified;

  return (
    <div className={styles.bar}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[color:var(--air-head)]" role="status">
        <span className="truncate">{status}</span>
        {editMode && <span className={cn(styles.chip, styles.chipInfo)}><Pencil className="size-3" aria-hidden /> Tahrirlanmoqda</span>}
        {linked && (
          <span className={cn(styles.chip, styles.chipInfo)}>
            <Link2 className="size-3" aria-hidden /> Bog&apos;landi: Uzum {publish?.productId}
          </span>
        )}
        {live && locked && draft.imagesOutOfSync && (
          <span className={cn(styles.chip, styles.chipWarn)} title="Rasmlar qayta yasalgan. «Tahrirlash» → «Uzum'da yangilash» bilan ko'chiring.">
            <AlertTriangle className="size-3" aria-hidden /> Yangi rasmlar Uzum&apos;ga ko&apos;chirilmagan
          </span>
        )}
        {verified !== null && verified !== undefined && (
          <span className={cn(styles.chip, verified ? styles.chipOk : styles.chipBad)} title={publish?.verifyMessage || undefined}>
            {verified ? <Check className="size-3" aria-hidden /> : <AlertTriangle className="size-3" aria-hidden />}
            {verified ? "Uzum'da tasdiqlandi" : "Uzum'da topilmadi"}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!locked && !running && (
          <button type="button" className={cn(styles.btn, styles.btnFlat)} onClick={h.onSave} disabled={!dirty || busy === "save"}>
            {spin("save", Check)} Saqlash
          </button>
        )}
        {editMode && !publishing && (
          <button type="button" className={cn(styles.btn, styles.btnFlat)} onClick={h.onToggleEdit}
            title="Tahrirlashni yopadi — qoralama yana tasdiqlangan holatga qaytadi.">
            Yakunlash
          </button>
        )}
        {primary}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={cn(styles.btn, styles.btnFlat, "px-3")} aria-label="Boshqa amallar">
              <MoreHorizontal className="size-4" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">Boshqa amallar</DropdownMenuLabel>
            {locked && !editMode && !live && !publishing && (
              <DropdownMenuItem onSelect={h.onToggleEdit}>
                <Pencil className="size-4" /> Tasdiqlangan qoralamani tahrirlash
              </DropdownMenuItem>
            )}
            {!live && !publishing && ready && (
              <DropdownMenuItem onSelect={h.onLink}>
                <Link2 className="size-4" /> Mavjud tovarni shu kartochka bilan yangilash
              </DropdownMenuItem>
            )}
            {linked && (
              <DropdownMenuItem onSelect={h.onUnlink} disabled={busy === "unlink"}>
                <Unlink className="size-4" /> Bog&apos;lanishni bekor qilish
              </DropdownMenuItem>
            )}
            {live && locked && !publishing && !["published", "queued", "running"].includes(publishStatus ?? "") && (
              <DropdownMenuItem onSelect={() => h.onPublish(undefined, true)} disabled={busy === "publish"}>
                <Upload className="size-4" /> Uzum&apos;da chala qolgan tovarni davom ettirish
              </DropdownMenuItem>
            )}
            {live && (
              <DropdownMenuItem onSelect={h.onVerify} disabled={busy === "verify"}>
                <Search className="size-4" /> Uzum katalogida tekshirish
              </DropdownMenuItem>
            )}
            {!running && (
              <DropdownMenuItem onSelect={h.onRegenerate} disabled={busy === "regenerate" || tooMany}>
                <Wand2 className="size-4" /> AI bilan matnlarni to&apos;liq qayta yaratish
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={h.onCopy} disabled={busy === "copy"}>
              <Copy className="size-4" /> Uzum uchun matn sifatida nusxalash
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(event) => {
                if (!confirmDelete) {
                  event.preventDefault();
                  setConfirmDelete(true);
                  return;
                }
                h.onDelete();
              }}
              disabled={busy === "delete"}
            >
              <Trash2 className="size-4" />
              {confirmDelete ? "Rostdan o'chirish — bosing" : "Qoralamani o'chirish"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
