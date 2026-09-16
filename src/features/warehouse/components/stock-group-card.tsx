"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Info, Layers, Link2, Loader2, Pencil, Star, Unlink } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHead, CardList, CardStats, DataCard } from "@/components/dashboard/data-cards";
import { Input } from "@/components/ui/input";
import { ApiError, dissolveStockGroup, unlinkStockGroupMember, updateStockGroup } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StockGroup, StockGroupMember } from "@/lib/types";

/**
 * «Bir xil tovar» — Uzum'da ikki marta qo'yilgan bitta tovar.
 *
 * Kartaning butun ma'nosi bitta jumlada: TOKCHA bitta, E'LON ikkita.
 * Shuning uchun tepada umumiy raqamlar (qoldiq, kirim, necha kunga
 * yetadi), pastda esa har e'lon alohida — qaysi biri ko'proq sotayotgani
 * va Uzum omborida qaysi birida tovar qolmagani shu yerda ko'rinadi.
 */
export function StockGroupCard({
  group,
  onChanged,
  onAddMore,
}: {
  group: StockGroup;
  onChanged: () => void;
  onAddMore: () => void;
}) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const [renaming, setRenaming] = React.useState(false);
  const [title, setTitle] = React.useState(group.customTitle ?? "");

  React.useEffect(() => {
    setTitle(group.customTitle ?? "");
  }, [group.customTitle]);

  const run = async (key: string, action: () => Promise<unknown>, done: string) => {
    setBusy(key);
    try {
      await action();
      toast.success(done);
      onChanged();
    } catch (reason) {
      toast.error(reason instanceof ApiError ? reason.message : "Amal bajarilmadi.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" /> Bir xil tovar
              <Badge variant="secondary">{group.members.length} ta e&apos;lon</Badge>
            </CardTitle>
            <CardDescription className="mt-1.5 leading-relaxed">
              Ombor va kirim — <span className="font-medium text-foreground">umumiy</span>: bu
              e&apos;lonlar bitta tokchadan sotadi. Sotuv, voronka va qidiruvdagi o&apos;rin esa
              har e&apos;lon uchun alohida qoladi.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onAddMore}>
              <Link2 className="h-3.5 w-3.5" /> Yana e&apos;lon qo&apos;shish
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              disabled={busy !== null}
              onClick={() =>
                run("dissolve", () => dissolveStockGroup(group.id), "Guruh tarqatildi — har e'lon o'z kirimi bilan qoldi")
              }
            >
              {busy === "dissolve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
              Guruhni tarqatish
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Tile label="Umumiy qoldiq" value={`${formatNumber(group.onHand)} dona`} note={formatSum(group.stockValue)} />
          <Tile label="Jami keldi" value={`${formatNumber(group.intakeQuantity)} dona`} note="Barcha e'lonlar kirimi" />
          <Tile
            label={`Sotildi (${group.windowDays} kun)`}
            value={`${formatNumber(group.soldQuantity)} dona`}
            note={`Kuniga ${group.avgPerDay} dona`}
          />
          <Tile
            label="Qoldiq yetadi"
            value={group.daysOfStock === null ? "—" : `${group.daysOfStock} kun`}
            note={group.daysOfStock === null ? "Bu davrda sotuv bo'lmagan" : "Ikkala e'lon birga sotadi"}
            tone={group.daysOfStock !== null && group.daysOfStock <= 14 ? "warn" : undefined}
          />
        </div>

        {group.notes.length > 0 && (
          <ul className="space-y-1.5 rounded-xl border border-[var(--warn)]/25 bg-[var(--warn)]/5 p-3.5">
            {group.notes.map((note) => (
              <li key={note} className="flex items-start gap-2 text-xs leading-relaxed">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warn)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}

        {/* ── nom ── */}
        {renaming ? (
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void run("title", () => updateStockGroup(group.id, { title: title.trim() || null }), "Nom saqlandi")
                .then(() => setRenaming(false));
            }}
          >
            <Input
              value={title}
              autoFocus
              maxLength={255}
              placeholder={group.title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 max-w-sm rounded-xl"
              aria-label="Guruh nomi"
            />
            <Button type="submit" size="sm" className="h-11 rounded-xl" disabled={busy === "title"}>
              Saqlash
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-11 rounded-xl" onClick={() => setRenaming(false)}>
              Bekor qilish
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setRenaming(true)}
            className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="truncate">{group.title}</span>
            <span className="text-xs">— nomni o&apos;zgartirish</span>
          </button>
        )}

        {/* ── mobil: har e'lon bitta karta ── */}
        <CardList className="md:hidden">
          {group.members.map((member) => (
            <DataCard key={member.id} className={cn(member.isCurrent && "border-primary/50 bg-primary/5")}>
              <CardHead
                image={member.image ?? undefined}
                title={member.variantName || member.title}
                note={member.skuCode ?? undefined}
                right={<MemberBadges member={member} />}
              />
              <CardStats
                items={[
                  { label: `Sotildi (${group.windowDays} kun)`, value: `${formatNumber(member.soldQuantity)} dona` },
                  { label: "Ulush", value: `${member.share}%` },
                  { label: "Narx", value: member.price ? formatSum(member.price) : "—" },
                  { label: "Uzum qoldig'i", value: member.uzumStock === null ? "—" : formatNumber(member.uzumStock) },
                  { label: "Shu e'lon kirimi", value: `${formatNumber(member.intakeQuantity)} dona` },
                  { label: "Ajratilsa qoldiq", value: `${formatNumber(member.aloneOnHand)} dona` },
                ]}
              />
              <MemberActions
                group={group}
                member={member}
                busy={busy}
                run={run}
              />
            </DataCard>
          ))}
        </CardList>

        {/* ── desktop: yonma-yon jadval ── */}
        <div className="hidden overflow-x-auto rounded-xl border md:block">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">E&apos;lon</th>
                <th className="px-3 py-2 text-left font-medium">Holat</th>
                <th className="px-3 py-2 text-right font-medium">Narx</th>
                <th className="px-3 py-2 text-right font-medium">Uzum qoldig&apos;i</th>
                <th className="px-3 py-2 text-right font-medium">{group.windowDays} kun</th>
                <th className="px-3 py-2 text-right font-medium">Ulush</th>
                <th className="px-3 py-2 text-right font-medium">Shu e&apos;lon kirimi</th>
                <th className="px-3 py-2 text-right font-medium">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {group.members.map((member) => (
                <tr key={member.id} className={cn("transition-colors hover:bg-muted/30", member.isCurrent && "bg-primary/5")}>
                  <td className="px-3 py-2">
                    <div className="flex min-w-0 flex-col gap-1">
                      {member.isCurrent ? (
                        <span className="font-medium">{member.variantName || member.title}</span>
                      ) : (
                        <Link href={`/warehouse/${member.id}`} className="font-medium hover:underline">
                          {member.variantName || member.title}
                        </Link>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {member.externalProductId ? `Uzum ${member.externalProductId}` : member.skuCode ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2"><MemberBadges member={member} /></td>
                  <td className="px-3 py-2 text-right tabular-nums">{member.price ? formatSum(member.price) : "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {member.uzumStock === null ? "—" : formatNumber(member.uzumStock)}
                    {member.uzumDaysOfStock !== null && (
                      <span className="ml-1 text-xs text-muted-foreground">· {member.uzumDaysOfStock} kun</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatNumber(member.soldQuantity)} dona</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{member.share}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatNumber(member.intakeQuantity)}
                    <span className="ml-1 text-xs text-muted-foreground">({member.intakes} partiya)</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end">
                      <MemberActions group={group} member={member} busy={busy} run={run} compact />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Kirim qaysi e&apos;londa kiritilgan bo&apos;lsa o&apos;sha yerda qoladi — guruh ularni
          ko&apos;chirmaydi, faqat FIFO&apos;da birga hisoblaydi. Ajratsangiz har e&apos;lon
          &laquo;Ajratilsa qoldiq&raquo; ustunidagi holatga qaytadi.
        </p>
      </CardContent>
    </Card>
  );
}

function MemberBadges({ member }: { member: StockGroupMember }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {member.isPrimary && (
        <Badge variant="secondary" className="gap-1">
          <Star className="h-3 w-3" /> asosiy
        </Badge>
      )}
      <Badge variant={member.isSellable ? "outline" : "destructive"}>
        {member.isBlocked ? "bloklangan" : member.isArchived ? "arxiv" : member.status || "sotuvda"}
      </Badge>
    </span>
  );
}

function MemberActions({
  group,
  member,
  busy,
  run,
  compact,
}: {
  group: StockGroup;
  member: StockGroupMember;
  busy: string | null;
  run: (key: string, action: () => Promise<unknown>, done: string) => Promise<void>;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", !compact && "mt-3")}>
      {member.uzumUrl && (
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <a href={member.uzumUrl} target="_blank" rel="noreferrer" aria-label="Uzumda ochish">
            <ExternalLink className="h-3.5 w-3.5" /> Uzum
          </a>
        </Button>
      )}
      {!member.isPrimary && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          disabled={busy !== null}
          onClick={() =>
            run(
              `primary-${member.id}`,
              () => updateStockGroup(group.id, { primaryProductId: member.id }),
              "Asosiy e'lon o'zgartirildi",
            )
          }
        >
          {busy === `primary-${member.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
          Asosiy qilish
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground"
        disabled={busy !== null}
        onClick={() =>
          run(
            `unlink-${member.id}`,
            () => unlinkStockGroupMember(member.id),
            `Ajratildi — bu e'lon ${formatNumber(member.aloneOnHand)} dona bilan qoldi`,
          )
        }
      >
        {busy === `unlink-${member.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
        Ajratish
      </Button>
    </div>
  );
}

function Tile({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "warn";
}) {
  return (
    <div className={cn("min-w-0 rounded-xl border bg-card p-3", tone === "warn" && "border-[var(--warn)]/30 bg-[var(--warn)]/[.04]")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1.5 break-words text-base font-semibold tabular-nums">{value}</p>
      {note && <p className="mt-1 break-words text-[11px] leading-relaxed text-muted-foreground">{note}</p>}
    </div>
  );
}
