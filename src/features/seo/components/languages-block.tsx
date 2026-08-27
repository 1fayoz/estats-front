"use client";

import * as React from "react";
import { AlertTriangle, Check, Languages } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SeoLanguage } from "@/lib/types";

/**
 * O'zbekcha va ruscha kartochka — yonma-yon.
 *
 * Xaridor ruscha so'rovni ruscha matndan topadi. Ikkalasini bitta
 * ballga qo'shib yuborish kuchsiz tilni yashiradi: umumiy 60 ball
 * "o'zbekchasi 80, ruschasi 30" degani bo'lishi mumkin va tuzatish
 * kerak bo'lgan joy aynan shu yerda ko'rinmay qoladi.
 */
export function LanguagesBlock({ languages }: { languages: SeoLanguage[] }) {
  const shown = languages.filter((l) => l.coverageTotal > 0 || l.filled);
  if (shown.length < 2) return null;

  const weakest = shown.reduce((a, b) => (a.score <= b.score ? a : b));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Languages className="h-4 w-4" />
          Tillar bo&apos;yicha
        </CardTitle>
        <CardDescription>
          Ruscha so&apos;rov ruscha matndan topiladi. Har til alohida
          o&apos;lchanadi, umumiy ballga esa o&apos;z talab ulushicha qo&apos;shiladi.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {shown.map((lang) => (
          <LanguageCard
            key={lang.language}
            lang={lang}
            weakest={shown.length > 1 && lang.language === weakest.language && lang.score < 60}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function LanguageCard({ lang, weakest }: { lang: SeoLanguage; weakest: boolean }) {
  const share = Math.round((lang.weight || 0) * 100);
  const percent = Math.round((lang.score / 85) * 100);
  const tone =
    percent >= 70 ? "text-emerald-500" : percent >= 40 ? "text-amber-500" : "text-red-500";

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        weakest ? "border-amber-500/40 bg-amber-500/5" : "border-border"
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{lang.name}</span>
          {!lang.scriptOk && lang.filled ? (
            <Badge variant="outline" className="border-amber-500/40 text-amber-500">
              matn yo&apos;q
            </Badge>
          ) : null}
        </div>
        <div className="text-right">
          <span className={cn("text-xl font-semibold tabular-nums", tone)}>{lang.score}</span>
          <span className="text-xs text-muted-foreground">/85</span>
        </div>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Talabning {share}% i shu tilda — umumiy ballga shuncha ta&apos;sir qiladi
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent >= 70 ? "bg-emerald-500" : percent >= 40 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Part label="Nom" value={lang.titleScore} max={25} />
        <Part label="Tavsif" value={lang.descriptionScore} max={20} />
        <Part label="Kalit so'z" value={lang.keywordScore} max={40} />
      </dl>

      <div className="mt-3 space-y-1 text-xs">
        <Row
          label="Qamralgan"
          value={`${formatNumber(lang.coverageUsed)} / ${formatNumber(lang.coverageTotal)}`}
        />
        <Row label="Kalit so'z" value={`${lang.keywordsUsed} / ${lang.keywordsTotal}`} />
        <Row
          label="Nom"
          value={lang.titleLength ? `${lang.titleLength} belgi` : "yo'q"}
        />
        <Row
          label="Tavsif"
          value={lang.descriptionLength ? `${lang.descriptionLength} belgi` : "yo'q"}
        />
      </div>

      {lang.filled && !lang.scriptOk ? (
        <p className="mt-3 flex gap-1.5 text-xs text-amber-500">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Kartochkada bu til o&apos;rniga boshqa tildagi matn turibdi
            {lang.mirrorsOther ? " (ikkinchi tilning aynan nusxasi)" : ""} — bu tildagi
            so&apos;rov uni topmaydi. «AI matn» tabidan shu tilda matn yozdiring.
          </span>
        </p>
      ) : lang.missing.length ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Yetishmayapti:{" "}
          <span className="text-foreground">{lang.missing.slice(0, 3).join(", ")}</span>
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-500">
          <Check className="h-3.5 w-3.5" /> Yadro to&apos;liq ishlatilgan
        </p>
      )}
    </div>
  );
}

function Part({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{`${value}/${max}`}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
