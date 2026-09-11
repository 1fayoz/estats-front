"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Copy, ImagePlus, Lightbulb, Loader2, LockKeyhole, Pencil, Search, ShieldCheck, Sparkles, Square, Trash2, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { ProductDialog } from "@/features/products-ai/components/product-dialog";
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
  regenerateAiDraft,
  retryAiDraft,
  stopAiDraftUzum,
  verifyAiDraftUzum,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

/** Quvur ishlayotganda holat shuncha vaqtda bir so'raladi. */
const POLL_MS = 4000;

const TAB_KEYS: DraftTabKey[] = [
  "general", "ru", "images", "attrs", "keywords", "market", "pricing", "audit",
];

// Tanlangan tab URL'da (`?draft=5&tab=market`) — sahifa yangilanganda
// yoki havola orqali ochilganda o'sha tabga qaytadi. Warehouse
// sahifasidagi `?draft=` bilan bir xil naqsh: Next routerisiz,
// brauzerning O'Z `history.replaceState`i bilan (Next'ning marshrut
// keshi bilan bog'liq xato bor edi — o'sha sahifa izohiga q.).
function readTabFromUrl(): DraftTabKey | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("tab");
  return value && (TAB_KEYS as string[]).includes(value)
    ? (value as DraftTabKey)
    : null;
}

