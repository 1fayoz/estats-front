"use client";

import * as React from "react";
import { Check, Copy, ExternalLink, Loader2, RotateCcw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, saveSeoDraft } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SeoAudit } from "@/lib/types";

/** Uzum'dagi tovarni tahrirlash sahifasi. */
function uzumEditUrl(externalId: string | null): string | null {
  return externalId ? `https://seller.uzum.uz/seller/product/${externalId}/edit` : null;
}

type Field = "title_uz" | "title_ru" | "description_uz" | "description_ru";

const LABELS: Record<Field, string> = {
  title_uz: "Nom (UZ)",
  title_ru: "Nom (RU)",
  description_uz: "Tavsif (UZ)",
  description_ru: "Tavsif (RU)",
};

/**
 * Tovarni tuzatish.
 *
 * Matn Uzum'ga ILOVA ORQALI qo'yilmaydi: Uzum'ning yozish endpointlari
 * bizning tokenimizga yopiq (`RBAC: access denied`). Shuning uchun bu
 * yerda tayyor matn beriladi, uni tahrirlash mumkin, va nusxalab
 * Uzum'ning o'z tahrir sahifasiga qo'yiladi.
 *
 * "Qo'ydim" belgisi sotuvchining o'zi bosadi — uni tekshirib
 * bo'lmaydi, lekin qaysi tovar tuzatilgani ro'yxati baribir kerak.
 */
export function FixBlock({
  audit,
  externalId,
  onSaved,
}: {
  audit: SeoAudit;
  externalId: string | null;
  onSaved: (next: SeoAudit) => void;
}) {
  const made = audit.generated;
  const draft = audit.draft ?? {};
  const [values, setValues] = React.useState<Record<Field, string>>(() => ({
    title_uz: draft.title_uz ?? made?.title_uz ?? "",
    title_ru: draft.title_ru ?? made?.title_ru ?? "",
    description_uz: draft.description_uz ?? made?.description_uz ?? "",
    description_ru: draft.description_ru ?? made?.description_ru ?? "",
  }));
  const [saving, setSaving] = React.useState(false);
  const editUrl = uzumEditUrl(externalId);

  if (!made) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Avval &laquo;AI matn&raquo; bo&apos;limida yangi nom va tavsif
            yozdiring — tuzatish shundan keyin ochiladi.
          </p>
        </CardContent>
      </Card>
    );
  }

  const set = (field: Field, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const reset = (field: Field) => set(field, made[field] ?? "");

  const save = async (applied?: boolean) => {
    setSaving(true);
    try {
      onSaved(await saveSeoDraft(audit.productId, {
        titleUz: values.title_uz,
        titleRu: values.title_ru,
        descriptionUz: values.description_uz,
        descriptionRu: values.description_ru,
        applied,
      }));
      toast.success(applied === true ? "Belgilandi" : "Saqlandi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setSaving(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Nusxalandi");
    } catch {
      toast.error("Nusxalab bo'lmadi.");
    }
  };

  return (
    <div className="space-y-3">
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
          <div className="min-w-0 flex-1">
            <p className="font-medium">Uzum&apos;ga ilova o&apos;zi yoza olmaydi</p>
            <p className="mt-0.5 text-muted-foreground">
              Uzum tovarni o&apos;zgartirish huquqini API tokeniga bermaydi. Matnni
              shu yerda tayyorlab, nusxalab qo&apos;yasiz — bu bir necha soniya.
            </p>
          </div>
          {editUrl && (
            <a href={editUrl} target="_blank" rel="noreferrer">
              <Button size="sm" className="gap-1.5">
                Uzum&apos;da ochish <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      {(Object.keys(LABELS) as Field[]).map((field) => {
        const current =
          field === "title_uz" || field === "title_ru" ? audit.title : audit.description ?? "";
        const changed = values[field] !== (made[field] ?? "");
        return (
          <Card key={field}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {LABELS[field]}
                  {changed && <Badge variant="secondary">tahrirlangan</Badge>}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {values[field].length} belgi
                  </span>
                  {changed && (
                    <Button
                      variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs"
                      onClick={() => reset(field)}
                    >
                      <RotateCcw className="h-3 w-3" /> AI varianti
                    </Button>
                  )}
                  <Button
                    variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs"
                    onClick={() => copy(values[field])}
                  >
                    <Copy className="h-3 w-3" /> Nusxa
                  </Button>
                </div>
              </div>
              {field.startsWith("title") && (
                <CardDescription className="truncate">
                  {`Hozirgi: ${current}`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <textarea
                value={values[field]}
                onChange={(e) => set(field, e.target.value)}
                rows={field.startsWith("title") ? 2 : 7}
                className={cn(
                  "w-full resize-y rounded-md border bg-background p-2.5 text-sm outline-none",
                  "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
                )}
              />
            </CardContent>
          </Card>
        );
      })}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => save()} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Saqlash
        </Button>
        {audit.appliedAt ? (
          <Button variant="outline" onClick={() => save(false)} disabled={saving} className="gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
            {`Qo'yilgan: ${new Date(audit.appliedAt).toLocaleDateString("uz-UZ")}`}
          </Button>
        ) : (
          <Button variant="outline" onClick={() => save(true)} disabled={saving} className="gap-1.5">
            <Check className="h-4 w-4" /> Uzum&apos;ga qo&apos;ydim
          </Button>
        )}
        <span className="text-xs text-muted-foreground">
          <Sparkles className="mr-1 inline h-3 w-3" />
          Tahririgiz AI natijasining ustiga yozilmaydi — qayta yozdirsangiz ham qoladi.
        </span>
      </div>
    </div>
  );
}
