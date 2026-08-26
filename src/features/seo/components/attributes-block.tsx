"use client";

import { AlertTriangle, Check, ExternalLink, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SeoAttributes } from "@/lib/types";

/**
 * Xususiyatlar — Uzum qidiruvidagi FILTRLAR shular bo'yicha ishlaydi.
 *
 * Xaridor "rangi: oq" deb belgilaganda, rangi ko'rsatilmagan tovar
 * ro'yxatdan butunlay chiqib ketadi — kalit so'zlari qanchalik yaxshi
 * bo'lishidan qat'i nazar. Shuning uchun bu bo'lim ballga kiradi.
 */
export function AttributesBlock({
  attributes,
  editUrl,
}: {
  attributes: SeoAttributes | null;
  editUrl: string | null;
}) {
  if (!attributes || attributes.total === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
          <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
          <p className="max-w-md text-sm text-muted-foreground">
            Xususiyatlar ro&apos;yxati olinmadi. Uzum bozor tokeni eskirgan
            bo&apos;lishi mumkin — Integratsiyalar sahifasida yangilang va
            tahlilni qayta yuriting.
          </p>
        </CardContent>
      </Card>
    );
  }

  const missing = attributes.rows.filter((r) => !r.filled);
  const filled = attributes.rows.filter((r) => r.filled);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                {`Xususiyatlar: ${attributes.filled}/${attributes.total}`}
              </CardTitle>
              <CardDescription>
                Uzum qidiruvidagi filtrlar shular bo&apos;yicha ishlaydi.
                To&apos;ldirilmagan xususiyat — butun bir filtrdan tushib qolish.
              </CardDescription>
            </div>
            {editUrl && missing.length > 0 && (
              <a href={editUrl} target="_blank" rel="noreferrer">
                <Button size="sm" className="gap-1.5">
                  Uzum&apos;da to&apos;ldirish <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                attributes.score >= 90
                  ? "bg-emerald-500"
                  : attributes.score >= 60
                    ? "bg-amber-500"
                    : "bg-destructive",
              )}
              style={{ width: `${attributes.score}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {missing.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              {`To'ldirilmagan: ${missing.length} ta`}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {missing.map((row) => (
              <Badge key={row.title} variant="warning">{row.title}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {filled.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">To&apos;ldirilgan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {filled.map((row) => (
              <div key={row.title} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {row.title}
                </span>
                <span className="shrink-0 text-right text-xs">
                  {row.values.join(", ")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
