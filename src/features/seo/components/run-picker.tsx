"use client";

import { History, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SeoRun } from "@/lib/types";
import styles from "@/app/(dashboard)/seo/[id]/seo-detail.module.css";

export function RunPicker({
  runs,
  activeId,
  onPick,
}: {
  runs: SeoRun[];
  activeId: number | null;
  onPick: (id: number | null) => void;
}) {
  if (runs.length < 2) return null;

  const latest = runs[0];
  const shown = activeId === null ? latest : runs.find((run) => run.id === activeId) ?? latest;

  return (
    <section className={styles.history} aria-labelledby="seo-history-title">
      <div className={styles.historyHeading}>
        <span className={styles.historyIcon}><History aria-hidden="true" /></span>
        <div>
          <h2 id="seo-history-title">Tahlillar tarixi</h2>
          <p>Natijalarni vaqt bo&apos;yicha solishtiring</p>
        </div>
        {activeId !== null ? <span className={styles.archiveNote}>Eski natija ko&apos;rsatilmoqda</span> : null}
      </div>

      <div className={styles.runScroller}>
        {runs.map((run, index) => {
          const isShown = run.id === shown.id;
          const previous = runs[index + 1];
          const delta = previous ? run.score - previous.score : null;
          return (
            <button
              key={run.id}
              type="button"
              onClick={() => onPick(index === 0 ? null : run.id)}
              className={cn(styles.run, isShown && styles.runActive)}
              aria-pressed={isShown}
            >
              <span className={styles.runTop}>
                <strong>{run.score}</strong>
                {delta !== null && delta !== 0 ? (
                  <span className={delta > 0 ? styles.deltaUp : styles.deltaDown}>
                    {delta > 0 ? <TrendingUp aria-hidden="true" /> : <TrendingDown aria-hidden="true" />}
                    {Math.abs(delta)}
                  </span>
                ) : <span className={styles.deltaEmpty}>—</span>}
              </span>
              <span className={styles.runDate}>
                {formatRunDate(run.analyzedAt)}
              </span>
              {index === 0 ? <span className={styles.latest}>Oxirgi</span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function formatRunDate(value: string | null) {
  if (!value) return "Sana yo'q";
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}
