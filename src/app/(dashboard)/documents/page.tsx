"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { FileSignature, Inbox, Loader2, Plug, RefreshCw, Send, Store } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentActionDialog, type DocumentAction } from "@/features/didox/components/document-action-dialog";
import { DocumentDrawer } from "@/features/didox/components/document-drawer";
import { UzumMonthly } from "@/features/didox/components/uzum-monthly";
import { AWAITING_ME, DOCTYPE_OPTIONS, STATUS_OPTIONS, doctypeLabel, formatDocDate, statusVariant } from "@/features/didox/labels";
import type { DidoxConnection, DidoxDirection, DidoxDocument, DidoxDocumentList } from "@/features/didox/types";
import { ApiError, fetchDidoxConnection, fetchDidoxDocuments, fetchDidoxStats } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { useQueryState } from "@/lib/use-query-state";
import { useCan, useUserStore } from "@/stores/user-store";

const PAGE_SIZE = 20;
const ALL = "all";

export default function DocumentsPage() {
  const workspaceId = useUserStore((s) => s.workspaceId);
  const shopId = useUserStore((s) => s.activeShopId);
  return (
    <React.Suspense fallback={<Skeleton className="h-72 rounded-2xl" />}>
      <DocumentsWorkspace key={`${workspaceId ?? "w"}:${shopId ?? "s"}`} />
    </React.Suspense>
  );
}

/**
 * «Hujjatlar (Didox)» — kiruvchi/chiquvchi elektron hujjatlar va Uzum'ning
 * oylik hisob-faktura/dalolatnomalari. Ko'rish — `didox.view`, qabul/rad —
 * `didox.control` (imzo faqat brauzerda, E-IMZO bilan).
 */
