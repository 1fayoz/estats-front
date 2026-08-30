"use client";

import { AI_STAGES, activeIndex, doneIndex } from "@/features/products-ai/stages";
import type { AiDraft } from "@/lib/types";

/**
 * Bosqichlar chizig'i — modal sarlavhasi ostida.
 *
 * Qoralama hali yo'q bo'lsa (`draft === null`) birinchi qadam
 * faol ko'rinadi: sotuvchi rasm tashlash — ETTITADAN BIRINCHISI
 * ekanini tugmani bosishdan oldin ko'radi.
 */
export function StageStrip({ draft }: { draft: AiDraft | null }) {
  const done = draft ? doneIndex(draft) : -1;
  const active = draft ? activeIndex(draft) : 0;
  const failed = draft?.stage === "failed" || Boolean(draft?.error);

  return (
    <div className="air-stages" role="list">
      {AI_STAGES.map((stage, index) => {
        // Yiqilgan qoralamada to'xtagan joy QIZIL: "shu yergacha
        // yetdi" degani, va aynan shu yerdan davom ettiriladi.
        const state =
          index <= done
            ? "done"
            : failed && index === done + 1
              ? "failed"
              : index === active
                ? "active"
                : "next";
        return (
          <div key={stage.key} role="listitem" data-state={state} className="air-stage" title={stage.label}>
            {stage.short}
          </div>
        );
      })}
    </div>
  );
}
