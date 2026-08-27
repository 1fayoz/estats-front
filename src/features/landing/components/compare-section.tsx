import { Check, Minus, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Mark = "yes" | "no" | "partly";

const COLUMNS = ["Uzum kabineti", "Analitika servisi", "eStats"] as const;

const ROWS: { label: string; marks: [Mark, Mark, Mark]; note?: string }[] = [
  { label: "Sotuv va buyurtmalar", marks: ["yes", "no", "yes"] },
  { label: "Komissiya va logistika", marks: ["yes", "no", "yes"] },
  {
    label: "Tan narx bilan sof foyda",
    marks: ["no", "no", "yes"],
    note: "Uzum sizning tan narxingizni bilmaydi",
  },
  { label: "FIFO — partiya bo'yicha tan narx", marks: ["no", "no", "yes"] },
  { label: "Doimiy xarajatlar taqsimoti", marks: ["no", "no", "yes"] },
  { label: "Kalit so'zlar yadrosi", marks: ["no", "partly", "yes"] },
  {
    label: "O'zbekcha va ruscha alohida o'lchov",
    marks: ["no", "no", "yes"],
    note: "Faqat eStats'da",
  },
  { label: "Qidiruvdagi o'rin kuzatuvi", marks: ["no", "yes", "yes"] },
  { label: "Sharh va rasm tahlili (AI)", marks: ["no", "no", "yes"] },
  { label: "Ijtimoiy tarmoqqa e'lon", marks: ["no", "no", "yes"] },
];

export function CompareSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          Nega eStats
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Ikkita servis o&apos;rniga bitta kabinet
        </h2>
        <p className="mt-4 text-muted-foreground">
          Bugun sotuvchi sonni Uzum kabinetidan, tahlilni boshqa servisdan oladi.
          Ma&apos;lumot bir-biriga ulanmaydi va haqiqiy foydani hech biri
          ko&apos;rsatmaydi — chunki tan narxni faqat siz bilasiz.
        </p>
      </div>

      {/* Telefonda: har imkoniyat — kartochka, uch servis yonma-yon
          belgi bilan. Uch ustunli jadval 390px da o'qib bo'lmaydi. */}
      <div className="mt-10 space-y-2.5 md:hidden">
        {ROWS.map((row) => (
          <div key={row.label} className="rounded-xl border bg-card p-4">
            <div className="text-sm font-medium">{row.label}</div>
            {row.note ? (
              <div className="mt-0.5 text-xs text-muted-foreground">{row.note}</div>
            ) : null}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {row.marks.map((mark, index) => (
                <div
                  key={COLUMNS[index]}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg px-1 py-2",
                    index === COLUMNS.length - 1 && "bg-primary/5"
                  )}
                >
                  <MarkIcon mark={mark} />
                  <span
                    className={cn(
                      "text-center text-[10px] leading-tight",
                      index === COLUMNS.length - 1
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {COLUMNS[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 hidden overflow-x-auto rounded-2xl border bg-card md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Imkoniyat
              </th>
              {COLUMNS.map((column, index) => (
                <th
                  key={column}
                  className={cn(
                    "px-5 py-4 text-center text-xs font-medium uppercase tracking-widest",
                    index === COLUMNS.length - 1
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <td className="px-5 py-3.5">
                  <span className="font-medium">{row.label}</span>
                  {row.note ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">{row.note}</span>
                  ) : null}
                </td>
                {row.marks.map((mark, index) => (
                  <td
                    key={COLUMNS[index]}
                    className={cn(
                      "px-5 py-3.5 text-center",
                      index === COLUMNS.length - 1 && "bg-primary/5"
                    )}
                  >
                    <MarkIcon mark={mark} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MarkIcon({ mark }: { mark: Mark }) {
  if (mark === "yes") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/12">
        <Check className="h-3.5 w-3.5 text-success" />
        <span className="sr-only">bor</span>
      </span>
    );
  }
  if (mark === "partly") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-warning/15">
        <Minus className="h-3.5 w-3.5 text-warning" />
        <span className="sr-only">qisman</span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted">
      <X className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="sr-only">yo&apos;q</span>
    </span>
  );
}
