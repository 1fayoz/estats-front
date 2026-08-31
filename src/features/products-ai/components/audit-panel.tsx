"use client";

import { AlertTriangle, Check, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AiAudit } from "@/lib/types";

/**
 * Joylashdan OLDINGI tekshiruv.
 *
 * SEO auditidan (`/seo/[id]`) ALOHIDA: u yerdagi audit Uzumda
 * ALLAQACHON turgan tovarni o'lchaydi (qidiruv o'rni, sotuvi).
 * Bu yerda hali hech narsa yo'q — faqat qoralama, va savol boshqa:
 * "kartochka to'liqmi, Uzum talabiga javob beradimi".
 *
 * Bloklovchi topilma bo'lsa "Tasdiqlash" backendda RAD ETILADI —
 * bu yerda faqat sababi ko'rsatiladi.
 */
export function AuditPanel({ audit }: { audit: AiAudit | null }) {
  if (!audit) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4" />
        Joylashga tayyorlik
        <span
          className={cn(
            "tabular-nums",
            audit.score >= 90
              ? "text-emerald-600"
              : audit.score >= 60
                ? "text-amber-600"
                : "text-destructive"
          )}
        >
          {audit.score}/100
        </span>
      </div>
      <ul className="space-y-1.5">
        {audit.findings.map((f, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-2 rounded-lg border p-2 text-xs",
              f.level === "block" &&
                "border-destructive/30 bg-destructive/5 text-destructive",
              f.level === "warn" &&
                "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-500",
              f.level === "ok" &&
                "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-500"
            )}
          >
            {f.level === "ok" ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            <span>
              <b className="font-medium">{f.area}:</b> {f.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
