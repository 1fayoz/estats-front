"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

import styles from "./workspace.module.css";

/**
 * Joylash kategoriyada to'xtadi (`category_unresolved`) — DARAXTNING HAR
 * DARAJASI shu yerda, o'zgartirish mumkin. Xato ko'pincha ENG OXIRGI emas,
 * O'RTADAGI darajada bo'ladi (masalan "Ayollar aksessuarlari" ishonch bilan
 * tanlanadi-yu, aslida boshqa shoxda kerak) — shuning uchun istalgan daraja
 * o'zgartiriladi. O'zgartirilgan darajadan KEYINGISI ko'rsatilmaydi: ular
 * eski (noto'g'ri) shoxning bolalari sifatida ushlangan; «Davom etish» faqat
 * birinchi o'zgargan darajagacha yuboradi va avtomatika qolganini YANGI
 * shoxdan qayta topadi.
 *
 * 1-daraja Uzum'da QIDIRUV maydoni, ro'yxat emas — shuning uchun erkin matn.
 */
export function CategoryFix({
  draft,
  busy,
  onPublish,
}: {
  draft: AiDraft;
  busy: boolean;
  onPublish: (categoryManualPath: string[]) => void;
}) {
  const levels = draft.uzumPublish?.categoryLevels ?? [];
  const [picks, setPicks] = React.useState<string[]>(() => levels.map((l) => l.chosen));
  const signature = levels.map((l) => `${l.depth}:${l.chosen}`).join("|");
  React.useEffect(() => {
    setPicks(levels.map((l) => l.chosen));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  if (!levels.length) return null;

  return (
    <div className={cn(styles.card, "space-y-3 p-4")}>
      <p className="text-sm font-semibold">Kategoriya avtomatik topilmadi — yo&apos;lni o&apos;zingiz to&apos;g&apos;rilang</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {levels.map((level, i) => {
          const priorChanged = picks.slice(0, i).some((pick, j) => pick !== levels[j]?.chosen);
          if (priorChanged) return null;
          const changed = picks[i] !== level.chosen;
          return (
            <React.Fragment key={level.depth}>
              {i > 0 && <span className="text-[11px] text-[color:var(--air-label)]">→</span>}
              {i === 0 ? (
                <input
                  type="text"
                  className={cn("air-input h-9 w-auto max-w-[240px] rounded-lg text-xs", changed && "border-[color:var(--warn)]")}
                  value={picks[i] ?? level.chosen}
                  placeholder="Toifa nomi…"
                  onChange={(e) => setPicks((prev) => [...prev.slice(0, i), e.target.value])}
                />
              ) : (
                <select
                  className={cn("air-input h-9 w-auto max-w-[240px] rounded-lg text-xs", changed && "border-[color:var(--warn)]")}
                  value={picks[i] ?? level.chosen}
                  onChange={(e) => setPicks((prev) => [...prev.slice(0, i), e.target.value])}
                >
                  {level.candidates.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className={styles.fieldNote}>
        1-maydon — erkin qidiruv so&apos;zi (boshqa toifa uchun butunlay boshqa so&apos;z yozing); qolganlari — Uzum&apos;ning shu daraja
        uchun ro&apos;yxati. Darajani o&apos;zgartirsangiz, undan keyingisi yangi shoxdan qayta topiladi.
      </p>
      <button
        type="button"
        className={cn(styles.btn, styles.btnPrimary)}
        disabled={busy}
        onClick={() => {
          const changedAt = picks.findIndex((pick, j) => pick !== levels[j]?.chosen);
          onPublish(changedAt === -1 ? picks : picks.slice(0, changedAt + 1));
        }}
      >
        Shu yo&apos;l bilan davom etish
      </button>
    </div>
  );
}
