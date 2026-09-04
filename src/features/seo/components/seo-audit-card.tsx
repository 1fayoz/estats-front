"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Search } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/features/seo/components/score-ring";
import { ApiError, fetchSeoAudit } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { SeoAudit } from "@/lib/types";

/**
 * Tovar sahifasidagi SEO auditning ENG OXIRGI natijasi — qisqacha.
 *
 * To'liq tahlil (kalit so'zlar jadvali, tillar, rasm/sharh tahlili)
 * `/seo/{id}`da turadi — buni bu yerga ko'chirish ombor sahifasini
 * ikkinchi SEO sahifasiga aylantirardi. Bu yerda faqat javob kerak
 * bo'ladigan savol: "bu kartochka SEO nuqtai nazaridan qanday holatda,
 * va oxirgi marta QACHON tekshirilgan?" — qolgani havola orqali.
 *
 * `GET /seo/{id}` chaqiruvi arzon: tahlil yo'q bo'lsa BO'SH yozuv
 * qaytaradi (AI ISHGA TUSHMAYDI, hech narsa hisoblanmaydi) — shu
 * sabab bu karta har ochilishda so'ralishi xavfsiz.
 */
export function SeoAuditCard({ productId }: { productId: number }) {
  const [audit, setAudit] = React.useState<SeoAudit | null>(null);
  const [loading, setLoading] = React.useState(true);
  /** Ruxsati yo'q (403) — karta umuman ko'rsatilmaydi. */
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSeoAudit(productId)
      .then((a) => {
        if (!cancelled) setAudit(a);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) setHidden(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading || hidden) return null;
  if (!audit) return null;

  const analyzed = Boolean(audit.analyzedAt);
  const warnings = audit.verdicts.flatMap((v) => v.warnings).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="h-4 w-4" /> SEO audit
        </CardTitle>
        <CardDescription>
          {analyzed
            ? `Oxirgi tekshiruv: ${formatDate(audit.analyzedAt as string)}`
            : "Bu tovar hali SEO auditidan o'tmagan."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analyzed ? (
          <div className="flex flex-wrap items-center gap-4">
            <ScoreRing score={audit.score} size={64} />
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">
                Kalit so'z: {audit.keywordsUsed}/{audit.keywordsTotal}
              </Badge>
              <Badge variant="outline">
                Yadro qamrovi: {audit.coverageUsed}/{audit.coverageTotal}
              </Badge>
              {audit.coverageMissed > 0 && (
                <Badge variant="secondary">{audit.coverageMissed} ta o'tkazib yuborilgan</Badge>
              )}
            </div>
            {warnings.length > 0 ? (
              <ul className="w-full space-y-1 text-sm text-muted-foreground">
                {warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            ) : (
              <div className="flex w-full items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Muhim kamchilik topilmadi.
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tahlil «SEO audit» sahifasida ishga tushiriladi (kalit so'z yadrosi yig'iladi —
            tashqi so'rovlar ketadi, shuning uchun avtomatik emas).
          </p>
        )}
        <Link
          href={`/seo/${productId}`}
          className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {analyzed ? "To'liq tahlilni ko'rish" : "SEO auditga o'tish"}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
