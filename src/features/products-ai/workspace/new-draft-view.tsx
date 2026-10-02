"use client";

import * as React from "react";
import { CheckCircle2, ImagePlus, Lightbulb, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { DropZone } from "@/features/products-ai/components/dropzone";
import { ImageSettingsPanel } from "@/features/products-ai/components/image-settings-panel";
import { UzumShopPicker } from "@/features/products-ai/components/uzum-shop-picker";
import { AI_STAGES } from "@/features/products-ai/stages";
import { fetchAiImageSettings } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiImageSettingsState } from "@/lib/types";

import { imageCostText } from "./lib";
import styles from "./workspace.module.css";

/**
 * Yangi tovar — rasm tanlash. Sotuvchi qiladigan YAGONA ish: rasm va
 * ixtiyoriy izoh; nom, tavsif, xususiyat, narxni AI yozadi.
 */
export function NewDraftView({
  files,
  onFiles,
  hint,
  onHint,
  shopId,
  onShop,
  disabled,
}: {
  files: File[];
  onFiles: (files: File[]) => void;
  hint: string;
  onHint: (hint: string) => void;
  shopId: number | null;
  onShop: (id: number | null) => void;
  disabled: boolean;
}) {
  return (
    <div className={styles.grid}>
      <section className={cn(styles.card, styles.rise, "p-4 sm:p-6")} style={{ "--i": 1 } as React.CSSProperties}>
        <div className="mb-5">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">Tovaringizni rasmdan boshlang</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Aniq rasmlar — sifatli kartochkaning birinchi qadami. Old, yon va orqa tomonni ko&apos;rsating.
          </p>
        </div>
        <div className="space-y-6">
          <DropZone files={files} onFiles={onFiles} hint={hint} onHint={onHint} disabled={disabled} />
          <div className="border-t border-[color:var(--air-line)] pt-5">
            <UzumShopPicker value={shopId} onChange={(id) => onShop(id)} disabled={disabled} />
          </div>
          <ImageSettingsPanel disabled={disabled} />
        </div>
      </section>

      <aside className={cn(styles.rail, "space-y-4")}>
        <NewGuide />
      </aside>
    </div>
  );
}

function NewGuide() {
  const [settings, setSettings] = React.useState<AiImageSettingsState | null>(null);
  React.useEffect(() => {
    let alive = true;
    fetchAiImageSettings().then((s) => alive && setSettings(s)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  // Narx FAQAT pulli API'da (2026-10-03). Butun to'plam narxi — sozlamadan.
  const cost = settings
    ? imageCostText({ imageEngine: settings.imageEngine, imagePriceUsd: settings.setPriceUsd || settings.imagePriceUsd })
    : null;

  const steps = [
    { icon: ImagePlus, title: "Rasmlarni qo'shing", description: "Tovarni old, yon va orqa tomondan ko'rsating." },
    { icon: Sparkles, title: "AI kartochka tayyorlaydi", description: "Nom, tavsif, xususiyatlar, bozor tahlili va rasmlar." },
    { icon: CheckCircle2, title: "Tekshirib, tasdiqlang", description: "Natijani tahrirlang va Uzum'ga joylang." },
  ];

  return (
    <>
      <div className={cn(styles.card, styles.rise, styles.railCard)} style={{ "--i": 2 } as React.CSSProperties}>
        <p className={styles.railHead}>Uch oddiy qadam</p>
        <ol className="mt-4 space-y-4">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-[color:var(--ok)]">
                <Icon className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-[13px] font-semibold">{index + 1}. {title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-start gap-2 border-t border-[color:var(--air-line)] pt-4 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[color:var(--ok)]" aria-hidden />
          Tovar faqat siz tasdiqlagandan keyin Uzum&apos;ga ketadi. Sahifani yopsangiz ham AI ishlayveradi.
        </div>
      </div>

      <div className={cn(styles.card, styles.rise, styles.railCard)} style={{ "--i": 3 } as React.CSSProperties}>
        <p className={styles.railHead}><Wallet className="size-3.5" aria-hidden /> Rasm yasash</p>
        <p className="mt-3 text-lg font-semibold tabular-nums">
          {cost ? (cost.paid ? `${cost.text} / to'plam` : cost.text) : "—"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {cost?.hint ?? "Rasm yo'li aniqlanmoqda…"}
          {cost?.paid ? " Matn qismi deyarli bepul." : ""}
        </p>
      </div>

      <div className={cn(styles.card, styles.rise, "border-[color:var(--warn-line)] bg-[color:var(--warn-bg)] p-4 text-[color:var(--warn-ink)]")} style={{ "--i": 4 } as React.CSSProperties}>
        <p className="flex items-center gap-2 text-[13px] font-semibold"><Lightbulb className="size-4" aria-hidden /> Yaxshi natija uchun</p>
        <p className="mt-2 text-xs leading-relaxed">
          Yorug&apos; fonda, tovar to&apos;liq ko&apos;rinadigan rasm tanlang. O&apos;lcham, komplekt va material kabi tafsilotlarni izohga yozing — AI
          ularni tavsif va bo&apos;limlarga to&apos;liq kiritadi.
        </p>
        <p className="mt-2 text-[11px] opacity-80">
          Keyin: {AI_STAGES.slice(1, -1).map((s) => s.short).join(" → ")}
        </p>
      </div>
    </>
  );
}
