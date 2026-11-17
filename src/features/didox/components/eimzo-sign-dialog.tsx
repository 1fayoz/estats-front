"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, KeyRound, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EIMZO_DOWNLOAD_URL, type EimzoCertificate, certificateMatches, isExpired } from "../eimzo-core";
import { detectEimzo, EimzoError, type EimzoState, type Pkcs7Result, signWithCertificate } from "../eimzo";

export interface SignDetail {
  label: string;
  value: React.ReactNode;
}

/** `run` ichida chaqiriladi: tanlangan kalit bilan imzolaydi. */
export type SignFn = (dataB64: string, minVersion?: string | null) => Promise<Pkcs7Result>;

/**
 * E-IMZO bilan imzolash oynasi — ANIQ tasdiq bilan.
 *
 * Tartib: (1) E-IMZO topiladi, versiya va kalitlar o'qiladi; (2) sotuvchi
 * kalitni tanlaydi — STIRi mos kelmaganlari tanlab bo'lmaydi; (3) oynada
 * hujjat raqami, turi va summasi ko'rinib turadi va faqat tugma bosilgandan
 * keyin `run(sign)` ishga tushadi. Parolni E-IMZO O'Z oynasida so'raydi —
 * kalit ham, parol ham bu sahifaga tushmaydi.
 */
