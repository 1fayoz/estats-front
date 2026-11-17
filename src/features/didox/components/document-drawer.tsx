"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CheckCircle2, Download, FileText, Loader2, X, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError, fetchDidoxDocument, fetchDidoxPdf } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { AWAITING_ME, doctypeLabel, formatDocDate, statusVariant } from "../labels";
import type { DidoxDirection, DidoxDocumentDetail } from "../types";
import type { DocumentAction } from "./document-action-dialog";

interface ProductRow {
  name: string;
  count?: number;
  total?: number;
}

/** Didox `json` ichidan tovar/xizmat qatorlari (ЭСФ: `productlist.products`). Shakl kafolatlanmagan. */
function productRows(content: unknown): ProductRow[] {
  if (!content || typeof content !== "object") return [];
  const list = (content as { productlist?: { products?: unknown } }).productlist?.products;
  if (!Array.isArray(list)) return [];
  return list.slice(0, 50).flatMap((p) => {
    if (!p || typeof p !== "object") return [];
    const r = p as Record<string, unknown>;
    const name = String(r.name ?? r.catalogname ?? "").trim();
    if (!name) return [];
    const num = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : Number(v));
    return [{ name, count: num(r.count), total: num(r.deliverysumwithvat ?? r.deliverysum ?? r.summa) }];
  });
}

/**
 * Hujjat tafsiloti — o'ngdan chiquvchi panel: asosiy maydonlar, qatorlar,
 * PDF (ko'rish/yuklab olish) va — `didox.control` bo'lsa va hujjat sizning
 * imzoingizni kutayotgan bo'lsa — qabul/rad tugmalari.
 */
export function DocumentDrawer({
  docId,
  direction,
  canControl,
  reloadKey,
  onClose,
  onAction,
}: {
  docId: string | null;
  direction: DidoxDirection;
  canControl: boolean;
  reloadKey: number;
  onClose: () => void;
  onAction: (detail: DidoxDocumentDetail, action: DocumentAction) => void;
}) {
  const [detail, setDetail] = React.useState<DidoxDocumentDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = React.useState(false);
  const [pdfError, setPdfError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDetail(null);
    setError(null);
    setPdfError(null);
    setPdfUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
    if (!docId) return;
    let alive = true;
    fetchDidoxDocument(docId, direction)
      .then((d) => { if (alive) setDetail(d); })
      .catch((e) => { if (alive) setError(e instanceof ApiError ? e.message : "Hujjatni yuklab bo'lmadi."); });
    return () => { alive = false; };
  }, [docId, direction, reloadKey]);

  React.useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);

  const loadPdf = async () => {
    if (!docId) return null;
    if (pdfUrl) return pdfUrl;
    setPdfBusy(true);
    setPdfError(null);
    try {
      const url = URL.createObjectURL(await fetchDidoxPdf(docId));
      setPdfUrl(url);
      return url;
    } catch (e) {
      setPdfError(e instanceof ApiError ? e.message : "PDF olinmadi.");
      return null;
    } finally {
      setPdfBusy(false);
    }
  };

  const download = async () => {
    const url = await loadPdf();
    if (!url || !docId) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `didox-${detail?.document.number || docId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const doc = detail?.document;
  const rows = productRows(detail?.content);
  const comment = typeof detail?.meta?.status_comment === "string" ? detail.meta.status_comment : "";
  const actionable = !!doc && canControl && doc.direction === "incoming" && doc.status === AWAITING_ME;

  return (
    <DialogPrimitive.Root open={!!docId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          data-air-portal=""
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l bg-background shadow-2xl outline-none"
        >
          <header className="flex items-start justify-between gap-3 border-b p-4">
            <div className="min-w-0">
              <DialogPrimitive.Title className="truncate text-lg font-semibold">
                {doc ? `${doctypeLabel(doc.doctype, doc.doctypeName)}${doc.number ? ` №${doc.number}` : ""}` : "Hujjat"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                {doc ? `${formatDocDate(doc.docDate)} · ${doc.partnerName || doc.partnerTin || "—"}` : "Didox hujjati"}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="rounded-md p-1 opacity-70 hover:opacity-100" aria-label="Yopish"><X className="size-5" /></DialogPrimitive.Close>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {!detail && !error && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Yuklanmoqda…</p>}
            {error && <p role="alert" className="rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/5 p-3 text-sm">{error}</p>}

            {doc && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(doc.status)}>{doc.statusName || `Holat ${doc.status ?? "—"}`}</Badge>
                  {doc.isUzum && <Badge variant="info">Uzum Market</Badge>}
                  <Badge variant="outline">{doc.direction === "incoming" ? "Kiruvchi" : "Chiquvchi"}</Badge>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">Kontragent</dt><dd className="font-medium">{doc.partnerName || "—"}</dd>
                  <dt className="text-muted-foreground">Kontragent STIRi</dt><dd>{doc.partnerTin || "—"}</dd>
                  <dt className="text-muted-foreground">Summa (QQS bilan)</dt><dd className="font-medium tabular-nums">{formatSum(doc.totalSum)}</dd>
                  {doc.vatSum > 0 && <><dt className="text-muted-foreground">QQS</dt><dd className="tabular-nums">{formatSum(doc.vatSum)}</dd></>}
                  {doc.contractNumber && <><dt className="text-muted-foreground">Shartnoma</dt><dd>№{doc.contractNumber}{doc.contractDate ? ` · ${formatDocDate(doc.contractDate)}` : ""}</dd></>}
                  {comment && <><dt className="text-muted-foreground">Izoh</dt><dd>{comment}</dd></>}
                </dl>

                {rows.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="p-2">Tovar / xizmat</th><th className="p-2 text-right">Soni</th><th className="p-2 text-right">Summa</th></tr></thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className="border-t"><td className="p-2">{r.name}</td><td className="p-2 text-right tabular-nums">{r.count ?? "—"}</td><td className="p-2 text-right tabular-nums">{r.total !== undefined && Number.isFinite(r.total) ? formatSum(r.total) : "—"}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <section className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => void loadPdf()} disabled={pdfBusy || !!pdfUrl}>
                      {pdfBusy ? <Loader2 className="animate-spin" /> : <FileText />}PDF ko&apos;rish
                    </Button>
                    <Button variant="outline" onClick={() => void download()} disabled={pdfBusy}><Download />Yuklab olish</Button>
                  </div>
                  {pdfError && <p role="alert" className="text-sm text-[var(--bad)]">{pdfError}</p>}
                  {pdfUrl && <iframe title="Hujjat PDF" src={pdfUrl} className="h-[60svh] w-full rounded-xl border" />}
                </section>
              </>
            )}
          </div>

          {actionable && detail && (
            <footer className="flex flex-wrap justify-end gap-2 border-t p-4">
              <Button variant="outline" onClick={() => onAction(detail, "reject")}><XCircle />Rad etish</Button>
              <Button onClick={() => onAction(detail, "accept")}><CheckCircle2 />Qabul qilish (E-IMZO)</Button>
            </footer>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
