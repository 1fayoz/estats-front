"use client";

import * as React from "react";
import {
  AlertTriangle, Check, Copy, ExternalLink, Loader2, RefreshCw, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ApiError, approveAiDraft, deleteAiDraft, fetchAiPackage, mediaUrl,
  patchAiDraft, retryAiDraft,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { AiDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Tayyor kartochka — tekshirish, tuzatish va tasdiqlash.
 *
 * AI matni bu yerda TAHRIRLANADI. U yaxshi boshlang'ich nuqta,
 * lekin oxirgi so'z sotuvchida: u tovarini AI'dan yaxshi biladi.
 */
export function DraftDetail({
  draft,
  onChange,
  onDeleted,
}: {
  draft: AiDraft;
  onChange: (draft: AiDraft) => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = React.useState<string>("");
  const [form, setForm] = React.useState({
    titleUz: draft.titleUz ?? "",
    titleRu: draft.titleRu ?? "",
    descriptionUz: draft.descriptionUz ?? "",
    descriptionRu: draft.descriptionRu ?? "",
    mxik: draft.mxik ?? "",
    suggestedPrice: draft.suggestedPrice ?? 0,
  });

  React.useEffect(() => {
    setForm({
      titleUz: draft.titleUz ?? "",
      titleRu: draft.titleRu ?? "",
      descriptionUz: draft.descriptionUz ?? "",
      descriptionRu: draft.descriptionRu ?? "",
      mxik: draft.mxik ?? "",
      suggestedPrice: draft.suggestedPrice ?? 0,
    });
  }, [draft.id, draft.updatedAt]);

  const locked = draft.stage === "approved";
  const dirty =
    form.titleUz !== (draft.titleUz ?? "") ||
    form.titleRu !== (draft.titleRu ?? "") ||
    form.descriptionUz !== (draft.descriptionUz ?? "") ||
    form.descriptionRu !== (draft.descriptionRu ?? "") ||
    form.mxik !== (draft.mxik ?? "") ||
    form.suggestedPrice !== (draft.suggestedPrice ?? 0);

  const act = async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    try {
      await fn();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setBusy("");
    }
  };

  const save = () =>
    act("save", async () => {
      onChange(await patchAiDraft(draft.id, form));
      toast.success("Saqlandi.");
    });

  const approve = () =>
    act("approve", async () => {
      onChange(await approveAiDraft(draft.id));
      toast.success("Tasdiqlandi — Uzumga ko'chirishga tayyor.");
    });

  const copyAll = () =>
    act("copy", async () => {
      const pkg = await fetchAiPackage(draft.id);
      await navigator.clipboard.writeText(pkg.plainText);
      toast.success(
        pkg.missing.length
          ? `Nusxalandi. Yetishmaydi: ${pkg.missing.join(", ")}`
          : "Hammasi nusxalandi."
      );
    });

  return (
    <div className="space-y-4">
      {draft.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <div className="font-medium">Quvur to&apos;xtadi</div>
            <p className="text-muted-foreground">{draft.error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              act("retry", async () => {
                onChange(await retryAiDraft(draft.id));
                toast.success("Davom ettirilmoqda.");
              })
            }
            disabled={busy === "retry"}
          >
            {busy === "retry" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Davom ettirish
          </Button>
        </div>
      )}

      {/* ── Rasmlar ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Rasmlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {draft.images.map((url) => (
              <figure key={url} className="space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(url)}
                  alt="AI yasagan rasm"
                  className="h-28 w-28 rounded-lg border object-cover"
                />
                <figcaption className="text-center text-[10px] text-primary">AI</figcaption>
              </figure>
            ))}
            {draft.sourceImages.map((url) => (
              <figure key={url} className="space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(url)}
                  alt="Yuklangan rasm"
                  className="h-28 w-28 rounded-lg border object-cover opacity-80"
                />
                <figcaption className="text-center text-[10px] text-muted-foreground">
                  asl
                </figcaption>
              </figure>
            ))}
          </div>

          {draft.imageNote && (
            <p className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
              {draft.imageNote}
            </p>
          )}

          {draft.imageChecks.length > 0 && (
            <div className="space-y-1">
              {draft.imageChecks.map((check) => (
                <div key={check.index} className="flex items-start gap-2 text-xs">
                  <Badge variant={check.accepted ? "default" : "secondary"}>
                    {check.score}/10
                  </Badge>
                  <span className="text-muted-foreground">
                    {check.accepted
                      ? "qabul qilindi"
                      : check.problems.join("; ") || check.error}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Matn ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Kartochka matni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["uz", "ru"] as const).map((lang) => (
            <div key={lang} className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                {lang === "uz" ? "O'zbekcha" : "Ruscha"}
              </div>
              <Input
                value={lang === "uz" ? form.titleUz : form.titleRu}
                disabled={locked}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [lang === "uz" ? "titleUz" : "titleRu"]: e.target.value,
                  }))
                }
                placeholder="Nom"
              />
              <textarea
                value={lang === "uz" ? form.descriptionUz : form.descriptionRu}
                disabled={locked}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [lang === "uz" ? "descriptionUz" : "descriptionRu"]: e.target.value,
                  }))
                }
                rows={5}
                className="w-full rounded-lg border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                placeholder="Tavsif"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Xususiyatlar va MXIK ────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Xususiyatlar</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(draft.attributes).length ? (
              <dl className="space-y-1.5 text-sm">
                {Object.entries(draft.attributes).map(([name, value]) => (
                  <div key={name} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{name}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Hali to&apos;ldirilmagan.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">MXIK va narx</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/*
              MXIK — soliq hujjatiga tushadigan kod. AI faqat TAXMIN
              qiladi va noto'g'risi soliq muammosi degani, shuning
              uchun bu yerda har doim rasmiy katalog havolasi turadi.
            */}
            <div className="space-y-1.5">
              <Input
                value={form.mxik}
                disabled={locked}
                onChange={(e) => setForm((f) => ({ ...f, mxik: e.target.value }))}
                placeholder="17 xonali MXIK kodi"
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground">
                {draft.mxikName ? `Taxminiy turkum: ${draft.mxikName}. ` : ""}
                Kod <b>taxmin</b> — rasmiy katalogda tasdiqlang.
              </p>
              {draft.mxikCheckUrl && (
                <a
                  href={draft.mxikCheckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> tasnif.soliq.uz da tekshirish
                </a>
              )}
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Input
                type="number"
                value={form.suggestedPrice || ""}
                disabled={locked}
                onChange={(e) =>
                  setForm((f) => ({ ...f, suggestedPrice: Number(e.target.value) || 0 }))
                }
                placeholder="Narx (so'm)"
              />
              {/*
                Shart RAQOBATCHI soniga qarab qo'yilgan, narxga emas:
                bozor topilmaganda `priceMin` nol bo'lib keladi va
                "0 — 0 so'm" degan yolg'on oraliq ko'rinardi.
              */}
              {draft.market && draft.market.rivals.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Raqobatchilar: {formatNumber(draft.market.priceMin ?? 0)} —{" "}
                  {formatNumber(draft.market.priceMax ?? 0)} so&apos;m (
                  {draft.market.rivals.length} ta tovar)
                </p>
              ) : draft.market?.error ? (
                <p className="text-xs text-amber-600">
                  Bozor o&apos;rganilmadi: {draft.market.error}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Kalit so'zlar ───────────────────────────────────── */}
      {draft.keywords.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              Kalit so&apos;zlar ({draft.keywords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {draft.keywords.map((word) => (
              <Badge key={word} variant="secondary" className="font-normal">
                {word}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Amallar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {!locked && (
          <Button onClick={save} disabled={!dirty || busy === "save"}>
            {busy === "save" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Saqlash
          </Button>
        )}
        <Button variant="outline" onClick={copyAll} disabled={busy === "copy"}>
          {busy === "copy" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          Uzum uchun nusxalash
        </Button>
        {!locked && draft.progress >= 95 && (
          <Button variant="secondary" onClick={approve} disabled={busy === "approve"}>
            {busy === "approve" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Tasdiqlash
          </Button>
        )}
        <Button
          variant="ghost"
          className="ml-auto text-destructive"
          onClick={() =>
            act("delete", async () => {
              await deleteAiDraft(draft.id);
              onDeleted();
              toast.success("O'chirildi.");
            })
          }
          disabled={busy === "delete"}
        >
          <Trash2 className="h-3.5 w-3.5" /> O&apos;chirish
        </Button>
      </div>

      {locked && (
        <p className={cn("text-xs text-muted-foreground")}>
          Tasdiqlangan qoralama tahrirlanmaydi. Uzumda mahsulot yaratish API&apos;si
          yo&apos;q — matnni nusxalab, Uzum panelida joylang.
        </p>
      )}
    </div>
  );
}
