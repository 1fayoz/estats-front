"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DraftFields,
  formPatch,
  initialForm,
  type DraftForm,
  type DraftTabKey,
} from "@/features/products-ai/components/draft-fields";
import { LinkProductDialog } from "@/features/products-ai/components/link-product-dialog";
import { SplitDialog, tooManySkus } from "@/features/products-ai/components/split-dialog";
import { useAiDrafts } from "@/features/products-ai/use-drafts";
import {
  ApiError,
  approveAiDraft,
  createAiDraft,
  deleteAiDraft,
  editAiDraftUzum,
  fetchAiDraft,
  fetchAiPackage,
  patchAiDraft,
  publishAiDraftUzum,
  regenerateAiDraft,
  republishAiDraftNew,
  retryAiDraft,
  stopAiDraftUzum,
  unlinkAiDraftProduct,
  verifyAiDraftUzum,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

import { ActionBar } from "./action-bar";
import { CategoryFix } from "./category-fix";
import { TAB_KEYS, TAB_TITLE, isDraftBusy } from "./lib";
import { NewDraftView } from "./new-draft-view";
import { Rail } from "./rail";
import { SessionDialog } from "./session-dialog";
import { useDraftSessions } from "./sessions-panel";
import { WorkspaceHeader } from "./workspace-header";
import styles from "./workspace.module.css";

/** Quvur ishlayotganda holat shuncha vaqtda bir so'raladi. */
const POLL_MS = 4000;

function readTab(value: string | null): DraftTabKey {
  return value && (TAB_KEYS as string[]).includes(value) ? (value as DraftTabKey) : "general";
}

function writeTabToUrl(tab: DraftTabKey) {
  const next = new URLSearchParams(window.location.search);
  if (tab === "general") next.delete("tab");
  else next.set("tab", tab);
  const query = next.toString();
  window.history.replaceState(window.history.state, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
}

/**
 * «Tovar qo'shish» — ALOHIDA SAHIFA (2026-10-03, sotuvchi talabi).
 *
 * Ikki holat, bitta sahifa: `draftId === null` — rasm tanlash;
 * raqam — tekshirish, tahrirlash, tasdiqlash, Uzum'ga joylash.
 * Rasm tashlangach `router.replace` bilan shu sahifaning O'ZIDA
 * qoralama ochiladi — sotuvchi natijani qayerdan izlashni biladi.
 *
 * Tab URL'da (`?tab=images`): yangilanganda yoki havoladan o'sha tab.
 * Next routerisiz, `history.replaceState` bilan — ilgari `router.replace`
 * eski parametrni qayta yozib qo'ygan (ombordagi `?draft=` saboqi).
 */
export function DraftWorkspace({ draftId }: { draftId: number | null }) {
  const router = useRouter();
  const search = useSearchParams();
  const drafts = useAiDrafts(true);

  const [draft, setDraft] = React.useState<AiDraft | null>(null);
  const [loading, setLoading] = React.useState(draftId !== null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [hint, setHint] = React.useState("");
  const [newShopId, setNewShopId] = React.useState<number | null>(null);
  const [tab, setTabState] = React.useState<DraftTabKey>(() => readTab(search.get("tab")));
  const [form, setForm] = React.useState<DraftForm | null>(null);
  const [busy, setBusy] = React.useState("");
  const [editMode, setEditMode] = React.useState(false);
  const [splitOpen, setSplitOpen] = React.useState(false);
  const [linkOpen, setLinkOpen] = React.useState(false);
  // Uzum ABADIY bloklagan tovarda «Uzum'da yangilash» → «yangi qilib joylaymi?» (§9.65).
  const [permBanned, setPermBanned] = React.useState<string | null>(null);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  const setTab = React.useCallback((next: DraftTabKey) => {
    setTabState(next);
    writeTabToUrl(next);
  }, []);
  React.useEffect(() => {
    const onPop = () => setTabState(readTab(new URLSearchParams(window.location.search).get("tab")));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Qoralamani yuklash — `draftId` o'zgarganda (yangi → mavjud ham shu yerdan).
  React.useEffect(() => {
    setEditMode(false);
    setBusy("");
    if (draftId === null) {
      setDraft(null);
      setForm(null);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchAiDraft(draftId)
      .then((fresh) => alive && setDraft(fresh))
      .catch((err) => {
        if (!alive) return;
        toast.error(err instanceof ApiError ? err.message : "Qoralama ochilmadi.");
        router.replace("/warehouse");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [draftId, router]);

  // Quvur, joylash va bo'lish FONDA — tugallanmagan bo'lsa so'rab turamiz.
  const running = isDraftBusy(draft);
  React.useEffect(() => {
    if (!running || !draft) return;
    const id = window.setInterval(async () => {
      try {
        const fresh = await fetchAiDraft(draft.id);
        setDraft(fresh);
        drafts.upsert(fresh);
      } catch {
        /* keyingi urinishda */
      }
    }, POLL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, draft?.id]);

  // Forma qoralama yangilanganda qayta yig'iladi — quvur matn yozganda darhol ko'rinsin.
  React.useEffect(() => {
    setForm(draft ? initialForm(draft) : null);
  }, [draft?.id, draft?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const { sessions, hidden: sessionsHidden, loaded: sessionsLoaded } = useDraftSessions(draft?.id, running);

  const apply = React.useCallback((fresh: AiDraft) => {
    setDraft(fresh);
    drafts.upsert(fresh);
  }, [drafts]);

  const act = React.useCallback(async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    try {
      await fn();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setBusy("");
    }
  }, []);

  const locked = draft?.stage === "approved" && !editMode;
  const dirty = Boolean(
    draft && form && (Object.keys(form) as (keyof DraftForm)[]).some((key) => form[key] !== initialForm(draft)[key]),
  );
  const tooMany = tooManySkus(draft);
  const guardSplit = (fn: () => void) => (tooMany ? setSplitOpen(true) : fn());

  const handlers = {
    onStart: () =>
      act("start", async () => {
        const fresh = await createAiDraft(files, hint.trim(), newShopId);
        setFiles([]);
        setHint("");
        apply(fresh);
        toast.success("Rasm qabul qilindi — AI ishlashni boshladi.");
        router.replace(`/warehouse/ai/${fresh.id}`);
      }),
    onSave: () =>
      act("save", async () => {
        if (!draft || !form) return;
        apply(await patchAiDraft(draft.id, formPatch(form)));
        toast.success("Saqlandi.");
      }),
    onRetry: () =>
      act("retry", async () => {
        if (!draft) return;
        apply(await retryAiDraft(draft.id));
        toast.success("Davom ettirilmoqda.");
      }),
    onCopy: () =>
      act("copy", async () => {
        if (!draft) return;
        const pkg = await fetchAiPackage(draft.id);
        await navigator.clipboard.writeText(pkg.plainText);
        toast.success(pkg.missing.length ? `Nusxalandi. Yetishmaydi: ${pkg.missing.join(", ")}` : "Hammasi nusxalandi.");
      }),
    onApprove: () =>
      guardSplit(() =>
        act("approve", async () => {
          if (!draft) return;
          apply(await approveAiDraft(draft.id));
          toast.success("Tasdiqlandi — Uzum'ga ko'chirishga tayyor.");
        }),
      ),
    onPublish: (categoryManualPath?: string[], resume?: boolean) =>
      guardSplit(() =>
        act("publish", async () => {
          if (!draft) return;
          const resuming = draft.uzumPublish?.status === "stopped";
          apply(await publishAiDraftUzum(draft.id, categoryManualPath, resume));
          toast.success(
            resume
              ? `Uzum'dagi chala tovar ${draft.uzumPublish?.productId} davom ettirilmoqda — yangi tovar yaratilmaydi.`
              : categoryManualPath?.length
                ? `"${categoryManualPath.join(" → ")}" bilan davom etilmoqda.`
                : resuming
                  ? "To'xtagan joydan davom etilmoqda."
                  : "Uzum'ga joylash boshlandi — jarayon shu sahifada ko'rinadi.",
          );
        }),
      ),
    onStopPublish: () =>
      act("stopPublish", async () => {
        if (!draft) return;
        apply(await stopAiDraftUzum(draft.id));
        toast.success("To'xtatildi — brauzer ochiq qoldi, keyinroq shu joydan davom etadi.");
      }),
    onLink: () => setLinkOpen(true),
    onUnlink: () =>
      act("unlink", async () => {
        if (!draft) return;
        apply(await unlinkAiDraftProduct(draft.id));
        toast.success("Bog'lanish bekor qilindi — qoralama yana yangi tovar sifatida joylanadi.");
      }),
    onToggleEdit: () => setEditMode((v) => !v),
    onEditUzum: (replaceImages: boolean) =>
      guardSplit(() =>
        act("editUzum", async () => {
          if (!draft) return;
          try {
            apply(await editAiDraftUzum(draft.id, replaceImages));
          } catch (err) {
            // Uzum tovarni ABADIY bloklagan — tahrirlab bo'lmaydi. Xato
            // ko'rsatish o'rniga «yangi qilib joylaymi?» deb so'raymiz.
            if (err instanceof ApiError && err.code === "perm_banned") {
              setPermBanned(draft.uzumPublish?.productId ?? "");
              return;
            }
            throw err;
          }
          setEditMode(false);
          toast.success(replaceImages
            ? "Uzum'da yangilash boshlandi — matn, bo'limlar va rasmlar."
            : "Uzum'da yangilash boshlandi — matn va bo'limlar.");
        }),
      ),
    onRepublishNew: () =>
      act("republishNew", async () => {
        if (!draft) return;
        apply(await republishAiDraftNew(draft.id));
        setPermBanned(null);
        toast.success("Yangi tovar sifatida joylash boshlandi — eski (bloklangan) e'lon tegilmaydi.");
      }),
    onRegenerate: () =>
      act("regenerate", async () => {
        if (!draft) return;
        apply(await regenerateAiDraft(draft.id));
        toast.success("Matnlarni to'liq qayta yaratish boshlandi — rasmlar saqlanadi.");
      }),
    onVerify: () =>
      act("verify", async () => {
        if (!draft) return;
        const fresh = await verifyAiDraftUzum(draft.id);
        apply(fresh);
        if (fresh.uzumPublish?.verified) toast.success("Uzum'da topildi — mos keladi.");
        else toast.error(fresh.uzumPublish?.verifyMessage || "Uzum'da topilmadi.");
      }),
    onDelete: () =>
      act("delete", async () => {
        if (!draft) return;
        await deleteAiDraft(draft.id);
        drafts.remove(draft.id);
        toast.success("O'chirildi.");
        router.replace("/warehouse");
      }),
  };

  return (
    <div className={cn("air-slider", styles.page)}>
      <WorkspaceHeader draft={draft} loading={loading} onDraft={apply} />

      {draftId === null && !draft ? (
        <NewDraftView
          files={files}
          onFiles={setFiles}
          hint={hint}
          onHint={setHint}
          shopId={newShopId}
          onShop={setNewShopId}
          disabled={busy === "start"}
        />
      ) : (
        <div className={styles.grid}>
          <section className={cn(styles.card, styles.rise)} style={{ "--i": 1 } as React.CSSProperties}>
            <Tabs draft={draft} tab={tab} onTab={setTab} />
            <div className="p-4 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold tracking-tight sm:text-lg">{TAB_TITLE[tab]}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Ma&apos;lumotlarni tekshiring va kerak bo&apos;lsa tahrirlang — oxirgi so&apos;z sizda.
                  </p>
                </div>
                {locked && (
                  <span className={cn(styles.chip, styles.chipOk)} title="Tasdiqlangan kartochka qulf — o'zgartirish uchun pastdagi «Tahrirlash»ni bosing.">
                    <LockKeyhole className="size-3" aria-hidden /> Qulflangan — pastda «Tahrirlash»
                  </span>
                )}
              </div>
              <div key={tab} id={`draft-panel-${tab}`} role="tabpanel" aria-labelledby={`draft-tab-${tab}`} className={cn("min-w-0", styles.panel)}>
                {loading || !draft ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : form ? (
                  <DraftFields
                    draft={draft}
                    tab={tab}
                    form={form}
                    onForm={setForm as React.Dispatch<React.SetStateAction<DraftForm>>}
                    locked={Boolean(locked)}
                    onChange={apply}
                    sessions={sessions}
                    onOpenSession={setSessionId}
                  />
                ) : null}
              </div>
            </div>
          </section>

          {draft && (
            <Rail
              draft={draft}
              busy={busy}
              onDraft={apply}
              onAct={act}
              sessions={sessions}
              sessionsLoaded={sessionsLoaded}
              sessionsHidden={sessionsHidden}
              onOpenSession={setSessionId}
            />
          )}
        </div>
      )}

      {draft?.uzumPublish?.status === "category_unresolved" && (
        <CategoryFix draft={draft} busy={busy === "publish"} onPublish={(path) => handlers.onPublish(path)} />
      )}

      <ActionBar
        draft={draft}
        locked={Boolean(locked)}
        editMode={editMode}
        dirty={dirty}
        busy={busy}
        filesCount={files.length}
        loading={loading}
        blocked={draft?.audit?.blocking ?? 0}
        tooMany={tooMany}
        handlers={handlers}
      />

      {draft && <SplitDialog draft={draft} open={splitOpen} onOpenChange={setSplitOpen} onDone={apply} />}
      {draft && <LinkProductDialog draft={draft} open={linkOpen} onOpenChange={setLinkOpen} onLinked={apply} />}
      <SessionDialog sessionId={sessionId} onClose={() => setSessionId(null)} />
      <Dialog open={permBanned !== null} onOpenChange={(v) => !v && setPermBanned(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tovar Uzum&apos;da abadiy bloklangan</DialogTitle>
            <DialogDescription>
              {permBanned ? `Uzum «${permBanned}» ` : "Uzum bu "}tovarni abadiy bloklagan —
              kabinetda tahrirlab bo&apos;lmaydi. Shu kartochkani YANGI tovar sifatida
              qaytadan joylaymizmi? Eski (bloklangan) e&apos;lon tegilmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className={cn(styles.btn, styles.btnFlat)}
              onClick={() => setPermBanned(null)}
            >
              Yo&apos;q
            </button>
            <button
              type="button"
              className={cn(styles.btn, styles.btnPrimary)}
              onClick={handlers.onRepublishNew}
              disabled={busy === "republishNew"}
            >
              Ha, yangi qilib joyla
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Tab qatori. Bo'sh tab ATAYLAB o'chirilgan holda qoladi, yashirilmaydi:
 * quvur hali u yergacha yetmagani ko'rinib tursin.
 */
function Tabs({ draft, tab, onTab }: { draft: AiDraft | null; tab: DraftTabKey; onTab: (tab: DraftTabKey) => void }) {
  const attrs = Object.keys(draft?.attributes ?? {}).length;
  const tabs: { key: DraftTabKey; label: string; count?: number; ready: boolean; color?: string }[] = [
    { key: "general", label: "Umumiy", ready: true },
    { key: "ru", label: "Ruscha", ready: Boolean(draft?.titleRu) },
    { key: "images", label: "Rasmlar", count: (draft?.images.length ?? 0) || undefined, ready: Boolean(draft), color: "var(--primary)" },
    { key: "attrs", label: "Xususiyatlar", count: attrs || undefined, ready: attrs > 0, color: "var(--air-teal)" },
    { key: "keywords", label: "Kalit so'zlar", count: draft?.keywords.length || undefined, ready: (draft?.keywords.length ?? 0) > 0, color: "var(--air-pink)" },
    { key: "market", label: "Bozor", count: draft?.market?.rivals.length || undefined, ready: (draft?.market?.rivals.length ?? 0) > 0, color: "var(--warn)" },
    { key: "pricing", label: "Tan narx", ready: Boolean(draft), color: "var(--ok)" },
    { key: "audit", label: "Tayyorlik", count: draft?.audit?.blocking || undefined, ready: Boolean(draft?.audit), color: "var(--bad)" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Tovar ma'lumotlari"
      className={styles.tabs}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next]?.focus();
        buttons[next]?.click();
      }}
    >
      {tabs.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          id={`draft-tab-${item.key}`}
          aria-controls={`draft-panel-${item.key}`}
          aria-selected={tab === item.key}
          tabIndex={tab === item.key ? 0 : -1}
          data-active={tab === item.key}
          disabled={!item.ready}
          onClick={() => onTab(item.key)}
          className={styles.tab}
          style={{ "--tab-color": item.color } as React.CSSProperties}
        >
          {item.label}
          {item.count ? <span className={styles.count}>{item.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
