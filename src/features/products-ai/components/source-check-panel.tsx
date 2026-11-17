"use client";

import { AlertTriangle, Ban, Camera, Check, Wand2 } from "lucide-react";

import { mediaUrl } from "@/lib/api";
import type { AiSourceCheck, AiSourceImageCheck } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Asl suratlar Uzum talabiga mosmi — format, 5 MB, 750×1000, 3:4, xiralik, takror.
 *
 * Tekshiruv backendda, AI'siz (`image_check.py`), yuklash paytida. Bu yerda
 * har surat uchun SABAB va TUZATISH yo'li ko'rsatiladi. «Qizil» (block)
 * topilma — Uzum bunday suratni qabul qilmaydi va «Tasdiqlash» auditda
 * to'xtaydi; «avtomatik» belgilisi (masalan katta fayl) — biz o'zimiz tuzatamiz.
 */
export function SourceCheckPanel({ check }: { check: AiSourceCheck | null | undefined }) {
  if (!check || check.images.length === 0) return null;
  const clean = check.images.every((i) => i.findings.length === 0);

  return (
    <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Camera className="size-3.5 shrink-0" />
        <span className="font-semibold">Suratlar Uzum talabiga mosmi</span>
        <span
          className={cn(
            "tabular-nums font-medium",
            check.score >= 90 ? "text-emerald-600" : check.score >= 60 ? "text-amber-600" : "text-destructive",
          )}
        >
          {check.score}/100
        </span>
        <span className="min-w-0 flex-1 text-muted-foreground">
          {clean
            ? "Hamma surat talabga mos."
            : `${check.blocking} ta jiddiy, ${check.warnings} ta ogohlantirish`}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {"Uzum: JPEG, PNG yoki WebP · 5 MB gacha · kamida 750×1000 · tik 3:4."}
      </p>
      {!clean && (
        <ul className="space-y-2">
          {check.images.map((image, index) =>
            image.findings.length ? <ImageRow key={image.url} image={image} index={index} /> : null,
          )}
        </ul>
      )}
    </div>
  );
}

function ImageRow({ image, index }: { image: AiSourceImageCheck; index: number }) {
  return (
    <li className="flex gap-2.5">
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl(image.url)}
          alt={`Asl surat ${index + 1}`}
          className="h-16 w-12 rounded-lg border object-cover"
        />
        <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 text-[9px] font-semibold text-white">
          {index + 1}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {[
            image.width && image.height ? `${image.width}×${image.height}` : null,
            image.format || null,
            image.sizeBytes ? `${(image.sizeBytes / 1024 / 1024).toFixed(1)} MB` : null,
            `${image.score}/100`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {image.findings.map((f, i) => {
          const hard = f.severity === "block" && !f.autoFixable;
          return (
            <div
              key={`${f.code}-${i}`}
              className={cn(
                "flex items-start gap-2 rounded-lg border p-2 text-xs",
                hard
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-500",
              )}
            >
              {hard ? (
                <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span className="min-w-0 space-y-0.5">
                <span className="block">{f.reason}</span>
                {f.fix && (
                  <span className="flex items-start gap-1 text-muted-foreground">
                    {f.autoFixable ? (
                      <Wand2 className="mt-0.5 h-3 w-3 shrink-0" />
                    ) : (
                      <Check className="mt-0.5 h-3 w-3 shrink-0" />
                    )}
                    {f.autoFixable ? `Avtomatik: ${f.fix}` : f.fix}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </li>
  );
}

/** Surat ustidagi kichik belgi: qizil — jiddiy, sariq — ogohlantirish. */
export function SourceCheckDot({ check, url }: { check: AiSourceCheck | null | undefined; url: string }) {
  const image = check?.images.find((i) => i.url === url);
  if (!image || image.findings.length === 0) return null;
  const hard = image.findings.some((f) => f.severity === "block" && !f.autoFixable);
  return (
    <span
      title={image.findings.map((f) => f.reason).join("\n")}
      className={cn(
        "absolute left-1 top-1 flex size-4 items-center justify-center rounded-full text-white",
        hard ? "bg-destructive" : "bg-amber-500",
      )}
    >
      <AlertTriangle className="size-2.5" />
    </span>
  );
}