function writeTabToUrl(tab: DraftTabKey) {
  if (typeof window === "undefined") return;
  const next = new URLSearchParams(window.location.search);
  if (tab === "general") next.delete("tab");
  else next.set("tab", tab);
  const query = next.toString();
  const url = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState(window.history.state, "", url);
}

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
  const [tab, setTabState] = React.useState<DraftTabKey>(
    () => readTabFromUrl() ?? "general",
  );
  const setTab = React.useCallback((next: DraftTabKey) => {
    setTabState(next);
    writeTabToUrl(next);
  }, []);
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
    if (draftId === null) {
      // Yangi qoralamada tab ma'nosiz — «Umumiy»ga qaytamiz.
      setTab("general");
      setDraft(null);
      setForm(null);
      return;
    }
    // Mavjud qoralama: URL'dagi tabni tiklaymiz (reload / havola).
    setTabState(readTabFromUrl() ?? "general");
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

  // Orqaga/oldinga tugmasi — brauzerning o'z hodisasidan.
  React.useEffect(() => {
    const onPop = () => setTabState(readTabFromUrl() ?? "general");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
    <ProductDialog
      open={open}
      onClose={onClose}
      title={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="line-clamp-2 break-words">
            {draft?.titleUz?.trim() || "Tovar qo'shish"}
          </span>
          {draft && (
            <span className="inline-flex rounded-full border border-[color:var(--air-line)] px-2.5 py-1 text-[11px] font-medium tracking-normal text-muted-foreground">
              Qoralama #{draft.id}
            </span>
          )}
        </span>
      }
      description={draft ? draft.stageLabel : "Rasm yuklang. AI tovar kartochkasini tayyorlashga yordam beradi."}
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
          {draft && <DraftTabs draft={draft} tab={tab} onTab={setTab} />}
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
          loading={loading || (draftId !== null && draft === null)}
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
          onRegenerate={() =>
            act("regenerate", async () => {
              if (!draft) return;
              apply(await regenerateAiDraft(draft.id));
              toast.success(
                "To'liq qayta generatsiya boshlandi — tayyor bo'lgach Uzum'ga o'zgargan qismi avtomatik ko'chadi.",
              );
            })
          }
          onVerify={() =>
            act("verify", async () => {
              if (!draft) return;
              const fresh = await verifyAiDraftUzum(draft.id);
              apply(fresh);
              if (fresh.uzumPublish?.verified) toast.success("Uzum'da topildi — mos keladi.");
              else toast.error(fresh.uzumPublish?.verifyMessage || "Uzum'da topilmadi.");
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
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px] xl:gap-6">
        <section className="min-w-0 rounded-2xl border border-[color:var(--air-line)] bg-[color:var(--air-card)] p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                {draft === null ? "Tovaringizni rasmdan boshlang" : TAB_TITLE[tab]}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {draft === null ? "Aniq rasmlar — sifatli kartochkaning birinchi qadami." : "Ma'lumotlarni tekshiring va kerak bo'lsa tahrirlang."}
              </p>
            </div>
            {locked && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-[color:var(--ok)]">
                <LockKeyhole className="size-3" /> Tasdiqlangan
              </span>
            )}
          </div>
          <div
            key={draft === null ? "upload" : tab}
            id={draft ? `draft-panel-${tab}` : undefined}
            role={draft ? "tabpanel" : undefined}
            aria-labelledby={draft ? `draft-tab-${tab}` : undefined}
            tabIndex={draft ? 0 : undefined}
            className="min-w-0 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200"
          >
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

        {draft === null ? (
          <NewProductGuide />
        ) : (
          <aside className="min-w-0 rounded-2xl border border-[color:var(--air-line)] bg-[color:var(--air-card)] p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-[color:var(--air-line)] pb-4 text-sm font-semibold">
              <Sparkles className="size-4 text-[color:var(--ok)]" /> Tayyorlanish jarayoni
            </div>
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
        )}
      </div>
    </ProductDialog>
  );
}

function NewProductGuide() {
  const steps = [
    { icon: ImagePlus, title: "Rasmlarni qo'shing", description: "Tovarni old, yon va orqa tomondan ko'rsating." },
    { icon: Sparkles, title: "AI kartochka tayyorlaydi", description: "Nom, tavsif, xususiyatlar va bozor tahlili bir joyda." },
    { icon: CheckCircle2, title: "Tekshirib, tasdiqlang", description: "Natijani tahrirlang va Uzumga joylashga tayyorlang." },
  ];

  return (
    <aside className="min-w-0 space-y-4">
      <div className="rounded-2xl border border-[color:var(--air-line)] bg-[color:var(--air-card)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Uch oddiy qadam</p>
        <ol className="mt-5 space-y-5">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-[color:var(--ok)]">
                <Icon className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-[13px] font-semibold">{index + 1}. {title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex items-start gap-2 border-t border-[color:var(--air-line)] pt-4 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[color:var(--ok)]" />
          Tovar faqat siz tasdiqlagandan keyin joylashga tayyor bo'ladi.
        </div>
      </div>
      <div className="rounded-2xl border border-[color:var(--warn-line)] bg-[color:var(--warn-bg)] p-4 text-[color:var(--warn-ink)]">
        <p className="flex items-center gap-2 text-[13px] font-semibold"><Lightbulb className="size-4" /> Yaxshi natija uchun</p>
        <p className="mt-2 text-xs leading-relaxed">Yorug' fonda, tovar to'liq ko'rinadigan rasm tanlang. O'lcham va komplekt kabi tafsilotlarni izohga yozing.</p>
      </div>
      <p className="px-1 text-xs leading-relaxed text-muted-foreground">Rasm yaratish narxi qoralamada ko'rinadi. OpenAI kaliti ulanmagan bo'lsa, yangi rasm yaratilmaydi, qolgan ma'lumotlar tayyorlanadi.</p>
    </aside>
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
  pricing: "Tan narx va foyda",
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
  loading,
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
  onRegenerate,
  onVerify,
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
  loading: boolean;
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
  onRegenerate: () => void;
  onVerify: () => void;
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
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
          {files.length ? <CheckCircle2 className="size-4 text-[color:var(--ok)]" /> : <ImagePlus className="size-4" />}
          {loading ? "Qoralama ochilmoqda..." : busy === "start" ? "Rasmlar yuklanmoqda..." : files.length ? `${files.length} ta rasm tayyor. Boshlashingiz mumkin.` : "Boshlash uchun kamida 1 ta rasm qo'shing."}
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button type="button" className="air-btn-flat shrink-0" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            type="button"
            className="air-btn-save flex-1 gap-2 sm:flex-none"
            onClick={onStart}
            disabled={loading || !files.length || busy === "start"}
          >
            {busy === "start" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {busy === "start" ? "Yuklanmoqda..." : "Kartochka yaratish"}
            {busy !== "start" && <ArrowRight className="hidden size-4 sm:block" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <span className="text-xs text-muted-foreground" role="status">
        {dirty ? "Saqlanmagan o'zgarishlar bor" : `${draft.progress}% · ${draft.stageLabel}`}
      </span>
      <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto [&>button]:grow sm:[&>button]:grow-0">
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
        {/* "Tahrirlash" QULFNI vaqtincha ochadi — tasdiqlangan
            qoralamada HAR DOIM, joylangan-joylanmaganidan qat'i
            nazar (foydalanuvchi so'rovi: "tasdiqlagan bo'lsa ham
            orqaga qaytarib edit qilish bo'lishi kerak").

            Ikki holat, bitta tugma:
            * Uzum'da turgan tovar — tahrirlab, "Uzumda yangilash"
              bilan HAQIQIY e'longa ko'chiriladi;
            * hali joylanmagan tasdiqlangan qoralama — tahrirlanadi,
              saqlanadi va keyin "Uzumga joylash" bilan chiqadi.
            Ikkalasida ham YANGI tovar tasodifan yaratilmaydi. */}
        {locked && (
          <button
            type="button"
            className="air-btn-flat"
            onClick={onToggleEdit}
            title={
              isLiveOnUzum
                ? "Matn/rasmni o'zgartirib, Uzum'dagi tovarga ko'chirish"
                : "Tasdiqlangan qoralamani qayta tahrirlash"
            }
          >
            <Pencil className="mr-1.5 inline h-3.5 w-3.5" />
            Tahrirlash
          </button>
        )}
        {/* Rasm qayta yasalgan, lekin Uzum'ga ko'chirilmagan.
            Sotuvchi shikoyati: "ba'zi rasmlar generatsiya qilingan,
            lekin uzumga joylanmagan" — u buni faqat Uzum kabinetini
            ochib solishtirib bilardi. Avtomatik yubormaymiz (tirik
            kartochkani qayta moderatsiyaga tushirish — sotuvchining
            qarori), lekin farqni AYTAMIZ. */}
        {locked && isLiveOnUzum && draft?.imagesOutOfSync && (
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-500"
            title="Rasmlar qayta yasalgan. «Tahrirlash» → «Uzumda yangilash» bilan ko'chiring."
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Yangi rasmlar Uzum&apos;ga ko&apos;chirilmagan
          </span>
        )}
        {/* Bizning bazamizdagi holat va Uzum'ning HAQIQIY holati —
            ikki xil manba, ular ajralib qolishi mumkin (server
            qayta ishga tushishi, yoki tovar keyinroq Uzum
            tomonidan o'chirilishi). Sotuvchi bir bosishda
            tekshiradi, natija shu yerda — tugma yonida — qoladi. */}
        {locked && isLiveOnUzum && (
          <button
            type="button"
            className="air-btn-flat"
            onClick={onVerify}
            disabled={busy === "verify"}
            title="Bu tovar Uzum katalogida haqiqatan bor-yo'qligini qayta tekshiradi."
          >
            {spin("verify") ?? <Search className="mr-1.5 inline h-3.5 w-3.5" />}
            Uzumda tekshirish
          </button>
        )}
        {/* Foydalanuvchi so'rovi: "createdagi kabi to'liq AI bilan
            hamma narsani qayta generate qilsin, keyin Uzum'ga
            o'zgargan joylarini avtomatik olib borsin". Ko'rish →
            bozor → matn → xususiyatlar → rasm — HAMMASI qaytadan
            (natija fonda tayyor bo'ladi, xuddi «Yaratish»dagidek —
            `apply()` `progress`ni pasaytiradi, yuqoridagi polling
            o'zi ishga tushadi). Bloklansa yoki hech narsa
            o'zgarmasa Uzum'ga AVTOMATIK yubormaydi (`_run_pipeline_
            and_push_if_live` — backend), qoralama tuzatilgan
            holda qoladi, sotuvchi «Tahrirlash» → «Uzum'da
            yangilash» bilan qo'lda ko'chiradi. */}
        {locked && isLiveOnUzum && (
          <button
            type="button"
            className="air-btn-flat"
            onClick={onRegenerate}
            disabled={busy === "regenerate"}
            title="Ko'rish, bozor, matn, xususiyatlar va rasmni AI bilan qaytadan yaratadi — xuddi yangi tovar yaratilayotgandek."
          >
            {spin("regenerate") ?? <Wand2 className="mr-1.5 inline h-3.5 w-3.5" />}
            AI bilan to&apos;liq qayta yaratish
          </button>
        )}
        {draft.uzumPublish?.verified !== null && draft.uzumPublish?.verified !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              draft.uzumPublish.verified ? "air-ok" : "air-bad",
            )}
            title={draft.uzumPublish.verifyMessage || undefined}
          >
            {draft.uzumPublish.verified ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}
            {draft.uzumPublish.verified ? "Uzum'da tasdiqlandi" : "Uzum'da topilmadi"}
          </span>
        )}
        {/* "Uzum'da yangilash" FAQAT tovar Uzum'da bo'lganda:
            joylanmagan qoralamada bosiladigan narsa yo'q (backend
            `productId` yo'qligi uchun rad etardi). Joylanmaganda
            oddiy "Saqlash" yetadi — u yuqorida turibdi. */}
        {editMode && isLiveOnUzum && (
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
          </>
        )}
        {editMode && (
          <button
            type="button"
            className="air-btn-flat"
            onClick={onToggleEdit}
            title="Tahrirlashni yopadi — qoralama yana tasdiqlangan holatga qaytadi."
          >
            Tahrirlashni yakunlash
          </button>
        )}
        {/*
          Pastda alohida "Yopish" tugmasi YO'Q ENDI: panelning
          burchagida (AirSlider) doim ko'rinadigan × xuddi shu
          ishni qiladi — Bitrix namunasidagi kabi. Ikkalasi bir
          xil ishni qilsa, biri ortiqcha; qoralama bilan ishlashda
          bu qatorda faqat HARAKAT tugmalari (Saqlash, Nusxalash,
          Tasdiqlash, Joylash...) qolishi kerak, chiqish yo'li emas.
        */}
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
          "ml-auto flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs transition-colors",
          confirmDelete
            ? "air-bad font-medium"
            : "text-[color:var(--air-label)] hover:text-[color:var(--air-head)]",
        )}
      >
        <Trash2 className="h-3 w-3" />
        {confirmDelete ? "O'chirishni tasdiqlash" : "Qoralamani o'chirish"}
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
  // Uzum'ning O'Z bosqich chizig'iga o'xshab (kategoriya →
  // ma'lumot → yakunlash) — sotuvchi HAR safar bitta xira "43%"
  // o'rniga QAYSI faza tugagani, qaysi ketayotgani, qaysi hali
  // kelmaganini ko'radi. Chiziq NATIJADAN keyin ham qoladi —
  // muvaffaqiyatsiz urinish qaysi fazada to'xtaganini keyin
  // qaytib ochganda ham ko'rsatib turadi.
  return (
    <>
        <div className="w-full space-y-1.5">
          <div className="air-stages" role="list">
            {PUBLISH_PHASES.map((phase) => {
              const state = publishPhaseState(phase, draft.uzumPublish, publishing);
              return (
                <div
                  key={phase.key}
                  role="listitem"
                  data-state={state}
                  data-phase={phase.key}
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
