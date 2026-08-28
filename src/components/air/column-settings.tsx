"use client";

import * as React from "react";
import { RotateCcw, Settings2 } from "lucide-react";

import { AirModal } from "@/components/air/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Jadval ustunlarini tanlash — Bitrix24 dagi «Настройка списка».
 *
 * Tuzilishi o'sha: yuqorida maydon bo'yicha qidiruv, o'rtada
 * TO'RT USTUNLI katakchalar to'ri, pastda «hammasini tanlash»,
 * yashil «Qo'llash», «Bekor qilish» va o'ngda «zavod holatiga».
 *
 * NEGA BU KERAK. Nisha jadvalida o'n bitta ustun bor va ularning
 * hammasi bir vaqtda hech kimga kerak emas: kimdir narx va
 * raqobatni ko'radi, kimdir oborotni. Ustunlarni yashirish —
 * gorizontal aylantirishdan qutulishning yagona yo'li.
 *
 * Tanlov `localStorage` da, jadval kaliti bo'yicha: bu ko'rish
 * qulayligi, hisobning sozlamasi emas.
 */
export type ColumnOption = { key: string; label: string; group?: string };

export function useColumnPrefs(
  tableKey: string,
  options: ColumnOption[],
  defaults?: string[],
): {
  visible: Set<string>;
  setVisible: (next: Set<string>) => void;
  reset: () => void;
} {
  const defaultsKey = (defaults ?? options.map((o) => o.key)).join(",");
  const initial = React.useMemo(
    // Shu yerda ham bog'liqlik MATN: massiv har renderda yangi
    // bo'lgani uchun `useMemo` hech qachon eslab qololmasdi.
    () => new Set(defaultsKey.split(",")),
    [defaultsKey],
  );
  const [visible, setVisibleState] = React.useState<Set<string>>(initial);

  // ⚠️ BOG'LIQLIK — MATN, massiv EMAS.
  //
  // `options` sahifada har renderda qaytadan yasaladi (u `columns`
  // dan olinadi, `columns` esa oddiy massiv literali). Massivni
  // bog'liqlikka qo'yish CHEKSIZ HALQA yasaydi: effekt ishlaydi →
  // `setState` → render → yangi `options` → effekt yana ishlaydi.
  // Brauzer "Maximum update depth exceeded" deb qichqiradi va
  // sahifa muzlab qoladi. O'zgarmas matn kalit bu halqani uzadi.
  const optionsKey = options.map((o) => o.key).join(",");

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`estats-cols:${tableKey}`);
      if (!raw) return;
      const saved: string[] = JSON.parse(raw);
      // Saqlangan ro'yxatdagi endi mavjud bo'lmagan ustun
      // TASHLAB YUBORILADI: aks holda jadvalga o'zgarish
      // kiritilganda eski sozlama uni ko'rinmas qilib qo'yardi.
      const known = new Set(optionsKey.split(","));
      setVisibleState(new Set(saved.filter((k) => known.has(k))));
    } catch {
      /* buzilgan sozlama — zavod holati ishlaydi */
    }
  }, [tableKey, optionsKey]);

  const setVisible = React.useCallback(
    (next: Set<string>) => {
      setVisibleState(next);
      try {
        window.localStorage.setItem(`estats-cols:${tableKey}`, JSON.stringify([...next]));
      } catch {
        /* yozib bo'lmasa ham shu seansda ishlaydi */
      }
    },
    [tableKey],
  );

  const reset = React.useCallback(() => {
    setVisibleState(initial);
    try {
      window.localStorage.removeItem(`estats-cols:${tableKey}`);
    } catch {
      /* muhim emas */
    }
  }, [initial, tableKey]);

  return { visible, setVisible, reset };
}

export function ColumnSettingsButton({
  title,
  options,
  visible,
  onApply,
  onReset,
}: {
  title: string;
  options: ColumnOption[];
  visible: Set<string>;
  onApply: (next: Set<string>) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Set<string>>(visible);
  const [query, setQuery] = React.useState("");

  // Oyna har ochilganda joriy holatdan boshlanadi: yopib
  // qo'yilgan tahrir keyingi safar "yarim tanlangan" bo'lib
  // qaytmasligi kerak.
  React.useEffect(() => {
    if (open) {
      setDraft(new Set(visible));
      setQuery("");
    }
  }, [open, visible]);

  const groups = React.useMemo(() => {
    const filtered = options.filter((o) =>
      o.label.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const map = new Map<string, ColumnOption[]>();
    for (const option of filtered) {
      const group = option.group ?? "Ustunlar";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(option);
    }
    return [...map.entries()];
  }, [options, query]);

  const allChecked = draft.size === options.length;

  function toggle(key: string) {
    const next = new Set(draft);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setDraft(next);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Ustunlarni sozlash"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Ustunlar
        <span className="ml-1 text-[10px] text-muted-foreground">
          {visible.size}/{options.length}
        </span>
      </Button>

      <AirModal
        open={open}
        onClose={() => setOpen(false)}
        title={`«${title}» ro'yxati sozlamasi`}
        footer={
          <>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={() =>
                  setDraft(allChecked ? new Set() : new Set(options.map((o) => o.key)))
                }
                className="h-3.5 w-3.5 accent-[color:var(--primary)]"
              />
              hammasini tanlash
            </label>
            <div className="mx-auto flex items-center gap-2">
              <Button
                size="sm"
                className="bg-[#00904d] text-white hover:bg-[#00a457]"
                onClick={() => {
                  // Bitta ham ustun qolmasa jadval bo'sh ekran
                  // bo'lib chiqadi — birinchisi majburan qoladi.
                  onApply(draft.size ? draft : new Set([options[0].key]));
                  setOpen(false);
                }}
              >
                Qo&apos;llash
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Bekor qilish
              </Button>
            </div>
            <button
              type="button"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> zavod holatiga
            </button>
          </>
        }
      >
        <Input
          placeholder="Maydonlar bo'yicha qidirish"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4 max-w-sm"
        />
        {groups.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Bunday maydon topilmadi.
          </div>
        )}
        {groups.map(([group, items]) => (
          <div key={group} className="mb-4">
            <div className="mb-2 text-sm font-medium">{group}</div>
            <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((option) => {
                const checked = draft.has(option.key);
                return (
                  <label
                    key={option.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      checked ? "bg-primary/10" : "hover:bg-muted",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(option.key)}
                      className="h-3.5 w-3.5 accent-[color:var(--primary)]"
                    />
                    <span className="truncate">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </AirModal>
    </>
  );
}
