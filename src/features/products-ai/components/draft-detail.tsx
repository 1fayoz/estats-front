"use client";

import * as React from "react";
import {
  AlertTriangle, Check, Copy, ExternalLink, Loader2, RefreshCw, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePanel } from "@/features/products-ai/components/image-panel";
import {
  ApiError, approveAiDraft, deleteAiDraft, fetchAiPackage, patchAiDraft, retryAiDraft,
} from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import type { AiDraft } from "@/lib/types";

/**
 * Tayyor kartochka — tekshirish, tuzatish va tasdiqlash.
 *
 * Tuzilish uch qavat: yuqorida AMALLAR (ular har doim ko'rinib
 * turishi kerak — pastga aylantirib izlash noqulay), keyin
 * qisqa RAQAMLAR chizig'i, keyin bo'limlar tab bilan.
 *
 * Ilgari hamma narsa bitta uzun ustunda turardi: ikki tilning
 * matni, xususiyatlar, MXIK, kalit so'zlar va tugmalar — sahifa
 * uzayib ketib, nima qayerdaligi ko'rinmasdi.
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
  const [form, setForm] = React.useState(() => initial(draft));

  React.useEffect(() => {
    setForm(initial(draft));
  }, [draft.id, draft.updatedAt]);

  const locked = draft.stage === "approved";
  const dirty = (Object.keys(form) as (keyof typeof form)[]).some(
    (key) => form[key] !== initial(draft)[key]
  );

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
      {/* ── Amallar: har doim tepada ─────────────────────────── */}
      {/*
        `top-16`: yuqoridagi topbar ham yopishqoq va balandligi 4rem.
        `top-0` bo'lsa panelning birinchi qatori uning ostida qolib
        ketadi — tugmalar ko'rinmay qoladi.
      */}
      <div className="sticky top-16 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-background/95 p-2.5 shadow-sm backdrop-blur">
        <Badge variant={locked ? "success" : "secondary"} className="shrink-0">
          {draft.stageLabel}
        </Badge>
        <span className="mr-auto truncate text-sm font-medium">
          {draft.titleUz || "(nomsiz)"}
        </span>
        {!locked && (
          <Button
            size="sm"
            onClick={() =>
              act("save", async () => {
                onChange(await patchAiDraft(draft.id, form));
                toast.success("Saqlandi.");
              })
            }
            disabled={!dirty || busy === "save"}
            className="gap-1.5"
          >
            {busy === "save" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Saqlash
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={copyAll}
          disabled={busy === "copy"}
          className="gap-1.5"
        >
          {busy === "copy" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          Uzum uchun nusxalash
        </Button>
        {!locked && draft.progress >= 95 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              act("approve", async () => {
                onChange(await approveAiDraft(draft.id));
                toast.success("Tasdiqlandi — Uzumga ko'chirishga tayyor.");
              })
            }
            disabled={busy === "approve"}
            className="gap-1.5"
          >
            <Check className="h-3.5 w-3.5" /> Tasdiqlash
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            act("delete", async () => {
              await deleteAiDraft(draft.id);
              onDeleted();
              toast.success("O'chirildi.");
            })
          }
          disabled={busy === "delete"}
          className="text-destructive hover:text-destructive"
          aria-label="O'chirish"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {draft.error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
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
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Davom ettirish
          </Button>
        </div>
      )}

      {/* ── Raqamlar chizig'i ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="Tavsiya narx"
          value={form.suggestedPrice ? formatSum(form.suggestedPrice) : "—"}
        />
        <Stat
          label="Raqobatchi"
          value={draft.market?.rivals.length ? `${draft.market.rivals.length} ta` : "—"}
          note={
            draft.market?.rivals.length
              ? `${formatNumber(draft.market.priceMin ?? 0)}–${formatNumber(draft.market.priceMax ?? 0)}`
              : undefined
          }
        />
        <Stat label="Xususiyat" value={`${Object.keys(draft.attributes).length} ta`} />
        <Stat label="Kalit so'z" value={`${draft.keywords.length} ta`} />
      </div>

      {/* ── Rasmlar ──────────────────────────────────────────── */}
      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-sm font-semibold">Rasmlar</h2>
        <ImagePanel draft={draft} onChange={onChange} locked={locked} />
      </section>

      {/* ── Bo'limlar ────────────────────────────────────────── */}
      <Tabs defaultValue="uz" className="rounded-xl border p-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="uz">O&apos;zbekcha</TabsTrigger>
          <TabsTrigger value="ru">Ruscha</TabsTrigger>
          <TabsTrigger value="attrs">
            Xususiyatlar
            <span className="ml-1 rounded bg-background/70 px-1 text-[10px]">
              {Object.keys(draft.attributes).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="mxik">MXIK va narx</TabsTrigger>
          <TabsTrigger value="keywords">
            Kalit so&apos;zlar
            <span className="ml-1 rounded bg-background/70 px-1 text-[10px]">
              {draft.keywords.length}
            </span>
          </TabsTrigger>
          {draft.market?.rivals.length ? (
            <TabsTrigger value="market">Bozor</TabsTrigger>
          ) : null}
        </TabsList>

        {(["uz", "ru"] as const).map((lang) => (
          <TabsContent key={lang} value={lang} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Nom</Label>
              <Input
                value={lang === "uz" ? form.titleUz : form.titleRu}
                disabled={locked}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [lang === "uz" ? "titleUz" : "titleRu"]: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tavsif</Label>
              <textarea
                value={lang === "uz" ? form.descriptionUz : form.descriptionRu}
                disabled={locked}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [lang === "uz" ? "descriptionUz" : "descriptionRu"]: e.target.value,
                  }))
                }
                rows={10}
                className="w-full rounded-lg border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              />
            </div>
          </TabsContent>
        ))}

        <TabsContent value="attrs" className="mt-4">
          {Object.keys(draft.attributes).length ? (
            <dl className="divide-y text-sm">
              {Object.entries(draft.attributes).map(([name, value]) => (
                <div key={name} className="flex justify-between gap-4 py-2">
                  <dt className="text-muted-foreground">{name}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Hali to&apos;ldirilmagan.</p>
          )}
        </TabsContent>

        <TabsContent value="mxik" className="mt-4 space-y-4">
          {/*
            MXIK — soliq hujjatiga tushadigan kod. AI faqat TAXMIN
            qiladi va noto'g'risi soliq muammosi degani, shuning
            uchun bu yerda har doim rasmiy katalog havolasi turadi.
          */}
          <div className="space-y-1.5">
            <Label>MXIK kodi</Label>
            <Input
              value={form.mxik}
              disabled={locked}
              onChange={(e) => setForm((f) => ({ ...f, mxik: e.target.value }))}
              placeholder="17 xonali kod"
              inputMode="numeric"
              className="font-mono"
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
          <div className="space-y-1.5">
            <Label>Narx (so&apos;m)</Label>
            <Input
              type="number"
              value={form.suggestedPrice || ""}
              disabled={locked}
              onChange={(e) =>
                setForm((f) => ({ ...f, suggestedPrice: Number(e.target.value) || 0 }))
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="mt-4 flex flex-wrap gap-1.5">
          {draft.keywords.map((word) => (
            <Badge key={word} variant="secondary" className="font-normal">
              {word}
            </Badge>
          ))}
        </TabsContent>

        {draft.market?.rivals.length ? (
          <TabsContent value="market" className="mt-4">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Tovar</th>
                  <th className="py-2 text-right font-medium">Buyurtma</th>
                  <th className="py-2 text-right font-medium">Narx</th>
                </tr>
              </thead>
              <tbody>
                {draft.market.rivals.map((rival, i) => (
                  <tr key={`${rival.url}-${i}`} className="border-b last:border-0">
                    <td className="max-w-0 truncate py-2 pr-3">
                      {rival.url ? (
                        <a
                          href={rival.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {rival.title}
                        </a>
                      ) : (
                        rival.title
                      )}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatNumber(rival.orders)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {rival.price ? formatNumber(rival.price) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
        ) : null}
      </Tabs>

      {locked && (
        <p className="text-xs text-muted-foreground">
          Tasdiqlangan qoralama tahrirlanmaydi. Uzumda mahsulot yaratish API&apos;si
          yo&apos;q — matnni nusxalab, Uzum panelida joylang.
        </p>
      )}
    </div>
  );
}

function initial(draft: AiDraft) {
  return {
    titleUz: draft.titleUz ?? "",
    titleRu: draft.titleRu ?? "",
    descriptionUz: draft.descriptionUz ?? "",
    descriptionRu: draft.descriptionRu ?? "",
    mxik: draft.mxik ?? "",
    suggestedPrice: draft.suggestedPrice ?? 0,
  };
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
      {note && <div className="text-[10px] tabular-nums text-muted-foreground">{note}</div>}
    </div>
  );
}
