"use client";

import * as React from "react";

import { ApiError, fetchAiDrafts } from "@/lib/api";
import type { AiDraft, AiDraftRow } from "@/lib/types";

/** Ishlayotgan qoralama holati shuncha vaqtda bir so'raladi. */
const POLL_MS = 5000;

/**
 * Ombor sahifasidagi AI qoralamalari ro'yxati.
 *
 * Ro'yxat quvur ishlayotgandagina so'rab turiladi. Doimiy
 * so'rash bekor: qoralamalar kuniga bir-ikki marta yasaladi,
 * qolgan vaqtda ro'yxat o'zgarmaydi.
 *
 * `enabled` — ruxsat. `products_ai.view` bo'lmagan odam uchun
 * so'rov umuman yuborilmaydi: 403 ni yutib yuborgandan ko'ra
 * so'ramagan yaxshi.
 */
export function useAiDrafts(enabled: boolean) {
  const [rows, setRows] = React.useState<AiDraftRow[]>([]);
  const [loading, setLoading] = React.useState(enabled);

  const reload = React.useCallback(async () => {
    if (!enabled) return;
    try {
      setRows(await fetchAiDrafts());
    } catch (err) {
      // 403 — ruxsat yo'q; boshqa xato ham sahifani buzmasligi
      // kerak: qoralamalar omborning ASOSIY ishi emas.
      if (!(err instanceof ApiError)) throw err;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const running = rows.some((row) => row.progress < 100 && !row.error);
  React.useEffect(() => {
    if (!enabled || !running) return;
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, running, reload]);

  /** Modal qaytargan yangi holatni ro'yxatga qo'yadi. */
  const upsert = React.useCallback((draft: AiDraft | AiDraftRow) => {
    setRows((prev) =>
      prev.some((row) => row.id === draft.id)
        ? prev.map((row) => (row.id === draft.id ? { ...row, ...draft } : row))
        : [draft, ...prev],
    );
  }, []);

  const remove = React.useCallback((id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  // Nashr etilgan qoralama "ishlayotgan qator"dan chiqadi — u endi
  // tovarning o'zi orqali (Ombor jadvali, "Tahrirlash") boshqariladi.
  // Holat ATAYLAB to'liq saqlanadi (`rows`, filtrlash faqat
  // ko'rsatishda) — masalan `upsert` hali ham to'g'ri ishlaydi.
  const visibleRows = React.useMemo(() => rows.filter((row) => !row.uzumPublished), [rows]);

  return { rows: visibleRows, loading, reload, upsert, remove };
}
