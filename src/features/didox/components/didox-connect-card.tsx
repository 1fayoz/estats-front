"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, FileSignature, KeyRound, Loader2, LogOut, PlugZap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, connectDidox, disconnectDidox, fetchDidoxChallenge, fetchDidoxConnection } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCan } from "@/stores/user-store";
import type { DidoxConnection } from "../types";
import { EimzoSignDialog } from "./eimzo-sign-dialog";

const TAX_RE = /^(\d{9}|\d{14})$/;

function when(raw?: string | null): string {
  if (!raw) return "—";
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

/**
 * Integratsiyalar → «Didox» kartasi.
 *
 * Sirlar (parol, token) bu yerda hech qachon ko'rinmaydi: backend faqat
 * «parol saqlanganmi» deydi, parol maydoni yuborilgach tozalanadi.
 * E-IMZO bilan ulash tavsiya etiladi — parol saqlanmaydi.
 */
export function DidoxConnectCard() {
  const canControl = useCan("didox.control");
  const [conn, setConn] = React.useState<DidoxConnection | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [mode, setMode] = React.useState<"signature" | "password">("signature");
  const [taxId, setTaxId] = React.useState("");
  const [companyTin, setCompanyTin] = React.useState("");
  const [branchNum, setBranchNum] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [eimzoOpen, setEimzoOpen] = React.useState(false);
  const [confirmOff, setConfirmOff] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const next = await fetchDidoxConnection();
      setConn(next);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof ApiError && error.status === 403
        ? "Didox bo'limini ko'rish uchun «Hujjatlarni ko'rish» ruxsati kerak."
        : error instanceof ApiError ? error.message : "Didox holatini yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  const cleanTax = taxId.trim();
  const cleanCompany = companyTin.trim() || (cleanTax.length === 9 ? cleanTax : "");
  const formValid = TAX_RE.test(cleanTax) && /^\d{9}$/.test(cleanCompany) && (mode === "signature" || password.length > 0);

  const startEdit = () => {
    setTaxId(conn?.taxId && TAX_RE.test(conn.taxId) ? conn.taxId : "");
    setCompanyTin(conn?.companyTin ?? "");
    setBranchNum(conn?.branchNum ?? "");
    setMode(conn?.authMode === "password" ? "password" : "signature");
    setPassword("");
    setEditing(true);
  };

  const connectPassword = async () => {
    setBusy(true);
    try {
      const next = await connectDidox({
        authMode: "password", taxId: cleanTax, companyTin: cleanCompany,
        branchNum: branchNum.trim() || undefined, password,
      });
      setConn(next);
      setEditing(false);
      toast.success("Didox ulandi");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Ulanib bo'lmadi.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await disconnectDidox();
      setConfirmOff(false);
      toast.success("Didox uzildi — saqlangan parol va sessiya o'chirildi");
      await load();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Uzib bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Didox holati yuklanmoqda…</CardContent></Card>;
  }
  if (loadError) {
    return <Card><CardContent className="space-y-3 p-6 text-sm"><p>{loadError}</p><Button variant="outline" onClick={() => void load()}>Qayta urinish</Button></CardContent></Card>;
  }

  const status = !conn?.connected ? { label: "Ulanmagan", variant: "secondary" as const }
    : conn.lastError === "bad_credentials" ? { label: "Parol rad etilgan", variant: "destructive" as const }
    : conn.lastError === "locked" ? { label: "Didox hisobi bloklangan", variant: "destructive" as const }
    : conn.needsSignature ? { label: "Qayta E-IMZO kerak", variant: "warning" as const }
    : { label: "Ulangan", variant: "success" as const };
  const showForm = canControl && (editing || !conn?.connected);

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg"><FileSignature className="size-5 text-primary" />Didox — elektron hujjatlar</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            {conn && <Badge variant="outline">{conn.environment === "prod" ? "Prod" : "Test muhit"}</Badge>}
          </div>
        </div>
        <CardDescription>
          Uzum&apos;ning oylik hisob-fakturasi va dalolatnomasini ko&apos;rish, E-IMZO bilan qabul yoki rad etish.
          Imzo faqat sizning kompyuteringizda yasaladi — eStats kalitingizni ko&apos;rmaydi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {conn && !conn.partnerConfigured && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warn)]" />
            eStats hali Didox hamkor tokenini olmagan — ulanish hozircha ishlamaydi. Token kelishi bilan shu yerdan ulanasiz.
          </p>
        )}

        {conn?.connected && (
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Row label="Kompaniya" value={conn.companyName || "—"} />
            <Row label="Kompaniya STIRi" value={conn.companyTin || "—"} />
            <Row label="Kim kiradi" value={conn.taxId || "—"} />
            <Row label="Usul" value={conn.authMode === "password" ? `Parol${conn.passwordSaved ? " (shifrlangan holda saqlangan)" : ""}` : "E-IMZO"} />
            <Row label="Sessiya" value={conn.tokenValid ? `${when(conn.tokenExpiresAt)} gacha` : "Tugagan"} />
            <Row label="Oxirgi tekshiruv" value={when(conn.lastCheckedAt)} />
          </dl>
        )}

        {conn?.connected && conn.lastErrorMessage && (
          <p role="alert" className="rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/5 p-3 text-sm">
            {conn.lastError === "bad_credentials"
              ? "Didox parolni rad etdi. Hisobingiz bloklanmasligi uchun eStats qayta urinmaydi — parolni tekshirib, qayta ulang."
              : conn.lastError === "signature_required"
                ? "Didox sessiyasi tugadi. E-IMZO bilan ulangan hisobda server o'zi qayta kira olmaydi — «Qayta ulash» ni bosing."
                : conn.lastErrorMessage}
          </p>
        )}

        {conn?.connected && !editing && (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href={"/documents" as Route}><FileSignature />Hujjatlarni ochish</Link></Button>
            {canControl && <Button variant="outline" onClick={startEdit}><PlugZap />Qayta ulash</Button>}
            {canControl && <Button variant="ghost" onClick={() => setConfirmOff(true)}><LogOut />Uzish</Button>}
          </div>
        )}

        {!canControl && !conn?.connected && (
          <p className="text-sm text-muted-foreground">Ulash uchun «Hujjatlarni boshqarish» ruxsati kerak — hisob egasiga murojaat qiling.</p>
        )}

        {showForm && (
          <form
            className="space-y-4 rounded-xl border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!formValid || busy) return;
              if (mode === "signature") setEimzoOpen(true);
              else void connectPassword();
            }}
          >
            <div role="radiogroup" aria-label="Kirish usuli" className="grid gap-2 sm:grid-cols-2">
              {([
                { value: "signature", title: "E-IMZO kaliti bilan", hint: "Tavsiya etiladi. Parol saqlanmaydi; sessiya (6 soat) tugaganda qayta imzolaysiz." },
                { value: "password", title: "Didox paroli bilan", hint: "Server o'zi qayta kiradi. Parol shifrlangan holda saqlanadi." },
              ] as const).map((opt) => (
                <button key={opt.value} type="button" role="radio" aria-checked={mode === opt.value} onClick={() => setMode(opt.value)}
                  className={cn("rounded-xl border p-3 text-left text-sm transition-colors", mode === opt.value ? "border-primary bg-primary/5" : "hover:bg-muted/60")}>
                  <span className="flex items-center gap-2 font-medium">{opt.value === "signature" ? <ShieldCheck className="size-4" /> : <KeyRound className="size-4" />}{opt.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{opt.hint}</span>
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="didox-tax">STIR (9) yoki JShShIR (14)</Label>
                <Input id="didox-tax" inputMode="numeric" autoComplete="off" value={taxId} maxLength={14}
                  onChange={(e) => setTaxId(e.target.value.replace(/\D/g, ""))} placeholder="123456789" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="didox-company">Kompaniya STIRi{cleanTax.length === 9 ? " (ixtiyoriy)" : ""}</Label>
                <Input id="didox-company" inputMode="numeric" autoComplete="off" value={companyTin} maxLength={9}
                  onChange={(e) => setCompanyTin(e.target.value.replace(/\D/g, ""))} placeholder={cleanTax.length === 9 ? cleanTax : "123456789"} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="didox-branch">Filial raqami (ixtiyoriy)</Label>
                <Input id="didox-branch" autoComplete="off" value={branchNum} maxLength={16} onChange={(e) => setBranchNum(e.target.value)} />
              </div>
              {mode === "password" && (
                <div className="space-y-1.5">
                  <Label htmlFor="didox-password">Didox paroli</Label>
                  <Input id="didox-password" type="password" autoComplete="new-password" value={password} maxLength={128} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}
            </div>

            {mode === "password" && (
              <div role="note" className="flex items-start gap-2 rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warn)]" />
                <div className="space-y-1">
                  <p className="font-medium">Didox noto&apos;g&apos;ri parolga qattiq javob beradi</p>
                  <p className="text-muted-foreground">
                    Daqiqasiga 3 xato urinish — hisob 10 daqiqaga, 10 urinish — 24 soatga, 25 urinish — butunlay bloklanadi.
                    Parolni diqqat bilan kiriting. Didox parolni rad etsa, eStats qayta urinmaydi — siz qayta kiritmaguningizcha.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!formValid || busy}>
                {busy ? <Loader2 className="animate-spin" /> : mode === "signature" ? <ShieldCheck /> : <PlugZap />}
                {mode === "signature" ? "E-IMZO bilan ulash" : "Ulash"}
              </Button>
              {conn?.connected && <Button type="button" variant="ghost" onClick={() => { setEditing(false); setPassword(""); }}>Bekor qilish</Button>}
            </div>
          </form>
        )}
      </CardContent>

      <EimzoSignDialog
        open={eimzoOpen}
        onOpenChange={setEimzoOpen}
        title="Didox'ga E-IMZO bilan kirish"
        description="STIR raqamingiz E-IMZO kaliti bilan imzolanadi va Didox'ga kirish uchun ishlatiladi."
        details={[
          { label: "Kim kiradi", value: cleanTax },
          { label: "Kompaniya STIRi", value: cleanCompany },
          { label: "Muhit", value: conn?.environment === "prod" ? "Prod" : "Test" },
        ]}
        expectedTins={[cleanTax, cleanCompany]}
        confirmLabel="Imzolash va ulash"
        run={async (sign) => {
          const { dataToSignB64 } = await fetchDidoxChallenge(cleanTax);
          const signed = await sign(dataToSignB64);
          const next = await connectDidox({
            authMode: "signature", taxId: cleanTax, companyTin: cleanCompany,
            branchNum: branchNum.trim() || undefined, pkcs7: signed.pkcs7, signatureHex: signed.signatureHex,
          });
          setConn(next);
          setEditing(false);
          toast.success("Didox E-IMZO bilan ulandi");
        }}
      />

      <Dialog open={confirmOff} onOpenChange={setConfirmOff}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Didox uzilsinmi?</DialogTitle>
            <DialogDescription>Saqlangan parol va sessiya o&apos;chiriladi, yangi hujjatlar haqida Telegram xabarlari to&apos;xtaydi. Didox&apos;dagi hujjatlarga tegilmaydi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOff(false)} disabled={busy}>Bekor qilish</Button>
            <Button variant="destructive" onClick={() => void disconnect()} disabled={busy}>{busy && <Loader2 className="animate-spin" />}Uzish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 justify-between gap-3 border-b border-dashed py-1 sm:block sm:border-0 sm:py-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-medium">{value}</dd>
    </div>
  );
}
