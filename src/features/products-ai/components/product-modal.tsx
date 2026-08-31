"use client";

import * as React from "react";
import { Check, Copy, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AirSlider } from "@/components/air/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { DropZone } from "@/features/products-ai/components/dropzone";
import {
  DraftFields,
  DraftTabs,
  initialForm,
  type DraftForm,
  type DraftTabKey,
} from "@/features/products-ai/components/draft-fields";
import { DraftSide } from "@/features/products-ai/components/draft-side";
import { StageStrip } from "@/features/products-ai/components/stage-strip";
import {
  ApiError,
  approveAiDraft,
  createAiDraft,
  deleteAiDraft,
  fetchAiDraft,
  fetchAiPackage,
  patchAiDraft,
  retryAiDraft,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

/** Quvur ishlayotganda holat shuncha vaqtda bir so'raladi. */
const POLL_MS = 4000;

/**
 * «Tovar qo'shish» oynasi — Bitrix24 dagi «Создание сделки»
 * naqshi bo'yicha (namuna foydalanuvchi ko'rsatgan sayt,
 * qiymatlar o'sha yerda o'lchangan):
 *
 *   sarlavha   ▸ 25px, chapda, × esa panel chetida
 *   bosqichlar ▸ Rasm → Tahlil → … → Tayyor
 *   tablar     ▸ Umumiy · Ruscha · Rasmlar · …
 *   kanvas     ▸ KULRANG, ustida ikkita OQ karta:
 *                chapda forma, o'ngda jarayon
 *   ost qismi  ▸ laym «SAQLASH» va «BEKOR QILISH», markazda
 *
 * NEGA ALOHIDA SAHIFA EMAS. Tovar qo'shish — omborning ICHIDAGI
 * ish. Alohida sahifada sotuvchi katalogdan chiqib ketardi va
 * qaytganda qayerda qolgani yo'qolardi; menyuda esa kuniga bir
 * marta bosiladigan yana bitta qator turardi.
 *
 * Oyna IKKI holatda ishlaydi va bu ATAYLAB bitta oyna: qoralama
 * yo'q — rasm tanlash; bor — tekshirish va tasdiqlash. Rasm
 * tashlanganda oyna yopilib qolsa, sotuvchi natijani qayerdan
 * izlashni bilmasdi.
 */
export function ProductAiModal({
  open,
  draftId,
  onClose,
  onDraft,
  onDeleted,
}: {
  open: boolean;
  /** `null` — yangi qoralama; raqam — mavjudini ochish. */
  draftId: number | null;
  onClose: () => void;
  /** Ro'yxat yangilanishi uchun: har o'zgarishda chaqiriladi. */
  onDraft: (draft: AiDraft) => void;
  onDeleted: (id: number) => void;
}) {
  const [draft, setDraft] = React.useState<AiDraft | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [hint, setHint] = React.useState("");
  const [tab, setTab] = React.useState<DraftTabKey>("general");
  const [form, setForm] = React.useState<DraftForm | null>(null);
  const [busy, setBusy] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // Oyna har ochilganda toza holatdan boshlanadi: oldingi
  // qoralamaning matni yangi tovarga qo'shilib qolmasin.
  React.useEffect(() => {
    if (!open) return;
    setFiles([]);
    setHint("");
    setBusy("");
    setConfirmDelete(false);
    setTab("general");
    if (draftId === null) {
      setDraft(null);
      setForm(null);
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        setDraft(await fetchAiDraft(draftId));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Qoralama ochilmadi.");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
    // `onClose` ataylab bog'liqlikda emas: u har renderda yangi
    // funksiya bo'lishi mumkin va qoralamani qayta-qayta yuklardi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draftId]);

  // Quvur fonda ishlaydi va oyna uni so'rab turadi. So'rash FAQAT
  // tugallanmagan qoralamada ketadi — tayyorini qayta-qayta
  // so'rashning ma'nosi yo'q.
  const running = draft !== null && draft.progress < 100 && !draft.error;
  React.useEffect(() => {
    if (!open || !running || draft === null) return;
    const id = window.setInterval(async () => {
      try {
        const fresh = await fetchAiDraft(draft.id);
        setDraft(fresh);
        onDraft(fresh);
      } catch {
        /* keyingi urinishda */
      }
    }, POLL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, running, draft?.id]);

  // Forma qoralama yangilanganda qayta yig'iladi. Bog'liqlik
  // `updatedAt` — quvur qadamni tugatib matn yozganda sotuvchi
  // uni darhol ko'radi.
  React.useEffect(() => {
    setForm(draft ? initialForm(draft) : null);
  }, [draft?.id, draft?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (fresh: AiDraft) => {
    setDraft(fresh);
    onDraft(fresh);
  };

  const act = async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    try {
      await fn();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setBusy("");
    }
  };

  const locked = draft?.stage === "approved";
  const dirty =
    draft !== null &&
    form !== null &&
    (Object.keys(form) as (keyof DraftForm)[]).some(
      (key) => form[key] !== initialForm(draft)[key],
    );

  return (
    <AirSlider
      open={open}
      onClose={onClose}
      title={
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="truncate">
            {draft?.titleUz?.trim() || "Tovar qo'shish"}
          </span>
          <span className="text-[13px] font-normal text-[color:var(--air-label)]">
            {draft ? `qoralama #${draft.id} · ${draft.stageLabel}` : "rasmdan kartochka"}
          </span>
        </div>
      }
      subheader={
        <>
          <StageStrip draft={draft} />
          <DraftTabs draft={draft} tab={tab} onTab={setTab} />
        </>
      }
      footer={
        <Footer
          draft={draft}
          locked={Boolean(locked)}
          dirty={dirty}
          busy={busy}
          files={files}
          confirmDelete={confirmDelete}
          onConfirmDelete={setConfirmDelete}
          onClose={onClose}
          onStart={() =>
            act("start", async () => {
              const fresh = await createAiDraft(files, hint.trim());
              setFiles([]);
              setHint("");
              apply(fresh);
              toast.success("Rasm qabul qilindi — AI ishlashni boshladi.");
            })
          }
          onSave={() =>
            act("save", async () => {
              if (!draft || !form) return;
              apply(await patchAiDraft(draft.id, form));
              toast.success("Saqlandi.");
            })
          }
          onCopy={() =>
            act("copy", async () => {
              if (!draft) return;
              const pkg = await fetchAiPackage(draft.id);
              await navigator.clipboard.writeText(pkg.plainText);
              toast.success(
                pkg.missing.length
                  ? `Nusxalandi. Yetishmaydi: ${pkg.missing.join(", ")}`
                  : "Hammasi nusxalandi.",
              );
            })
          }
          onApprove={() =>
            act("approve", async () => {
              if (!draft) return;
              apply(await approveAiDraft(draft.id));
              toast.success("Tasdiqlandi — Uzumga ko'chirishga tayyor.");
            })
          }
          onDelete={() =>
            act("delete", async () => {
              if (!draft) return;
              await deleteAiDraft(draft.id);
              onDeleted(draft.id);
              toast.success("O'chirildi.");
              onClose();
            })
          }
        />
      }
    >
      {/* Kulrang kanvas ustida ikkita oq karta — namunadagi kabi. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="air-card min-w-0 px-[15px]">
          <div className="air-card-head">
            {draft === null ? "Tovar rasmi" : TAB_TITLE[tab]}
            {locked && (
              <span className="ml-auto text-[11px] font-normal normal-case text-[color:var(--air-label)]">
                tasdiqlangan — tahrirlanmaydi
              </span>
            )}
          </div>
          <div className="py-4">
            {loading || (draftId !== null && draft === null) ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : draft === null ? (
              <DropZone
                files={files}
                onFiles={setFiles}
                hint={hint}
                onHint={setHint}
                disabled={busy === "start"}
              />
            ) : form ? (
              <DraftFields
                draft={draft}
                tab={tab}
                form={form}
                onForm={setForm as React.Dispatch<React.SetStateAction<DraftForm>>}
                locked={Boolean(locked)}
                onChange={apply}
              />
            ) : null}
          </div>
        </section>

        <aside className="air-card min-w-0 px-[15px]">
          <div className="air-card-head">Jarayon</div>
          <div className="py-4">
            <DraftSide
              draft={draft}
              retrying={busy === "retry"}
              onRetry={() =>
                act("retry", async () => {
                  if (!draft) return;
                  apply(await retryAiDraft(draft.id));
                  toast.success("Davom ettirilmoqda.");
                })
              }
            />
          </div>
        </aside>
      </div>
    </AirSlider>
  );
}

const TAB_TITLE: Record<DraftTabKey, string> = {
  general: "Tovar haqida",
  ru: "Ruscha matn",
  images: "Rasmlar",
  attrs: "Xususiyatlar",
  keywords: "Kalit so'zlar",
  market: "Bozordagi raqobatchilar",
  audit: "Joylashga tayyorlik",
};

/**
 * Ost qism — namunadagi kabi: laym «SAQLASH» va yonida
 * «BEKOR QILISH», ikkalasi panel bo'ylab MARKAZDA. O'chirish
 * chetda, tasodifan bosilmaydigan joyda va ikki bosqichli
 * tasdiq bilan.
 */
function Footer({
  draft,
  locked,
  dirty,
  busy,
  files,
  confirmDelete,
  onConfirmDelete,
  onStart,
  onSave,
  onCopy,
  onApprove,
  onDelete,
  onClose,
}: {
  draft: AiDraft | null;
  locked: boolean;
  dirty: boolean;
  busy: string;
  files: File[];
  confirmDelete: boolean;
  onConfirmDelete: (value: boolean) => void;
  onStart: () => void;
  onSave: () => void;
  onCopy: () => void;
  onApprove: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const blocked = draft?.audit?.blocking ?? 0;
  const spin = (name: string) =>
    busy === name ? <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" /> : null;

  if (draft === null) {
    return (
      <>
        <span className="hidden text-xs text-[color:var(--air-label)] sm:block">
          {files.length ? `${files.length} ta rasm tanlandi` : "Rasm tanlanmagan"}
        </span>
        <div className="mx-auto flex items-center gap-2">
          <button
            type="button"
            className="air-btn-save"
            onClick={onStart}
            disabled={!files.length || busy === "start"}
          >
            {spin("start")}Boshlash
          </button>
          <button type="button" className="air-btn-flat" onClick={onClose}>
            Bekor qilish
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <span className="hidden text-xs text-[color:var(--air-label)] sm:block">
        {draft.progress}% · {draft.stageLabel}
      </span>
      <div className="mx-auto flex flex-wrap items-center justify-center gap-2">
        {!locked && (
          <button
            type="button"
            className="air-btn-save"
            onClick={onSave}
            disabled={!dirty || busy === "save"}
          >
            {spin("save")}Saqlash
          </button>
        )}
        <button
          type="button"
          className="air-btn-flat"
          onClick={onCopy}
          disabled={busy === "copy"}
        >
          {spin("copy") ?? <Copy className="mr-1.5 inline h-3.5 w-3.5" />}
          Uzum uchun nusxalash
        </button>
        {!locked && draft.progress >= 95 && (
          <button
            type="button"
            className={cn("air-btn-flat", blocked && "text-destructive")}
            onClick={onApprove}
            disabled={busy === "approve"}
            title={
              blocked
                ? `Tayyorlik tabida ${blocked} ta to'sib turgan kamchilik bor`
                : undefined
            }
          >
            {spin("approve") ?? <Check className="mr-1.5 inline h-3.5 w-3.5" />}
            Tasdiqlash
            {blocked ? ` (${blocked})` : ""}
          </button>
        )}
        <button type="button" className="air-btn-flat" onClick={onClose}>
          Yopish
        </button>
      </div>
      <button
        type="button"
        onClick={() => (confirmDelete ? onDelete() : onConfirmDelete(true))}
        disabled={busy === "delete"}
        className={cn(
          "ml-auto flex items-center gap-1.5 text-xs transition-colors",
          confirmDelete
            ? "air-bad font-medium"
            : "text-[color:var(--air-label)] hover:text-[color:var(--air-head)]",
        )}
      >
        <Trash2 className="h-3 w-3" />
        {confirmDelete ? "aniqmi? bosing" : "o'chirish"}
      </button>
    </>
  );
}
