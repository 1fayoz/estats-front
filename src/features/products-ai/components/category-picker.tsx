"use client";

import * as React from "react";
import { Check, ChevronRight, Link2, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
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
 * Daraxt bo'ylab darajama-daraja yurish ham bor — sotuvchi
 * qidiruvda topa olmasa yoki qo'shni turkumni ko'rmoqchi bo'lsa.
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

  if (!open) {
    return (
      <CategorySummary
        pick={pick}
        locked={locked}
        onEdit={() => setOpen(true)}
      />
    );
  }

  return (
    <CategoryEditor
      draft={draft}
      onDraft={(next) => {
        onDraft(next);
        setOpen(false);
      }}
      onCancel={() => setOpen(false)}
    />
  );
}

const SOURCE_LABEL: Record<string, string> = {
  ai: "bozor tahlilidan",
  manual: "o'zingiz tanladingiz",
  product: "uzum.uz havolasidan",
};

function CategorySummary({
  pick,
  locked,
  onEdit,
}: {
  pick: AiCategoryPick | null;
  locked: boolean;
  onEdit: () => void;
}) {
  const chosen = Boolean(pick?.id);
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        chosen ? "border-border" : "border-amber-500/50 bg-amber-500/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Uzum turkumi
          </div>
          {chosen ? (
            <>
              <div className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm">
                {(pick?.path || []).map((node, i) => (
                  <React.Fragment key={node.id}>
                    {i > 0 && (
                      <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={
                        i === (pick?.path.length || 0) - 1
                          ? "font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {node.title}
                    </span>
                  </React.Fragment>
                ))}
              </div>
              {pick?.source && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {SOURCE_LABEL[pick.source] || pick.source}
                </div>
              )}
            </>
          ) : (
            <div className="mt-1 text-sm text-amber-700 dark:text-amber-500">
              Tanlanmagan — Uzumga joylash uchun turkum shart.
            </div>
          )}
        </div>
        {!locked && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted"
          >
            {chosen ? "O'zgartirish" : "Tanlash"}
          </button>
        )}
      </div>
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Turkumni tanlash
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Yopish"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className={cn("space-y-4 p-3", saving && "pointer-events-none opacity-60")}>
        <FromUrl onSubmit={(url) => apply(() => setAiDraftCategoryFromUrl(draft.id, url))} />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">yoki</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <TreeBrowser
          currentId={draft.category?.id ?? null}
          onPick={(node) => apply(() => setAiDraftCategory(draft.id, node.id))}
        />
      </div>
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
      <div className="mb-1.5 text-xs font-medium">O&apos;xshash tovar havolasi</div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
            }}
            placeholder="uzum.uz/uz/product/... yoki tovar raqami"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={!value.trim()}
          onClick={() => onSubmit(value.trim())}
          className="shrink-0 rounded-md border px-3 text-xs font-medium hover:bg-muted disabled:opacity-40"
        >
          Olish
        </button>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        O&apos;sha tovarni Uzumning o&apos;zi tasniflagan — eng ishonchli yo&apos;l.
      </div>
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
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Turkum nomi bo'yicha qidirish..."
          className="h-9 pl-8 text-sm"
        />
      </div>

      {!searching && (
        <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs">
          <button
            type="button"
            onClick={() => setTrail([])}
            className={cn(
              "rounded px-1.5 py-0.5 hover:bg-muted",
              trail.length === 0 ? "font-medium" : "text-muted-foreground",
            )}
          >
            Barcha turkumlar
          </button>
          {trail.map((node, i) => (
            <React.Fragment key={node.id}>
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setTrail(trail.slice(0, i + 1))}
                className={cn(
                  "rounded px-1.5 py-0.5 hover:bg-muted",
                  i === trail.length - 1 ? "font-medium" : "text-muted-foreground",
                )}
              >
                {node.title}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="mt-2 max-h-64 overflow-y-auto rounded-md border">
        {loading && (
          <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> yuklanmoqda
          </div>
        )}
        {!loading && failed && (
          <div className="p-4 text-xs text-destructive">{failed}</div>
        )}
        {!loading && !failed && rows.length === 0 && (
          <div className="p-4 text-xs text-muted-foreground">
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
        "flex w-full items-center gap-2 border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted/60",
        current && "bg-primary/5",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate">{node.title}</span>
        {searching && node.fullTitle && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {node.fullTitle}
          </span>
        )}
      </span>
      {current && <Check className="h-4 w-4 shrink-0 text-primary" />}
      {!selectable && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </button>
  );
}
