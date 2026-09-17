"use client";

import * as React from "react";
import { ChevronDown, Copy, Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError, dismissDuplicate, fetchDuplicateSuggestions, linkStockGroup } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DuplicateSuggestion } from "@/lib/types";

import { CardSummary } from "./link-duplicate-dialog";

/**
 * «Bu tovarni ikki marta qo'ygan bo'lishingiz mumkin».
 *
 * Sotuvchi o'zi ham bilmasligi mumkin: eski kartochka bloklangach yangisi
 * ochilgan, keyin ikkalasi ham sotilaveradi — ombor esa ikkiga bo'linib
 * ketadi (bir e'londa "tan narx kiritilmagan", ikkinchisida ortiqcha
 * qoldiq). Shuning uchun taklif o'zi chiqadi.
 *
 * Hech narsa avtomatik bog'lanmaydi: bir xil tovarning ikki RANGI ham
 * o'xshash ko'rinadi, va noto'g'ri bog'lash ombor hisobini buzadi.
 * Rad etilgani eslab qolinadi — ro'yxat qayta to'lib ketmaydi.
 */
export function DuplicateSuggestions({
  canLink,
  onChanged,
}: {
  canLink: boolean;
  onChanged: () => void;
}) {
  const [rows, setRows] = React.useState<DuplicateSuggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());

  const load = React.useCallback(() => {
    fetchDuplicateSuggestions()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const key = (row: DuplicateSuggestion) =>
    `${row.a.externalProductId ?? row.a.variants[0]?.id}-${row.b.externalProductId ?? row.b.variants[0]?.id}`;

  const visible = rows.filter((row) => !row.alreadyLinked && !hidden.has(key(row)));
  if (!visible.length) return null;

  const act = async (row: DuplicateSuggestion, what: "link" | "dismiss") => {
    setBusy(key(row));
    try {
      if (what === "link") {
        await linkStockGroup(row.pairs);
        toast.success("Bir xil tovar deb belgilandi — kirim va qoldiq endi umumiy");
        onChanged();
      } else {
        await dismissDuplicate([row.a.variants[0].id, row.b.variants[0].id]);
      }
      setHidden((prev) => new Set(prev).add(key(row)));
    } catch (reason) {
      toast.error(reason instanceof ApiError ? reason.message : "Amal bajarilmadi.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section
      aria-label="Ehtimoliy takrorlar"
      className="min-w-0 rounded-2xl border border-[var(--warn)]/30 bg-[var(--warn)]/[.04]"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center gap-3 p-3.5 text-left sm:p-4"
      >
        <Copy className="h-4 w-4 shrink-0 text-[var(--warn)]" />
        <span className="min-w-0 flex-1">
          {/* Ko'p qatorli matn tugunining boshidagi bo'shliq YEYILADI
              (§9.18) — "3ta tovar" bo'lib chiqqan edi. Butun jumla bitta
              satr sifatida beriladi. */}
          <span className="block text-sm font-medium">
            {`${visible.length} ta tovar ikki marta qo'yilgan bo'lishi mumkin`}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            Bir xil deb belgilasangiz kirim va qoldiq umumiy bo&apos;ladi, statistika alohida qoladi.
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-3 border-t p-3.5 sm:p-4">
          {visible.map((row) => (
            <div key={key(row)} className="space-y-3 rounded-xl border bg-card p-3.5">
              <div className="grid gap-3 md:grid-cols-2">
                <CardSummary card={row.a} />
                <CardSummary card={row.b} reasons={row.reasons} score={row.score} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  {row.pairs.length > 1
                    ? `${row.pairs.length} ta variant rangi bo'yicha juftlanadi`
                    : "Ikkala e'lon bitta omborni bo'lishadi"}
                </span>
                {canLink && <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    disabled={busy !== null}
                    onClick={() => void act(row, "dismiss")}
                  >
                    <X className="h-3.5 w-3.5" /> Yo&apos;q, boshqa tovar
                  </Button>
                  {(
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={busy !== null || row.pairs.length === 0}
                      onClick={() => void act(row, "link")}
                    >
                      {busy === key(row) ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Link2 className="h-3.5 w-3.5" />
                      )}
                      Bir xil tovar
                    </Button>
                  )}
                </div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
