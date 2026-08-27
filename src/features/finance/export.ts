import type { FinanceReport } from "./types";

const HEADERS = [
  "Sana",
  "Buyurtma",
  "Dona",
  "Yalpi savdo",
  "Komissiya",
  "Komissiya %",
  "Logistika",
  "Boshqa yechim",
  "Sof to'lov",
  "Qaytarish",
];

/** Build a spreadsheet-friendly CSV (`;` separated for uz/ru Excel locales). */
export function reportToCsv(report: FinanceReport): string {
  const lines = [HEADERS.join(";")];
  for (const d of report.daily) {
    lines.push(
      [
        d.date,
        d.orders,
        d.units,
        d.gross,
        d.commission,
        d.commissionRate.toFixed(1),
        d.logistics,
        d.expenses,
        d.net,
        d.returns,
      ].join(";")
    );
  }
  const t = report.totals;
  lines.push(
    ["JAMI", t.orders, t.units, t.gross, t.commission, t.commissionRate.toFixed(1), t.logistics, t.expenses, t.net, t.returns].join(
      ";"
    )
  );
  return lines.join("\n");
}

/** Trigger a client-side download of a CSV string. */
export function downloadCsv(csv: string, filename: string): void {
  // Prepend BOM so Excel reads UTF-8 (so'm, Cyrillic) correctly.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
