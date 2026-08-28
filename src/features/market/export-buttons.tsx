"use client";

import * as React from "react";
import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MARKET_BASE } from "@/lib/market";

/**
 * Hisobotni yuklab olish.
 *
 * ENG MUHIM QOIDA: fayl EKRANDAGI ma'lumotni beradi. Foydalanuvchi
 * "30 kun, Kiyim" ni tanlagan bo'lsa, faylda ham aynan shu bo'ladi —
 * shuning uchun bu yerda joriy filtrlar so'rovga o'sha nom bilan
 * uzatiladi va backend ular ustida jadval bilan BIR XIL so'rovni
 * yuritadi.
 *
 * Havola oddiy `<a download>` EMAS, `fetch` + `blob`: server faylni
 * oqim bilan beradi va `Content-Disposition` sarlavhasi orqali nom
 * qo'yadi; xato bo'lsa (masalan 503 — Excel kutubxonasi yo'q)
 * foydalanuvchi buzilgan fayl emas, tushunarli xabar ko'radi.
 */
export function ExportButtons({
  report,
  days,
  root,
}: {
  report: "niches" | "products" | "shops" | "keywords";
  days: number;
  root?: number;
}) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function download(format: "csv" | "xlsx") {
    setBusy(format);
    setError(null);
    try {
      const query = new URLSearchParams({ days: String(days) });
      if (root) query.set("root", String(root));
      const response = await fetch(`${MARKET_BASE}/exports/${report}.${format}?${query}`);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail ?? `Yuklab bo'lmadi (${response.status})`);
      }
      const blob = await response.blob();
      const name =
        response.headers
          .get("Content-Disposition")
          ?.match(/filename="([^"]+)"/)?.[1] ?? `estats-${report}.${format}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      // Bo'shatish SHART: blob URL sahifa yopilguncha xotirada
      // qoladi va bir necha eksportdan keyin o'nlab megabayt yeydi.
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklab bo'lmadi");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => download("csv")} disabled={busy !== null}>
        <Download className="h-3.5 w-3.5" />
        {busy === "csv" ? "Tayyorlanmoqda…" : "CSV"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => download("xlsx")} disabled={busy !== null}>
        <FileSpreadsheet className="h-3.5 w-3.5" />
        {busy === "xlsx" ? "Tayyorlanmoqda…" : "Excel"}
      </Button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
