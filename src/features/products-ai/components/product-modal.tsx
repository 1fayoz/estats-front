"use client";

import * as React from "react";
import { Check, Copy, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { AirModal } from "@/components/air/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { AiDraft } from "@/lib/types";

/** Quvur ishlayotganda holat shuncha vaqtda bir so'raladi. */
const POLL_MS = 4000;

/**
 * «Tovar qo'shish» oynasi — Bitrix24 dagi «Создание сделки» naqshi:
 * sarlavha, ostida bosqichlar chizig'i va tablar, chapda forma,
 * o'ngda jarayon lentasi, pastda asosiy amallar.
 *
 * NEGA ALOHIDA SAHIFA EMAS. Tovar qo'shish — omborning ichidagi
 * ish, alohida bo'lim emas. Alohida sahifada sotuvchi katalogdan
 * chiqib ketardi va qaytib kelganda qayerda qolgani yo'qolardi;
 * menyuda esa kuniga bir marta bosiladigan yana bitta qator
 * turardi. Modal katalog ustida ochiladi va yopilganda o'sha
 * joyga qaytaradi.
 *
 * Oyna IKKI holatda ishlaydi:
 *   · qoralama yo'q — rasm tanlash;
 *   · qoralama bor  — AI yozganini tekshirish, tuzatish, tasdiqlash.
 *
 * Ikkalasi bitta oynada, chunki bu bitta ish: rasm tashlaganda
 * oyna yopilib qolsa, sotuvchi natijani qayerdan izlashni
 * bilmasdi.
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

  const start = () =>
    act("start", async () => {
      const fresh = await createAiDraft(files, hint.trim());
      setFiles([]);
      setHint("");
      apply(fresh);
      toast.success("Rasm qabul qilindi — AI ishlashni boshladi.");
    });

  const locked = draft?.stage === "approved";
  const dirty =
    draft !== null &&
    form !== null &&
    (Object.keys(form) as (keyof DraftForm)[]).some(
      (key) => form[key] !== initialForm(draft)[key],
    );

  return (
    <AirModal
      open={open}
      onClose={onClose}
      width={1180}
      title={
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{draft?.titleUz?.trim() || "Tovar qo'shish"}</span>
          {draft && (
            <Badge variant={locked ? "success" : "secondary"} className="font-normal">
              {draft.stageLabel}
            </Badge>
          )}
          <span className="text-[13px] font-normal text-muted-foreground">
            {draft ? `qoralama #${draft.id}` : "rasmdan kartochka"}
          </span>
        </div>
      }
      subheader={
        <div className="space-y-3">
          <StageStrip draft={draft} />
          <DraftTabs draft={draft} tab={tab} onTab={setTab} />
        </div>
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
          onStart={start}
          onClose={onClose}
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {loading || (draftId !== null && draft === null) ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
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

          {locked && (
            <p className="mt-4 text-xs text-muted-foreground">
              Tasdiqlangan qoralama tahrirlanmaydi. Uzumda mahsulot yaratish
              API&apos;si yo&apos;q — matnni nusxalab, Uzum panelida joylang.
            </p>
          )}
        </div>

        <aside className="lg:border-l lg:pl-5">
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
        </aside>
      </div>
    </AirModal>
  );
}

/**
 * Ost qism — Bitrix naqshi: asosiy amal MARKAZDA (ko'z uni
 * birinchi topadi), yopish yonida, o'chirish esa chetda, tasodifan
 * bosilmaydigan joyda va ikki bosqichli tasdiq bilan.
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
  const green = "bg-[#00904d] text-white hover:bg-[#00a457]";

  if (draft === null) {
    return (
      <>
        <span className="text-xs text-muted-foreground">
          {files.length ? `${files.length} ta rasm tanlandi` : "Rasm tanlanmagan"}
        </span>
        <div className="mx-auto flex items-center gap-2">
          <Button
            size="sm"
            className={green}
            onClick={onStart}
            disabled={!files.length || busy === "start"}
          >
            {busy === "start" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Boshlash
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Bekor qilish
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <span className="hidden text-xs text-muted-foreground sm:block">
        {draft.progress}% · {draft.stageLabel}
      </span>
      <div className="mx-auto flex flex-wrap items-center justify-center gap-2">
        {!locked && (
          <Button
            size="sm"
            className={green}
            onClick={onSave}
            disabled={!dirty || busy === "save"}
          >
            {busy === "save" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Saqlash
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onCopy} disabled={busy === "copy"}>
          {busy === "copy" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          Uzum uchun nusxalash
        </Button>
        {!locked && draft.progress >= 95 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onApprove}
            disabled={busy === "approve"}
          >
            <Check className="h-3.5 w-3.5" /> Tasdiqlash
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onClose}>
          Yopish
        </Button>
      </div>
      <button
        type="button"
        onClick={() => (confirmDelete ? onDelete() : onConfirmDelete(true))}
        disabled={busy === "delete"}
        className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
        {confirmDelete ? "aniqmi? bosing" : "o'chirish"}
      </button>
    </>
  );
}
