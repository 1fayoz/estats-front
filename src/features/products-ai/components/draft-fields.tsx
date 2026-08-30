"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePanel } from "@/features/products-ai/components/image-panel";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

/**
 * Tahrirlanadigan maydonlar. Modal ushlab turadi, chunki
 * "Saqlash" tugmasi oynaning ost qismida — Bitrix naqshi.
 */
export interface DraftForm {
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
  mxik: string;
  suggestedPrice: number;
}

export function initialForm(draft: AiDraft): DraftForm {
  return {
    titleUz: draft.titleUz ?? "",
    titleRu: draft.titleRu ?? "",
    descriptionUz: draft.descriptionUz ?? "",
    descriptionRu: draft.descriptionRu ?? "",
    mxik: draft.mxik ?? "",
    suggestedPrice: draft.suggestedPrice ?? 0,
  };
}

export type DraftTabKey = "general" | "ru" | "images" | "attrs" | "keywords" | "market";

/**
 * Tab qatori — namunadagi «Общие · Товары · Предложения …» kabi.
 *
 * Bo'sh tab ATAYLAB o'chirilgan holda qoladi, yashirilmaydi:
 * quvur hali u yergacha yetmagani ko'rinib tursin. Yashirilsa,
 * tablar quvur ishlagan sayin sakrab paydo bo'lardi va "u yerda
 * nima bor edi" degan savol tug'ilardi.
 */
export function DraftTabs({
  draft,
  tab,
  onTab,
}: {
  draft: AiDraft | null;
  tab: DraftTabKey;
  onTab: (tab: DraftTabKey) => void;
}) {
  const tabs: { key: DraftTabKey; label: string; count?: number; ready: boolean }[] = [
    { key: "general", label: "Umumiy", ready: Boolean(draft) },
    { key: "ru", label: "Ruscha", ready: Boolean(draft?.titleRu) },
    {
      key: "images",
      label: "Rasmlar",
      count: (draft?.images.length ?? 0) + (draft?.sourceImages.length ?? 0),
      ready: Boolean(draft),
    },
    {
      key: "attrs",
      label: "Xususiyatlar",
      count: Object.keys(draft?.attributes ?? {}).length,
      ready: Object.keys(draft?.attributes ?? {}).length > 0,
    },
    {
      key: "keywords",
      label: "Kalit so'zlar",
      count: draft?.keywords.length ?? 0,
      ready: (draft?.keywords.length ?? 0) > 0,
    },
    {
      key: "market",
      label: "Bozor",
      count: draft?.market?.rivals.length ?? 0,
      ready: (draft?.market?.rivals.length ?? 0) > 0,
    },
  ];

  return (
    <div className="-mx-1 flex flex-wrap items-center gap-1 overflow-x-auto">
      {tabs.map((item) => (
        <button
          key={item.key}
          type="button"
          disabled={!item.ready}
          onClick={() => onTab(item.key)}
          className={cn(
            "whitespace-nowrap rounded-lg px-3 py-1.5 text-[13.5px] transition-colors",
            tab === item.key
              ? "bg-primary/12 font-medium text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            !item.ready && "cursor-default opacity-40 hover:bg-transparent",
          )}
        >
          {item.label}
          {item.count ? (
            <span className="ml-1 text-[11px] tabular-nums opacity-70">{item.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/**
 * Tanlangan tabning ichi.
 *
 * AI matni bu yerda TAHRIRLANADI. U yaxshi boshlang'ich nuqta,
 * lekin oxirgi so'z sotuvchida: u tovarini AI'dan yaxshi biladi.
 */
export function DraftFields({
  draft,
  tab,
  form,
  onForm,
  locked,
  onChange,
}: {
  draft: AiDraft;
  tab: DraftTabKey;
  form: DraftForm;
  onForm: React.Dispatch<React.SetStateAction<DraftForm>>;
  locked: boolean;
  onChange: (draft: AiDraft) => void;
}) {
  if (tab === "images") {
    return <ImagePanel draft={draft} onChange={onChange} locked={locked} />;
  }

  if (tab === "attrs") {
    return Object.keys(draft.attributes).length ? (
      <dl className="divide-y text-sm">
        {Object.entries(draft.attributes).map(([name, value]) => (
          <div key={name} className="flex justify-between gap-4 py-2">
            <dt className="text-muted-foreground">{name}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    ) : (
      <Empty />
    );
  }

  if (tab === "keywords") {
    return draft.keywords.length ? (
      <div className="flex flex-wrap gap-1.5">
        {draft.keywords.map((word) => (
          <Badge key={word} variant="secondary" className="font-normal">
            {word}
          </Badge>
        ))}
      </div>
    ) : (
      <Empty />
    );
  }

  if (tab === "market") {
    return draft.market?.rivals.length ? (
      <table className="w-full text-xs">
        <thead className="text-muted-foreground">
          <tr className="border-b">
            <th className="py-2 text-left font-medium">Tovar</th>
            <th className="py-2 text-right font-medium">Buyurtma</th>
            <th className="py-2 text-right font-medium">Narx</th>
          </tr>
        </thead>
        <tbody>
          {draft.market.rivals.map((rival, index) => (
            <tr key={`${rival.url}-${index}`} className="border-b last:border-0">
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
              <td className="py-2 text-right tabular-nums">{formatNumber(rival.orders)}</td>
              <td className="py-2 text-right tabular-nums">
                {rival.price ? formatNumber(rival.price) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <Empty />
    );
  }

  const uz = tab === "general";
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nom {uz ? "(o'zbekcha)" : "(ruscha)"}</Label>
        <Input
          value={uz ? form.titleUz : form.titleRu}
          disabled={locked}
          onChange={(e) =>
            onForm((f) => ({ ...f, [uz ? "titleUz" : "titleRu"]: e.target.value }))
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label>Tavsif {uz ? "(o'zbekcha)" : "(ruscha)"}</Label>
        <textarea
          value={uz ? form.descriptionUz : form.descriptionRu}
          disabled={locked}
          onChange={(e) =>
            onForm((f) => ({
              ...f,
              [uz ? "descriptionUz" : "descriptionRu"]: e.target.value,
            }))
          }
          rows={9}
          className="w-full rounded-lg border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
      </div>

      {uz && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Narx (so&apos;m)</Label>
            <Input
              type="number"
              value={form.suggestedPrice || ""}
              disabled={locked}
              onChange={(e) =>
                onForm((f) => ({ ...f, suggestedPrice: Number(e.target.value) || 0 }))
              }
            />
          </div>
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
              onChange={(e) => onForm((f) => ({ ...f, mxik: e.target.value }))}
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
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      Quvur bu qadamga hali yetmadi.
    </p>
  );
}