function DocumentsWorkspace() {
  const canControl = useCan("didox.control");
  const canReconcile = useCan("finance.view");
  const [tab, setTab] = useQueryState("tab", "incoming");
  const [openDoc, setOpenDoc] = useQueryState("doc", "");
  const [conn, setConn] = React.useState<DidoxConnection | null>(null);
  const [connError, setConnError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [drawerDirection, setDrawerDirection] = React.useState<DidoxDirection>("incoming");
  const [action, setAction] = React.useState<{ doc: DidoxDocument; action: DocumentAction } | null>(null);

  React.useEffect(() => {
    fetchDidoxConnection()
      .then(setConn)
      .catch((e) => setConnError(e instanceof ApiError ? e.message : "Didox holatini yuklab bo'lmadi."));
  }, []);

  const direction: DidoxDirection = tab === "outgoing" ? "outgoing" : "incoming";
  const open = (doc: DidoxDocument) => { setDrawerDirection(doc.direction); setOpenDoc(doc.id); };
  const refresh = () => setReloadKey((k) => k + 1);

  if (connError) return <p role="alert" className="rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/5 p-4 text-sm">{connError}</p>;
  if (!conn) return <Skeleton className="h-72 rounded-2xl" />;
  if (!conn.connected) {
    return (
      <div className="space-y-4">
        <EmptyState icon={FileSignature} title="Didox hali ulanmagan"
          description="Uzum'ning hisob-faktura va dalolatnomalarini shu yerda ko'rish va E-IMZO bilan qabul qilish uchun Didox hisobingizni ulang." />
        <div className="flex justify-center">
          <Button asChild><Link href={"/integrations?tab=didox" as Route}><Plug />Integratsiyalarda ulash</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 text-sm">
          <p className="font-medium">{conn.companyName || "Didox"} <span className="text-muted-foreground">· STIR {conn.companyTin}</span></p>
          {(conn.needsSignature || conn.lastError) && (
            <p className="text-[var(--warn)]">
              {conn.needsSignature ? "Didox sessiyasi tugagan — " : "Didox ulanishida muammo — "}
              <Link className="underline" href={"/integrations?tab=didox" as Route}>Integratsiyalarda qayta ulang</Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {conn.environment !== "prod" && <Badge variant="outline">Test muhit</Badge>}
          <Button variant="outline" size="sm" onClick={refresh}><RefreshCw />Yangilash</Button>
        </div>
      </div>

      <Tabs value={tab === "outgoing" || tab === "uzum" ? tab : "incoming"} onValueChange={setTab}>
        <TabsList aria-label="Hujjat bo'limlari">
          <TabsTrigger value="incoming"><Inbox className="size-4" />Kiruvchi</TabsTrigger>
          <TabsTrigger value="outgoing"><Send className="size-4" />Chiquvchi</TabsTrigger>
          <TabsTrigger value="uzum"><Store className="size-4" />Uzum oylik</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming" className="mt-4">
          {direction === "incoming" && tab !== "uzum" && <DocumentList direction="incoming" reloadKey={reloadKey} canControl={canControl} onOpen={open} onAction={(doc, a) => setAction({ doc, action: a })} />}
        </TabsContent>
        <TabsContent value="outgoing" className="mt-4">
          {direction === "outgoing" && <DocumentList direction="outgoing" reloadKey={reloadKey} canControl={false} onOpen={open} onAction={() => undefined} />}
        </TabsContent>
        <TabsContent value="uzum" className="mt-4">
          {tab === "uzum" && <UzumMonthly canReconcile={canReconcile} reloadKey={reloadKey} onOpen={open} />}
        </TabsContent>
      </Tabs>

      <DocumentDrawer
        docId={openDoc || null}
        direction={drawerDirection}
        canControl={canControl}
        reloadKey={reloadKey}
        onClose={() => setOpenDoc("")}
        onAction={(detail, a) => setAction({ doc: detail.document, action: a })}
      />
      <DocumentActionDialog
        doc={action?.doc ?? null}
        action={action?.action ?? null}
        companyTin={conn.companyTin}
        taxId={conn.taxId}
        onClose={() => setAction(null)}
        onDone={() => { setAction(null); refresh(); }}
      />
    </div>
  );
}

function DocumentList({
  direction,
  reloadKey,
  canControl,
  onOpen,
  onAction,
}: {
  direction: DidoxDirection;
  reloadKey: number;
  canControl: boolean;
  onOpen: (doc: DidoxDocument) => void;
  onAction: (doc: DidoxDocument, action: DocumentAction) => void;
}) {
  const [doctype, setDoctype] = React.useState(ALL);
  const [status, setStatus] = React.useState(ALL);
  const [partner, setPartner] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<DidoxDocumentList | null>(null);
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const partnerValid = partner === "" || /^(\d{9}|\d{14})$/.test(partner);
  const filterKey = `${doctype}|${status}|${partnerValid ? partner : ""}|${dateFrom}|${dateTo}`;
  React.useEffect(() => { setPage(1); }, [filterKey]);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchDidoxDocuments({
      direction, page, limit: PAGE_SIZE,
      doctype: doctype === ALL ? undefined : doctype,
      status: status === ALL ? undefined : status,
      partner: partnerValid && partner ? partner : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
      .then((d) => { if (alive) setData(d); })
      .catch((e) => { if (alive) setError(e instanceof ApiError ? e.message : "Hujjatlarni yuklab bo'lmadi."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // filterKey barcha filtrlarni o'z ichiga oladi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, page, filterKey, reloadKey]);

  React.useEffect(() => {
    fetchDidoxStats(direction).then(setStats).catch(() => setStats({}));
  }, [direction, reloadKey]);

  const awaiting = stats[String(AWAITING_ME)] ?? 0;

  return (
    <div className="space-y-3">
      {direction === "incoming" && awaiting > 0 && (
        <button type="button" onClick={() => setStatus(String(AWAITING_ME))}
          className="w-full rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-3 text-left text-sm">
          <b>{awaiting} ta hujjat</b> sizning imzongizni kutmoqda — ko&apos;rsatish
        </button>
      )}

      <div className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1">
          <Label>Turi</Label>
          <Select value={doctype} onValueChange={setDoctype}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Hammasi</SelectItem>
              {DOCTYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Holati</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Hammasi</SelectItem>
              {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}{stats[o.value] ? ` (${stats[o.value]})` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`partner-${direction}`}>Kontragent STIRi</Label>
          <Input id={`partner-${direction}`} inputMode="numeric" value={partner} maxLength={14}
            onChange={(e) => setPartner(e.target.value.replace(/\D/g, ""))} placeholder="309376127"
            aria-invalid={!partnerValid} />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`from-${direction}`}>Sanadan</Label>
          <Input id={`from-${direction}`} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`to-${direction}`}>Sanagacha</Label>
          <Input id={`to-${direction}`} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/5 p-3 text-sm">{error}</p>}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2.5">Hujjat</th>
              <th className="p-2.5">Sana</th>
              <th className="p-2.5">Kontragent</th>
              <th className="p-2.5 text-right">Summa</th>
              <th className="p-2.5">Holati</th>
              <th className="p-2.5 text-right">Amal</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
            )}
            {data && data.items.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Bu filtrlar bo&apos;yicha hujjat yo&apos;q.</td></tr>
            )}
            {data?.items.map((doc) => (
              <tr key={doc.id} className="border-t hover:bg-muted/30">
                <td className="p-2.5">
                  <button type="button" className="text-left font-medium hover:underline" onClick={() => onOpen(doc)}>
                    {doctypeLabel(doc.doctype, doc.doctypeName)}{doc.number ? ` №${doc.number}` : ""}
                  </button>
                  {doc.isUzum && <Badge variant="info" className="ml-2">Uzum</Badge>}
                </td>
                <td className="p-2.5 tabular-nums">{formatDocDate(doc.docDate)}</td>
                <td className="max-w-[240px] truncate p-2.5" title={doc.partnerName ?? undefined}>
                  {doc.partnerName || "—"}<span className="block text-xs text-muted-foreground">{doc.partnerTin}</span>
                </td>
                <td className="p-2.5 text-right tabular-nums">{formatSum(doc.totalSum)}</td>
                <td className="p-2.5"><Badge variant={statusVariant(doc.status)}>{doc.statusName || `Holat ${doc.status ?? "—"}`}</Badge></td>
                <td className="p-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    {canControl && direction === "incoming" && doc.status === AWAITING_ME && (
                      <>
                        <Button size="sm" onClick={() => onAction(doc, "accept")}>Qabul</Button>
                        <Button size="sm" variant="outline" onClick={() => onAction(doc, "reject")}>Rad</Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => onOpen(doc)}>Ko&apos;rish</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total > PAGE_SIZE && (
        <Pagination page={page} total={data.total} size={PAGE_SIZE} onPage={setPage} label="hujjat" />
      )}
    </div>
  );
}
