"use client";

import * as React from "react";
import { ChevronDown, Scale } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PnlTotals } from "@/lib/types";

/**
 * eStats raqamlarini Uzum kabineti bilan solishtirish zanjiri.
 *
 * Sotuvchi ikkita ekranni yonma-yon ochib, raqamlar boshqacha
 * ekanini ko'radi va tabiiy ravishda "qaysi biri yolg'on?" deb
 * o'ylaydi. Aslida ikkalasi ham to'g'ri — shunchaki BOSHQA
 * narsani sanaydi:
 *
 * * Uzum «Daromad» — xaridor to'lagan summa (bizda «savdo»);
 * * Uzum «Foyda» — undan faqat KOMISSIYA ayirilgan;
 * * bizdagi «Uzum to'lovi» — logistika ham ayirilgan, ya'ni
 *   hisobingizga haqiqatan tushadigan pul;
 * * «Sof foyda» — undan tan narx ham ayirilgan.
 *
 * Shuning uchun zanjir bosqichma-bosqich ko'rsatiladi va har
 * bosqichda Uzumdagi qaysi raqamga mos kelishi aytiladi. Odam
 * o'z ko'zi bilan tekshira oladi — bu "ishoning" deyishdan
 * ancha kuchli.
 */
export function UzumReconcile({ totals }: { totals: PnlTotals }) {
  const [open, setOpen] = React.useState(false);

  const steps = [
    {
      label: "Savdo",
      value: totals.gross,
      note: "Uzum kabinetidagi «Daromad»",
      match: true,
    },
    {
      label: "− Uzum komissiyasi",
      value: -totals.commission,
      note: "shundan keyingi qoldiq = Uzumdagi «Foyda»",
      match: false,
    },
    {
      label: "− Yetkazib berish",
      value: -totals.logistics,
      note: "Uzum «Foyda» kartochkasi buni ayirmaydi",
      match: false,
    },
    {
      label: "Uzum to'lovi",
      value: totals.revenue,
      note: "hisobingizga tushadigan pul",
      match: true,
    },
    {
      label: "− Tan narx (FIFO)",
      value: -totals.cogs,
      note: "Uzum tan narxni bilmaydi — bu faqat bizda bor",
      match: false,
    },
    {
      label: "Sof foyda",
      value: totals.profit,
      note: "qo'lda qoladigan pul",
      match: true,
    },
  ];

  // Uzumdagi «Foyda» kartochkasi ko'rsatadigan raqam — sotuvchi
  // aynan shuni izlaydi, shuning uchun tayyor holda beriladi.
  const uzumProfit = totals.gross - totals.commission;

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-accent/50 sm:px-6"
      >
        <Scale className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">
            Uzum kabineti bilan solishtirish
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {/* `{" "}` — JSX qator ko'chishida ifoda yonidagi bo'shliqni
                yutadi va matn "so'mbo'lishi" bo'lib qo'shilib ketardi. */}
            Uzumdagi «Foyda» {formatSum(uzumProfit)}{" "}
            bo&apos;lishi kerak — bizdagi farq yetkazib berish va tan narx
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <CardContent className="border-t pt-4">
          <dl className="space-y-2.5">
            {steps.map((step) => (
              <div
                key={step.label}
                className={cn(
                  "flex flex-wrap items-baseline gap-x-3 gap-y-0.5",
                  step.match && "font-medium"
                )}
              >
                <dt className="min-w-0 flex-1 text-sm">{step.label}</dt>
                <dd className="shrink-0 text-sm tabular-nums">
                  {formatSum(step.value)}
                </dd>
                <dd className="w-full text-xs text-muted-foreground">
                  {step.note}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
            Bugungi raqamlar biroz farq qilishi mumkin: Uzumdan sotuvlar har 20
            daqiqada tortiladi, shu oraliqda tushgan buyurtmalar hali bu yerda
            ko&apos;rinmaydi. Yopilgan kunlar so&apos;mma-so&apos;m mos keladi.
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