export function EimzoSignDialog({
  open,
  onOpenChange,
  title,
  description,
  details,
  expectedTins,
  minVersion,
  confirmLabel,
  tone = "default",
  canConfirm = true,
  children,
  run,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  details: SignDetail[];
  expectedTins: (string | null | undefined)[];
  /** Oldindan ma'lum talab (qabul qilish — 6.3.5). */
  minVersion?: string | null;
  confirmLabel: string;
  tone?: "default" | "danger";
  canConfirm?: boolean;
  children?: React.ReactNode;
  run: (sign: SignFn) => Promise<void>;
}) {
  const [state, setState] = React.useState<EimzoState | null>(null);
  const [detecting, setDetecting] = React.useState(false);
  const [detectError, setDetectError] = React.useState<EimzoError | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const tinKey = expectedTins.join(",");

  const detect = React.useCallback(async () => {
    setDetecting(true);
    setDetectError(null);
    setError(null);
    try {
      const next = await detectEimzo(minVersion);
      setState(next);
      const usable = next.certificates.filter((c) => !isExpired(c) && certificateMatches(c, tinKey.split(",")));
      setSelected(usable.length === 1 ? usable[0].alias : null);
    } catch (err) {
      setState(null);
      setDetectError(err instanceof EimzoError ? err : new EimzoError(String(err), "failed"));
    } finally {
      setDetecting(false);
    }
  }, [minVersion, tinKey]);

  React.useEffect(() => {
    if (open) void detect();
    else { setError(null); setBusy(false); }
  }, [open, detect]);

  const certificates = state?.certificates ?? [];
  const chosen = certificates.find((c) => c.alias === selected) ?? null;
  const anyMatching = certificates.some((c) => certificateMatches(c, expectedTins));

  const onConfirm = async () => {
    if (!chosen) return;
    setBusy(true);
    setError(null);
    try {
      await run(async (dataB64, needVersion) => {
        // Server keyinroq aniqroq talab aytishi mumkin (`minEimzoVersion`).
        if (needVersion && needVersion !== minVersion) await detectEimzo(needVersion);
        return signWithCertificate(chosen, dataB64);
      });
      onOpenChange(false);
    } catch (err) {
      if (err instanceof EimzoError && err.code === "cancelled") setError("Imzolash bekor qilindi — hech narsa yuborilmadi.");
      else setError(err instanceof Error ? err.message : "Imzolab bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className="max-h-[90svh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" />{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {details.length > 0 && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl border bg-muted/40 p-3 text-sm">
            {details.map((d) => (
              <React.Fragment key={d.label}>
                <dt className="text-muted-foreground">{d.label}</dt>
                <dd className="min-w-0 break-words font-medium">{d.value}</dd>
              </React.Fragment>
            ))}
          </dl>
        )}

        {children}

        <section aria-label="E-IMZO kaliti" className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">E-IMZO kaliti</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => void detect()} disabled={detecting || busy}>
              <RefreshCw className={cn(detecting && "animate-spin")} /> Qayta tekshirish
            </Button>
          </div>

          {detecting && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />E-IMZO ilovasi qidirilmoqda…</p>}

          {detectError && (
            <div role="alert" className="space-y-2 rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-3 text-sm">
              <p className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warn)]" />{detectError.message}</p>
              {(detectError.code === "not_running" || detectError.code === "old_version") && (
                <ol className="ml-6 list-decimal space-y-0.5 text-muted-foreground">
                  <li>E-IMZO ilovasini yuklab oling va o&apos;rnating (6.3.5 yoki yangisi).</li>
                  <li>Ilovani ishga tushiring — u fonda ochiq turishi kerak.</li>
                  <li>Kalitingiz (.pfx fayl) kompyuterda bo&apos;lsin, so&apos;ng «Qayta tekshirish» ni bosing.</li>
                </ol>
              )}
              <a href={EIMZO_DOWNLOAD_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
                e-imzo.uz <ExternalLink className="size-3.5" />
              </a>
            </div>
          )}

          {state && state.versionStatus === "unknown" && minVersion && (
            <p className="text-xs text-muted-foreground">E-IMZO versiyasi: {state.versionText}. Bu amal {minVersion} yoki yangisini talab qiladi — aniq tekshirib bo&apos;lmadi; xato chiqsa E-IMZO&apos;ni yangilang.</p>
          )}

          {state && certificates.length === 0 && (
            <p role="alert" className="rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-3 text-sm">
              E-IMZO ishlayapti, lekin kompyuterda birorta kalit (.pfx) topilmadi. Kalitni E-IMZO&apos;ga qo&apos;shing
              (odatda <code>C:\DSKEYS</code> papkasi) va «Qayta tekshirish» ni bosing.
            </p>
          )}

          {state && certificates.length > 0 && !anyMatching && (
            <p role="alert" className="rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/5 p-3 text-sm">
              Kalitlarning hech biri kutilgan STIR ({expectedTins.filter(Boolean).join(" / ")}) ga tegishli emas.
              Didox&apos;ga ulangan kompaniyaning kalitini tanlang.
            </p>
          )}

          {certificates.length > 0 && (
            <ul className="space-y-1.5" role="radiogroup" aria-label="Kalitni tanlang">
              {certificates.map((cert) => <CertificateRow key={cert.alias} cert={cert} expectedTins={expectedTins} selected={selected === cert.alias} onSelect={() => setSelected(cert.alias)} disabled={busy} />)}
            </ul>
          )}
        </section>

        {error && <p role="alert" className="rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/5 p-3 text-sm">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Bekor qilish</Button>
          <Button
            type="button"
            variant={tone === "danger" ? "destructive" : "default"}
            onClick={() => void onConfirm()}
            disabled={!chosen || !canConfirm || busy || detecting}
          >
            {busy ? <Loader2 className="animate-spin" /> : <KeyRound />}
            {busy ? "E-IMZO oynasida parolni kiriting…" : confirmLabel}
          </Button>
        </DialogFooter>
        <p className="text-xs text-muted-foreground">
          Imzo shu kompyuterdagi E-IMZO ilovasida yasaladi. Shaxsiy kalit va uning paroli eStats&apos;ga yuborilmaydi —
          serverga faqat tayyor imzo boradi.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function CertificateRow({ cert, expectedTins, selected, onSelect, disabled }: {
  cert: EimzoCertificate;
  expectedTins: (string | null | undefined)[];
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const expired = isExpired(cert);
  const matches = certificateMatches(cert, expectedTins);
  const usable = !expired && matches;
  const tin = cert.orgTin || cert.uid;
  return (
    <li>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={!usable || disabled}
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
          selected ? "border-primary bg-primary/5" : "hover:bg-muted/60",
          !usable && "cursor-not-allowed opacity-60",
        )}
      >
        {selected ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> : <KeyRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{cert.organization || cert.cn}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {cert.organization ? `${cert.cn} · ` : ""}{tin ? `STIR ${tin}` : "STIR ko'rsatilmagan"}
            {cert.validTo ? ` · ${cert.validTo.toLocaleDateString("ru-RU")} gacha` : ""}
          </span>
        </span>
        {expired ? <Badge variant="destructive">Muddati o&apos;tgan</Badge> : !matches ? <Badge variant="warning">STIR mos emas</Badge> : null}
      </button>
    </li>
  );
}
