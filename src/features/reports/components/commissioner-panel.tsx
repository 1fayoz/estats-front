"use client";

import * as React from "react";
import { Download, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ApiError,
  deleteCommissionerReport,
  downloadCommissionerFile,
  fetchCommissionerReport,
  uploadCommissionerReport,
} from "@/lib/api";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { CommissionerReport, ReconcileLine } from "../types";
import { pctText } from "./report-parts";

const STATUS: Record<ReconcileLine["status"], { label: string; cls: string }> = {
  match: { label: "mos", cls: "text-[var(--ok)]" },
  close: { label: "yaqin (≤1%)", cls: "text-[var(--warn)]" },
  mismatch: { label: "farq bor", cls: "text-[var(--bad)]" },
  missing: { label: "faylda yo'q", cls: "text-muted-foreground" },
};

/**
 * Uzum komissioner hisoboti (Excel) — yuklash va eStats bilan solishtirish.
 * Uzum'da bu hisobot uchun API yo'q; fayl kabinetdan keyingi oyning 6-sanasidan.
 * `finance.view` bo'lmasa (403) — panel yashiriladi.
 */
export function CommissionerPanel({ period, onChanged }: { period: string; onChanged: () => void }) {
  const [data, setData] = React.useState<CommissionerReport | null>(null);
  const [state, setState] = React.useState<"loading" | "empty" | "ready" | "hidden">("loading");
  const [busy, setBusy] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setState("loading");
    try {
      setData(await fetchCommissionerReport<CommissionerReport>(period));
      setState("ready");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setState("hidden");
      else setState("empty");
      setData(null);
    }
  }, [period]);

  React.useEffect(() => { void load(); }, [load]);

  if (state === "hidden") return null;

  const upload = async (file: File) => {
    setBusy(true);
    try {
      setData(await uploadCommissionerReport<CommissionerReport>(period, file));
      setState("ready");
      toast.success("Komissioner hisoboti o'qildi");
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuklab bo'lmadi");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async () => {
    if (!window.confirm("Yuklangan hisobot o'chirilsinmi?")) return;
    try {
      await deleteCommissionerReport(period);
      setData(null);
      setState("empty");
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirib bo'lmadi");
    }
  };

  const money = (v: number | null, key?: string) => (v == null ? "—" : key === "quantity" ? String(v) : formatSum(v));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Uzum komissioner hisoboti — solishtirish</CardTitle>
            <CardDescription>
              Kabinet → Отчёты → «отчёт комиссионера» (Excel). Uzum uni xaridor tovarni OLGAN sana bo&apos;yicha
              tuzadi — eStats ham shu asosda solishtiradi.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={input} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                   className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
            <Button size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
              <FileUp className="mr-2 size-4" /> {busy ? "O'qilmoqda…" : data ? "Qayta yuklash" : "Excel yuklash"}
            </Button>
            {data && (
              <>
                <Button size="sm" variant="ghost" onClick={() => void downloadCommissionerFile(period).catch((e) => toast.error(e.message))}
                        aria-label="Asl faylni yuklab olish"><Download className="size-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => void remove()} aria-label="O'chirish"><Trash2 className="size-4" /></Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {state === "loading" && <p className="text-muted-foreground">Yuklanmoqda…</p>}
        {state === "empty" && (
          <p className="text-muted-foreground">
            {period} uchun hisobot yuklanmagan. Faqat .xlsx (5 MB gacha); PDF hozircha o&apos;qilmaydi.
          </p>
        )}
        {data && (
          <>
            <p className="text-xs text-muted-foreground">
              {data.filename} · {data.rowsCount} qator ·{" "}
              {data.layout.totalsFrom === "itogo" ? "jami «Итого» qatoridan" : data.layout.totalsFrom === "labels" ? "jami yorliqlardan" : "jami qatorlar yig'indisi"}
            </p>
            {data.warnings.length > 0 && (
              <ul className="space-y-1 rounded-lg border border-[var(--warn-line)] bg-[var(--warn-bg)] p-3 text-xs text-[var(--warn-ink)]">
                {data.warnings.map((w) => <li key={w}>{w}</li>)}
              </ul>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px]">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Qator</th>
                    <th className="py-2 pr-3 text-right font-medium">Uzum (fayl)</th>
                    <th className="py-2 pr-3 text-right font-medium">eStats</th>
                    <th className="py-2 pr-3 text-right font-medium">Farq</th>
                    <th className="py-2 font-medium">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.lines.map((ln) => (
                    <tr key={ln.key}>
                      <td className="py-1.5 pr-3">{ln.label}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{money(ln.uzum, ln.key)}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{money(ln.estats, ln.key)}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">
                        {money(ln.diff, ln.key)}{ln.diffPct != null ? ` (${pctText(ln.diffPct)})` : ""}
                      </td>
                      <td className={cn("py-1.5", STATUS[ln.status].cls)}>{STATUS[ln.status].label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.rowKey && (
              <details className="rounded-lg border p-3">
                <summary className="cursor-pointer font-medium">
                  {data.rowKey === "order_id" ? "Buyurtma" : "SKU"} bo&apos;yicha farqlar{" "}
                  <Badge variant="secondary">{data.rowDiffs.length}</Badge>
                </summary>
                {data.rowDiffs.length === 0 ? (
                  <p className="mt-2 text-muted-foreground">Hamma qator mos.</p>
                ) : (
                  <table className="mt-2 w-full text-xs">
                    <tbody className="divide-y">
                      {data.rowDiffs.map((d) => (
                        <tr key={d.key}>
                          <td className="py-1 pr-3 font-mono">{d.key}</td>
                          <td className="py-1 pr-3 text-right tabular-nums">{money(d.uzum)}</td>
                          <td className="py-1 pr-3 text-right tabular-nums">{money(d.estats)}</td>
                          <td className="py-1 pr-3 text-right tabular-nums">{formatSum(d.diff)}</td>
                          <td className="py-1 text-muted-foreground">
                            {d.status === "onlyUzum" ? "faqat Uzum faylida" : d.status === "onlyEstats" ? "faqat eStats'da" : "summa farqi"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </details>
            )}
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              {data.explanation.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
