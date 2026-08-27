import type { PnlReport } from "@/lib/types";

const HEADERS = [
  "Tovar",
  "SKU",
  "Kirim (dona)",
  "Kirim summasi",
  "Sotildi (dona)",
  "Qaytdi",
  "Savdo summasi",
  "Komissiya",
  "Yetkazib berish",
  "Uzum to'lovi",
  "Tan narx (FIFO)",
  "Foyda/zarar",
  "Marja %",
  "Qoldiq (dona)",
  "Qoldiq qiymati",
  "Tan narxsiz dona",
];

/** Excel opens UTF-8 CSV correctly only with a BOM, and splits on `;` in uz/ru locales. */
function toCsv(report: PnlReport): string {
  const lines = [HEADERS.join(";")];
  for (const r of report.rows) {
    lines.push(
      [
        `"${r.title.replace(/"/g, '""')}"`,
        r.skuCode ?? "",
        r.intakeQuantity,
        Math.round(r.intakeCost),
        r.soldQuantity,
        r.returnedQuantity,
        Math.round(r.gross),
        Math.round(r.commission),
        Math.round(r.logistics),
        Math.round(r.revenue),
        Math.round(r.cogs),
        Math.round(r.profit),
        r.margin.toFixed(1),
        r.onHand,
        Math.round(r.stockValue),
        r.uncoveredQuantity,
      ].join(";")
    );
  }
  const t = report.totals;
  lines.push(
    [
      '"JAMI"',
      "",
      t.intakeQuantity,
      Math.round(t.intakeCost),
      t.soldQuantity,
      t.returnedQuantity,
      Math.round(t.gross),
      Math.round(t.commission),
      Math.round(t.logistics),
      Math.round(t.revenue),
      Math.round(t.cogs),
      Math.round(t.profit),
      t.margin.toFixed(1),
      t.onHand,
      Math.round(t.stockValue),
      t.uncoveredQuantity,
    ].join(";")
  );
  return `﻿${lines.join("\n")}`;
}

export function downloadPnlCsv(report: PnlReport): void {
  const blob = new Blob([toCsv(report)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `foyda-zarar_${report.from}_${report.to}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
