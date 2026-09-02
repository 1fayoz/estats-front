"use client";

import * as React from "react";
import { Check, ChevronRight, Link2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import {
  ApiError,
  fetchAiCategories,
  setAiDraftCategory,
  setAiDraftCategoryFromUrl,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiCategoryNode, AiCategoryPick, AiDraft } from "@/lib/types";

/**
 * Uzum turkumini tanlash.
 *
 * NEGA BU YERDA, joylash paytida emas. Ilgari turkum FAQAT
 * Uzumga joylash paytida, brauzer ichida aniqlanardi: sotuvchi
 * tasdiqlashdan oldin qaysi turkumga tushishini KO'RMASDI va
 * to'g'irlay olmasdi — xato joylash yarmida chiqardi, o'sha
 * paytda esa tuzatish ancha qimmat.
 *
 * Uch yo'l, uchalasi ham sotuvchi uchun bir xil oynada:
 *
 *   1. AI taxmini — bozor tahlilidan o'zi keladi, hech nima
 *      bosish shart emas;
 *   2. qidiruv — nom bo'yicha, butun daraxt bo'ylab;
 *   3. uzum.uz havolasi — "mana shunga o'xshash": eng ishonchli,
 *      chunki o'sha tovarni Uzum'ning O'ZI tasniflagan.
 *
 * **Dizayn — panelning O'Z tilida** (`air-label`/`air-input`/
 * `air-btn-flat`), shadcn Card/Input EMAS: bu blok allaqachon
 * bitta `.air-card` ICHIDA turadi (`product-modal.tsx`), begona
 * uslub "karta ichida karta" ko'rinishini yasaydi.
 */
export function CategoryPicker({
  draft,
  locked,
  onDraft,
}: {
  draft: AiDraft;
  /** Tasdiqlangan qoralamada turkum o'zgarmaydi. */
  locked: boolean;
  onDraft: (draft: AiDraft) => void;
}) {
  const pick: AiCategoryPick | null = draft.category;
  const [open, setOpen] = React.useState(false);

  return (
    <div className="mb-5 border-b pb-5 [border-color:var(--air-line)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="air-label mb-0">Uzum turkumi</span>
        {!locked && !open && (
          <button type="button" className="air-btn-flat h-auto px-2 py-1" onClick={() => setOpen(true)}>
            {pick?.id ? "O'zgartirish" : "Tanlash"}
          </button>
        )}
      </div>

      {open ? (
        <CategoryEditor
          draft={draft}
          onDraft={(next) => {
            onDraft(next);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      ) : (
        <CategoryTrail pick={pick} />
      )}
    </div>
  );
}

const SOURCE_LABEL: Record<string, string> = {
  ai: "bozor tahlilidan",
  manual: "o'zingiz tanladingiz",
  product: "uzum.uz havolasidan",
};

function CategoryTrail({ pick }: { pick: AiCategoryPick | null }) {
  if (!pick?.id) {
    return (
      <p className="air-warn text-sm">Tanlanmagan — Uzumga joylash uchun turkum shart.</p>
    );
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm">
        {pick.path.map((node, i) => (
          <React.Fragment key={node.id}>
            {i > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 [color:var(--air-label)]" />
            )}
            <span
              className={i === pick.path.length - 1 ? "font-medium" : "[color:var(--air-label)]"}
            >
              {node.title}
            </span>
          </React.Fragment>
        ))}
      </div>
      {pick.source && (
        <div className="mt-1 text-xs [color:var(--air-label)]">
          {SOURCE_LABEL[pick.source] || pick.source}
        </div>
      )}
    </div>
  );
}

function CategoryEditor({
  draft,
  onDraft,
  onCancel,
}: {
  draft: AiDraft;
  onDraft: (draft: AiDraft) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = React.useState(false);

  const apply = async (run: () => Promise<AiDraft>) => {
    setSaving(true);
    try {
      onDraft(await run());
      toast.success("Turkum saqlandi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Turkumni saqlab bo'lmadi");
      setSaving(false);
    }
  };

  return (
    <div className={cn("space-y-3", saving && "pointer-events-none opacity-60")}>
      <FromUrl onSubmit={(url) => apply(() => setAiDraftCategoryFromUrl(draft.id, url))} />
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide [color:var(--air-label)]">
        <div className="h-px flex-1 [background:var(--air-line)]" />
        yoki qidiring
        <div className="h-px flex-1 [background:var(--air-line)]" />
      </div>
      <TreeBrowser
        currentId={draft.category?.id ?? null}
        onPick={(node) => apply(() => setAiDraftCategory(draft.id, node.id))}
      />
      <button type="button" className="air-btn-flat h-auto px-2 py-1" onClick={onCancel}>
        Bekor qilish
      </button>
    </div>
  );
}

/**
 * "Mana shunga o'xshash" — tayyor uzum.uz tovaridan turkum.
 *
 * Sotuvchi uchun eng tabiiy yo'l: u o'z tovariga o'xshash
 * kartochkani allaqachon ko'rgan bo'ladi. Backend havoladan
 * raqamni ajratib, o'sha tovarning turkumini SOTUVCHI daraxtida
 * qidirib topadi.
 */
function FromUrl({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [value, setValue] = React.useState("");
  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 [color:var(--air-label)]" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
            }}
            placeholder="O'xshash tovar havolasi yoki tovar raqami"
            className="air-input pl-9 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={!value.trim()}
          onClick={() => onSubmit(value.trim())}
          className="air-btn-flat shrink-0"
        >
          Olish
        </button>
      </div>
      <p className="mt-1.5 text-xs [color:var(--air-label)]">
        O&apos;sha tovarni Uzumning o&apos;zi tasniflagan — eng ishonchli yo&apos;l.
      </p>
    </div>
  );
}

/**
 * Daraxt bo'ylab yurish va qidiruv.
 *
 * Qidiruvda faqat tovar QO'YISH MUMKIN bo'lgan tugunlar chiqadi
 * (backend shunday filtrlaydi) — oraliq tugunni ko'rsatish
 * sotuvchini bekorga adashtiradi. Daraxt bo'ylab yurganda esa
 * oraliq tugun ham ko'rinadi, chunki undan ichkariga tushish
 * kerak; unday tugun bosilganda tanlanmaydi, ochiladi.
 */
function TreeBrowser({
  currentId,
  onPick,
}: {
  currentId: number | null;
  onPick: (node: AiCategoryNode) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [trail, setTrail] = React.useState<AiCategoryNode[]>([]);
  const [rows, setRows] = React.useState<AiCategoryNode[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState<string | null>(null);

  const text = query.trim();
  const parentId = trail.length ? trail[trail.length - 1].id : undefined;

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(null);
    // Qidiruvda kechikish: har harfda so'rov yuborish keraksiz.
    const timer = setTimeout(
      () => {
        const params = text.length >= 2 ? { q: text } : { parentId };
        fetchAiCategories(params)
          .then((data) => {
            if (alive) setRows(data);
          })
          .catch((err) => {
            if (alive) setFailed(err instanceof ApiError ? err.message : "Yuklanmadi");
          })
          .finally(() => {
            if (alive) setLoading(false);
          });
      },
      text.length >= 2 ? 250 : 0,
    );
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // `parentId` — primitiv: `trail` massivini bog'liqlikka qo'ysak
    // har renderda yangi havola bo'lib cheksiz halqa bo'lardi.
  }, [text, parentId]);

  const searching = text.length >= 2;

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 [color:var(--air-label)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Turkum nomi bo'yicha qidirish..."
          className="air-input pl-9 text-sm"
        />
      </div>

      {!searching && (
        <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs">
          <button
            type="button"
            onClick={() => setTrail([])}
            className={cn(
              "rounded px-1.5 py-0.5",
              trail.length === 0 ? "font-medium" : "[color:var(--air-label)]",
            )}
          >
            Barcha turkumlar
          </button>
          {trail.map((node, i) => (
            <React.Fragment key={node.id}>
              <ChevronRight className="h-3 w-3 shrink-0 [color:var(--air-label)]" />
              <button
                type="button"
                onClick={() => setTrail(trail.slice(0, i + 1))}
                className={cn(
                  "rounded px-1.5 py-0.5",
                  i === trail.length - 1 ? "font-medium" : "[color:var(--air-label)]",
                )}
              >
                {node.title}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="mt-2 max-h-64 overflow-y-auto rounded [border:1px_solid_var(--air-ctl-line)]">
        {loading && (
          <div className="flex items-center justify-center gap-2 p-4 text-xs [color:var(--air-label)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> yuklanmoqda
          </div>
        )}
        {!loading && failed && <div className="air-bad p-4 text-xs">{failed}</div>}
        {!loading && !failed && rows.length === 0 && (
          <div className="p-4 text-xs [color:var(--air-label)]">
            {searching
              ? "Bunday turkum topilmadi."
              : "Turkumlar ro'yxati bo'sh — daraxt hali ko'chirilmagan bo'lishi mumkin."}
          </div>
        )}
        {!loading &&
          !failed &&
          rows.map((node) => (
            <CategoryRow
              key={node.id}
              node={node}
              searching={searching}
              current={node.id === currentId}
              onOpen={() => {
                setQuery("");
                setTrail((prev) => [...prev, node]);
              }}
              onPick={() => onPick(node)}
            />
          ))}
      </div>
    </div>
  );
}

function CategoryRow({
  node,
  searching,
  current,
  onOpen,
  onPick,
}: {
  node: AiCategoryNode;
  searching: boolean;
  current: boolean;
  onOpen: () => void;
  onPick: () => void;
}) {
  // Ichkarisi bor tugun ochiladi, tanlanmaydi — Uzum unga tovar
  // qo'yishga ruxsat bermaydi. Qidiruvda esa hammasi `canUse`
  // bo'lgani uchun to'g'ridan-to'g'ri tanlanadi.
  const selectable = node.canUse && (searching || !node.hasChildren);

  return (
    <button
      type="button"
      onClick={selectable ? onPick : onOpen}
      className={cn(
        "flex w-full items-center gap-2 border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-[color-mix(in_oklab,var(--air-head)_6%,transparent)] [border-color:var(--air-line)]",
        current && "bg-[color-mix(in_oklab,var(--primary)_8%,transparent)]",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate">{node.title}</span>
        {searching && node.fullTitle && (
          <span className="mt-0.5 block truncate text-xs [color:var(--air-label)]">
            {node.fullTitle}
          </span>
        )}
      </span>
      {current && <Check className="h-4 w-4 shrink-0 text-primary" />}
      {!selectable && <ChevronRight className="h-4 w-4 shrink-0 [color:var(--air-label)]" />}
    </button>
  );
}
