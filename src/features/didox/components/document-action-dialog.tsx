"use client";

import * as React from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prepareDidoxSign, submitDidoxSign } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { EIMZO_MIN_ACCEPT_VERSION } from "../eimzo-core";
import { doctypeLabel, formatDocDate } from "../labels";
import type { DidoxDocument } from "../types";
import { EimzoSignDialog } from "./eimzo-sign-dialog";

export type DocumentAction = "accept" | "reject";

const MIN_REASON = 3;

/**
 * Kiruvchi hujjatni qabul qilish / rad etish — har doim ANIQ tasdiq bilan.
 *
 * Backend shartnomasi (`src/api/didox/router.py`):
 * `POST /sign/prepare {action, comment?}` → `{dataToSignB64, minEimzoVersion}` →
 * brauzer E-IMZO bilan `create_pkcs7` → `POST /sign {action, pkcs7,
 * signatureHex, comment?}`. Rad etishda izoh ikkala so'rovda AYNAN bir xil
 * bo'lishi shart (Didox §11) — shuning uchun bir marta qirqib saqlanadi.
 */
export function DocumentActionDialog({
  doc,
  action,
  companyTin,
  taxId,
  onClose,
  onDone,
}: {
  doc: DidoxDocument | null;
  action: DocumentAction | null;
  companyTin?: string | null;
  taxId?: string | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = React.useState("");
  const open = !!doc && !!action;
  React.useEffect(() => { if (!open) setReason(""); }, [open]);
  if (!doc || !action) return null;

  const isReject = action === "reject";
  const comment = reason.trim();
  const kind = doctypeLabel(doc.doctype, doc.doctypeName);

  return (
    <EimzoSignDialog
      open={open}
      onOpenChange={(next) => { if (!next) onClose(); }}
      title={isReject ? "Hujjatni rad etish" : "Hujjatni qabul qilish (imzolash)"}
      description={isReject
        ? "Rad etish ham E-IMZO imzosi bilan qilinadi va Didox'da qaytarib bo'lmaydi."
        : "Imzolangach hujjat «Imzolangan» bo'ladi va soliq tizimiga yuboriladi. Qaytarib bo'lmaydi — raqam va summani tekshiring."}
      details={[
        { label: "Hujjat", value: `${kind}${doc.number ? ` №${doc.number}` : ""}` },
        { label: "Sana", value: formatDocDate(doc.docDate) },
        { label: "Kontragent", value: `${doc.partnerName || "—"}${doc.partnerTin ? ` (STIR ${doc.partnerTin})` : ""}` },
        { label: "Summa (QQS bilan)", value: formatSum(doc.totalSum) },
        ...(doc.vatSum ? [{ label: "Shundan QQS", value: formatSum(doc.vatSum) }] : []),
      ]}
      expectedTins={[companyTin, taxId]}
      minVersion={isReject ? null : EIMZO_MIN_ACCEPT_VERSION}
      confirmLabel={isReject ? "Imzolab rad etish" : "Imzolab qabul qilish"}
      tone={isReject ? "danger" : "default"}
      canConfirm={!isReject || comment.length >= MIN_REASON}
      run={async (sign) => {
        const prepared = await prepareDidoxSign(doc.id, action, isReject ? comment : undefined);
        const signed = await sign(prepared.dataToSignB64, prepared.minEimzoVersion);
        const result = await submitDidoxSign(doc.id, {
          action, pkcs7: signed.pkcs7, signatureHex: signed.signatureHex,
          comment: isReject ? comment : undefined,
        });
        if (!result.ok) throw new Error("Didox amalni qabul qilmadi. Hujjat holatini tekshiring.");
        toast.success(isReject ? "Hujjat rad etildi" : "Hujjat imzolandi va qabul qilindi");
        if (result.warning) toast.warning(`Didox ogohlantirishi: ${result.warning}`);
        onDone();
      }}
    >
      {isReject && (
        <div className="space-y-1.5">
          <Label htmlFor="didox-reject-reason">Rad etish sababi (majburiy)</Label>
          <Textarea
            id="didox-reject-reason"
            value={reason}
            maxLength={500}
            rows={3}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Masalan: summa moliya hisobotimizga mos emas, komissiya 2 marta hisoblangan"
          />
          <p className="text-xs text-muted-foreground">Sabab kontragentga (masalan Uzum&apos;ga) ko&apos;rinadi. {comment.length}/500</p>
        </div>
      )}
    </EimzoSignDialog>
  );
}
