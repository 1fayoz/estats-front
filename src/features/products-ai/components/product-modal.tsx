"use client";

import * as React from "react";
import { Check, Copy, Loader2, Pencil, Square, Trash2, Upload } from "lucide-react";
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
import { PUBLISH_PHASES, publishPhaseState } from "@/features/products-ai/publish-stages";
import { StageStrip } from "@/features/products-ai/components/stage-strip";
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
  retryAiDraft,
  stopAiDraftUzum,
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
  // Uzum'da ALLAQACHON turgan tovarni qayta ochish uchun — tasdiqlangan
  // qoralama sukut bo'yicha QULF (o'zgartirib bo'lmaydi, endi Uzum'ning
  // o'zida turibdi). "Tahrirlash" shu qulfni VAQTINCHA ochadi: sotuvchi
  // matn/rasmni qayta generatsiya qilib, keyin "Uzumda yangilash" bilan
  // HAQIQIY tovarga ko'chiradi. Yaratishdan OLDINGI (hali joylanmagan)
  // tasdiqlangan qoralamada bu tugma yo'q — u hali ham to'liq qulf.
  const [editMode, setEditMode] = React.useState(false);

  // Oyna har ochilganda toza holatdan boshlanadi: oldingi
  // qoralamaning matni yangi tovarga qo'shilib qolmasin.
  React.useEffect(() => {
    if (!open) return;
    setFiles([]);
    setHint("");
    setBusy("");
    setConfirmDelete(false);
    setEditMode(false);
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
  // so'rashning ma'nosi yo'q. Uzum'ga joylash HAM fon vazifasi
  // (brauzer bilan boshqarish bir necha o'n soniya ketadi) — u ham
  // xuddi shu so'rov bilan kuzatiladi, `progress` bilan bog'liq
  // emas: joylash faqat tasdiqlangandan (progress 100) KEYIN
  // boshlanadi.
  const running =
    draft !== null &&
    ((draft.progress < 100 && !draft.error) ||
      draft.uzumPublish?.status === "queued" ||
      draft.uzumPublish?.status === "running");
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

  const locked = draft?.stage === "approved" && !editMode;
  const isLiveOnUzum = Boolean(draft?.uzumPublish?.productId);
  const draftPublishStatus = draft?.uzumPublish?.status || null;
  const draftPublishing =
    draftPublishStatus === "queued" || draftPublishStatus === "running";
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
          {/*
            BITTA bosqich chizig'i, navbat bilan: AI kartochkani
            tayyorlagunicha — quvur qadamlari; Uzumga joylash
            boshlangach — joylash fazalari. Ikkalasi bir vaqtda
            ko'rinsa oynada uchta o'xshash gorizontal chiziq bo'lardi
            va qaysi biri navigatsiya, qaysi biri holat ekani
            bilinmasdi.
          */}
          {draftPublishStatus ? (
            <PublishProgress
              draft={draft!}
              publishing={draftPublishing}
              publishStage={draft?.uzumPublish?.stage || null}
              publishStatus={draftPublishStatus}
            />
          ) : (
            <StageStrip draft={draft} />
          )}
          <DraftTabs draft={draft} tab={tab} onTab={setTab} />
        </>
      }
      footer={
        <Footer
          draft={draft}
          locked={Boolean(locked)}
          editMode={editMode}
          isLiveOnUzum={isLiveOnUzum}
          dirty={dirty}
          busy={busy}
          files={files}
          confirmDelete={confirmDelete}
          onConfirmDelete={setConfirmDelete}
          onClose={onClose}
          onToggleEdit={() => setEditMode((v) => !v)}
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
          onPublish={(categoryManualPath) =>
            act("publish", async () => {
              if (!draft) return;
              const resuming = draft.uzumPublish?.status === "stopped";
              apply(await publishAiDraftUzum(draft.id, categoryManualPath));
              toast.success(
                categoryManualPath?.length
                  ? `"${categoryManualPath.join(" → ")}" bilan davom etilmoqda.`
                  : resuming
                    ? "To'xtagan joydan davom etilmoqda."
                    : "Uzum'ga joylash boshlandi — jarayon shu oynada ko'rinadi.",
              );
            })
          }
          onStopPublish={() =>
            act("stopPublish", async () => {
              if (!draft) return;
              apply(await stopAiDraftUzum(draft.id));
              toast.success("To'xtatildi — brauzer ochiq qoldi, keyinroq shu joydan davom etadi.");
            })
          }
          onEditUzum={(replaceImages) =>
            act("editUzum", async () => {
              if (!draft) return;
              apply(await editAiDraftUzum(draft.id, replaceImages));
              setEditMode(false);
              toast.success(
                replaceImages
                  ? "Uzum'da yangilanmoqda — nom, tavsif va rasmlar."
                  : "Uzum'da yangilanmoqda — nom va tavsif.",
              );
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

/** Sotuvchi harakat qilishi kerak bo'lgan holatlar — nusxa "xato" emas, "keyingi qadam". */
const FAILED_PUBLISH = new Set(["error", "category_unresolved"]);

const PUBLISH_STATUS_LABEL: Record<string, string> = {
  published: "Uzum'ga joylandi ✓",
  needs_login: "Uzum sessiyasi yo'q — Sozlamalar → Integratsiyalar'da ulaning",
  captcha: "Uzum CAPTCHA so'radi — qayta urinib ko'ring",
  category_unresolved: "Kategoriya avtomatik topilmadi — qo'lda joylash kerak",
  needs_manual_step: "Bir bosqichda to'xtadi — qo'lda tekshirish kerak",
  stopped: "To'xtatildi — davom ettirish mumkin",
  error: "Joylanmadi",
};

const PUBLISH_STAGE_LABEL: Record<string, string> = {
  starting: "sahifa ochilmoqda",
  category: "kategoriya aniqlanmoqda",
  content: "nom va tavsif to'ldirilmoqda",
  images: "rasmlar yuklanmoqda",
  review: "yakuniy bosqichlar",
};

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
  editMode,
  isLiveOnUzum,
  dirty,
  busy,
  files,
  confirmDelete,
  onConfirmDelete,
  onStart,
  onSave,
  onCopy,
  onApprove,
  onPublish,
  onStopPublish,
  onToggleEdit,
  onEditUzum,
  onDelete,
  onClose,
}: {
  draft: AiDraft | null;
  locked: boolean;
  editMode: boolean;
  isLiveOnUzum: boolean;
  dirty: boolean;
  busy: string;
  files: File[];
  confirmDelete: boolean;
  onConfirmDelete: (value: boolean) => void;
  onStart: () => void;
  onSave: () => void;
  onCopy: () => void;
  onApprove: () => void;
  onPublish: (categoryManualPath?: string[]) => void;
  onStopPublish: () => void;
  onToggleEdit: () => void;
  onEditUzum: (replaceImages: boolean) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [pushImages, setPushImages] = React.useState(false);
  const blocked = draft?.audit?.blocking ?? 0;
  const publishStatus = draft?.uzumPublish?.status || null;
  const categoryLevels = draft?.uzumPublish?.categoryLevels || [];
  const [categoryPicks, setCategoryPicks] = React.useState<string[]>([]);
  // Yangi urinishda ro'yxat avtomatik tanlangan qiymatlar bilan
  // qayta boshlanadi — eskisi qolib ketmasin.
  React.useEffect(() => {
    setCategoryPicks(categoryLevels.map((l) => l.chosen));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryLevels.map((l) => `${l.depth}:${l.chosen}`).join("|")]);
  // `queued` — so'rov endigina yuborilgan, `running` — brauzer
  // fonda haqiqatan ishlayapti (bosqichlar shu bosqichda o'tadi,
  // bir necha o'n soniya davom etadi). Faqat "queued"ni tekshirish
  // XATO edi: real sinovda job "queued"dan "running"ga bir necha
  // soniyada o'tadi va progress-bar DARHOL yo'qolib, tugma yana
  // "Uzumga joylash" bo'lib qolardi — garchi fonda jarayon davom
  // etayotgan bo'lsa ham.
  const publishing = publishStatus === "queued" || publishStatus === "running";
  const publishStage = draft?.uzumPublish?.stage || null;
  const publishProgress = draft?.uzumPublish?.progress ?? 0;
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
        {!locked && !editMode && draft.progress >= 95 && (
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
        {/* Bu tugma FAQAT hali Uzum'da UMUMAN yo'q qoralama uchun —
            `isLiveOnUzum` bo'lsa, qayta bosish YANGI (dublikat)
            tovar yaratardi (`/products/new`). Allaqachon joylangan
            tovar uchun pastdagi "Tahrirlash" yo'li ishlatiladi. */}
        {locked && !isLiveOnUzum && (
          <button
            type="button"
            className={cn(
              "air-btn-flat",
              publishStatus && FAILED_PUBLISH.has(publishStatus) && "text-destructive",
            )}
            onClick={() => onPublish()}
            disabled={publishing || busy === "publish"}
            title={draft.uzumPublish?.message || undefined}
          >
            {publishing || busy === "publish" ? (
              <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 inline h-3.5 w-3.5" />
            )}
            {publishing
              ? `Joylanmoqda... ${publishProgress}%`
              : publishStatus === "stopped"
                ? "Davom ettirish"
                : "Uzumga joylash"}
          </button>
        )}
        {locked && !isLiveOnUzum && publishing && (
          <button
            type="button"
            className="air-btn-flat"
            onClick={onStopPublish}
            disabled={busy === "stopPublish"}
            title="Bosqichlar orasida to'xtatadi — brauzer ochiq qoladi, keyinroq shu joydan davom etadi."
          >
            {busy === "stopPublish" ? (
              <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" />
            ) : (
              <Square className="mr-1.5 inline h-3.5 w-3.5" />
            )}
            To&apos;xtatish
          </button>
        )}
        {/* Allaqachon Uzum'da turgan tovar — "Tahrirlash" QULFNI
            vaqtincha ochadi: matn/rasmni qayta generatsiya qilib,
            "Uzumda yangilash" bilan HAQIQIY tovarga ko'chirish
            mumkin. Bu yerda YANGI tovar hech qachon yaratilmaydi. */}
        {locked && isLiveOnUzum && (
          <button type="button" className="air-btn-flat" onClick={onToggleEdit}>
            <Pencil className="mr-1.5 inline h-3.5 w-3.5" />
            Tahrirlash
          </button>
        )}
        {editMode && (
          <>
            <label className="flex items-center gap-1.5 text-xs text-[color:var(--air-label)]">
              <input
                type="checkbox"
                checked={pushImages}
                onChange={(e) => setPushImages(e.target.checked)}
              />
              rasmlarni ham
            </label>
            <button
              type="button"
              className="air-btn-save"
              onClick={() => onEditUzum(pushImages)}
              disabled={busy === "editUzum"}
              title="Nom, tavsif va (belgilansa) rasmlarni Uzum'dagi tovarga ko'chiradi."
            >
              {spin("editUzum")}Uzum&apos;da yangilash
            </button>
            <button type="button" className="air-btn-flat" onClick={onToggleEdit}>
              Bekor qilish
            </button>
          </>
        )}
        <button type="button" className="air-btn-flat" onClick={onClose}>
          Yopish
        </button>
      </div>
      {publishStatus === "category_unresolved" && !publishing && categoryLevels.length > 0 && (
        // Avtomatika biror darajada ishonchsiz tanlov qilgan
        // (`category.js`dagi ball tekshiruvi) — VNC ochish shart
        // emas, DARAXTNING HAR DARAJASI shu yerda, o'zgartirish
        // mumkin. Xato ko'pincha ENG OXIRGI emas, O'RTADAGI
        // darajada bo'ladi (masalan "Ayollar aksessuarlari" ishonch
        // bilan tanlanadi-yu, aslida boshqa shoxda kerak) — shuning
        // uchun faqat oxirgi emas, ISTALGAN daraja o'zgartiriladi.
        // "Davom etish" TO'LIQ yo'lni (`categoryManualPath`)
        // yuboradi, o'zgartirilmagan darajalar avtomatika tanlagani
        // bilan qoladi.
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {categoryLevels.map((level, i) => {
              // Bu daraja hali eskisi (avtomatika tanlagan)mi — shu
              // bo'lsa, undan KEYINGI barcha darajalar ENDI ISHONCHSIZ:
              // ular O'SHA ESKI (noto'g'ri) shoxning bolalari sifatida
              // ushlangan edi. Haqiqiy sinovda aynan shu tuzoq topildi:
              // sotuvchi 2-bosqichni to'g'irlasa ("Shaxsiy gigiyena"),
              // 3-4-bosqich hamon ESKI shox ("Sochlar parvarishi")ning
              // bolalarini ko'rsatardi ("Bigudi" kabi) — kerakli
              // "Og'iz bo'shlig'i gigiyenasi" hech qachon ro'yxatda
              // ko'rinmasdi, chunki u UMUMAN boshqa so'rovning natijasi.
              // Yechim: o'zgartirilgan darajadan KEYINGISI ko'rsatilmaydi
              // — `category.js`ning o'zi ularni "Davom etish"da yangi
              // (to'g'ri) shoxdan qayta kashf qiladi (`clickBestOption`
              // eskirgan/mos kelmagan `forcedText`ni jimgina e'tiborsiz
              // qoldirib, oddiy ballashga tushadi).
              const priorChanged = categoryPicks
                .slice(0, i)
                .some((pick, j) => pick !== categoryLevels[j]?.chosen);
              if (priorChanged) return null;
              return (
                <React.Fragment key={level.depth}>
                  {i > 0 && (
                    <span className="text-[11px] text-[color:var(--air-label)]">→</span>
                  )}
                  {i === 0 ? (
                    // 1-bosqich Uzum'da QIDIRUV maydoni, ro'yxat emas
                    // (`category.js`) — shuning uchun bu yerda ham
                    // erkin matn: variant faqat SHU URINISHDA topilgan
                    // bitta nomni ko'rsatadi, boshqa shoxni tanlash
                    // uchun sotuvchi butunlay boshqa so'z yozishi kerak.
                    <input
                      type="text"
                      className={cn(
                        "air-input h-8 w-auto max-w-[220px] text-xs",
                        categoryPicks[i] !== level.chosen && "border-[color:var(--warn)]",
                      )}
                      value={categoryPicks[i] ?? level.chosen}
                      placeholder="Toifa nomi..."
                      onChange={(e) =>
                        setCategoryPicks((prev) => [
                          ...prev.slice(0, i),
                          e.target.value,
                        ])
                      }
                    />
                  ) : (
                    <select
                      className={cn(
                        "air-input h-8 w-auto max-w-[220px] text-xs",
                        categoryPicks[i] !== level.chosen && "border-[color:var(--warn)]",
                      )}
                      value={categoryPicks[i] ?? level.chosen}
                      onChange={(e) =>
                        setCategoryPicks((prev) => [
                          ...prev.slice(0, i),
                          e.target.value,
                        ])
                      }
                    >
                      {level.candidates.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-center text-[11px] text-[color:var(--air-label)]">
            1-maydon — erkin qidiruv so'zi (masalan, boshqa toifa uchun butunlay boshqa so'z yozing);
            qolganlari — Uzum'ning shu daraja uchun taklif qilgan ro'yxati. Darajani
            o'zgartirsangiz, undan keyingisi "Davom etish"da yangi shoxdan qayta topiladi.
          </p>
          <button
            type="button"
            className="air-btn-save"
            disabled={busy === "publish"}
            onClick={() => {
              const priorChangedAt = categoryPicks.findIndex(
                (pick, j) => pick !== categoryLevels[j]?.chosen,
              );
              onPublish(
                priorChangedAt === -1
                  ? categoryPicks
                  : categoryPicks.slice(0, priorChangedAt + 1),
              );
            }}
          >
            Shu yo&apos;l bilan davom etish
          </button>
        </div>
      )}
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


/**
 * Uzumga joylash bosqichlari — kategoriya → ma'lumot → yakunlash.
 *
 * ATAYLAB oynaning TEPASIDA, AI bosqich chizig'ining O'RNIDA
 * (ikkalasi bir vaqtda ko'rinmaydi). Ilgari u Footer ichida,
 * tugmalar qatoridan KEYIN chizilardi: natijada oynada uchta
 * o'xshash gorizontal chiziq bo'lardi (AI bosqichlari, tablar,
 * joylash bosqichlari) va oxirgisi harakat tugmalaridan pastda
 * yetim bo'lib osilib qolardi — qaysi biri navigatsiya, qaysi
 * biri holat ekani bilinmasdi.
 *
 * Sotuvchi uchun bu BITTA yo'l: avval AI kartochkani tayyorlaydi,
 * keyin u Uzumga ko'chadi. Shuning uchun bitta joyda, navbat
 * bilan ko'rsatiladi.
 */
function PublishProgress({
  draft,
  publishing,
  publishStage,
  publishStatus,
}: {
  draft: AiDraft;
  publishing: boolean;
  publishStage: string | null;
  publishStatus: string;
}) {
  return (
    <>
        // Uzum'ning O'Z bosqich chizig'iga o'xshab (kategoriya →
        // ma'lumot → yakunlash) — sotuvchi HAR safar bitta xira
        // "43%" o'rniga QAYSI faza tugagani, qaysi ketayotgani,
        // qaysi hali kelmaganini ko'radi. Chiziq NATIJADAN keyin
        // ham qoladi — muvaffaqiyatsiz urinish qaysi fazada
        // to'xtaganini keyin qaytib ochganda ham ko'rsatib turadi.
        <div className="w-full space-y-1.5">
          <div className="air-stages" role="list">
            {PUBLISH_PHASES.map((phase) => {
              const state = publishPhaseState(phase, draft.uzumPublish, publishing);
              return (
                <div
                  key={phase.key}
                  role="listitem"
                  data-state={state}
                  className="air-stage"
                  title={phase.label}
                >
                  {phase.short}
                </div>
              );
            })}
          </div>
          {publishing && publishStage ? (
            <p className="text-center text-xs text-[color:var(--air-label)]">
              {PUBLISH_STAGE_LABEL[publishStage] ?? publishStage}…
              {Object.keys(draft.uzumPublish?.timings || {}).length > 0 && (
                <span className="ml-1">
                  (
                  {Object.entries(draft.uzumPublish!.timings)
                    .map(([stage, ms]) => `${PUBLISH_STAGE_LABEL[stage] ?? stage}: ${(ms / 1000).toFixed(1)}s`)
                    .join(", ")}
                  )
                </span>
              )}
            </p>
          ) : (
            <p
              className={cn(
                "text-center text-xs",
                publishStatus === "published"
                  ? "air-ok"
                  : FAILED_PUBLISH.has(publishStatus)
                    ? "air-bad"
                    : "air-warn",
              )}
            >
              {PUBLISH_STATUS_LABEL[publishStatus] ?? draft.uzumPublish?.message}
              {publishStatus === "published" && draft.uzumPublish?.timings && (
                <span className="ml-1 text-[color:var(--air-label)]">
                  (jami{" "}
                  {(
                    Object.values(draft.uzumPublish.timings).reduce((a, b) => a + b, 0) / 1000
                  ).toFixed(1)}
                  s)
                </span>
              )}
            </p>
          )}
        </div>
    </>
  );
}
