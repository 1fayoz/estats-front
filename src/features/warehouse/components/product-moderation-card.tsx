"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Info,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  aiFixProductUzum,
  autoFixProductUzum,
  checkProductUzum,
  syncModerationReasons,
} from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ProductDetail, ProductFixResult, ProductValidationFinding, WarehouseProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "error";
type Action = "check" | "ai" | "auto" | "reason";

interface ProductModerationCardProps {
  data: ProductDetail;
  onReload: () => Promise<void>;
  onUpdated: (data: ProductDetail) => void;
  onOpenAi: (draftId: number) => void;
  onComplaint: () => void;
  canSeeAi: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  title: "Tovar nomi",
  titleUz: "O'zbekcha nom",
  titleRu: "Ruscha nom",
  title_uz: "O'zbekcha nom",
  title_ru: "Ruscha nom",
  description: "Tavsif",
  descriptionUz: "O'zbekcha tavsif",
  descriptionRu: "Ruscha tavsif",
  description_uz: "O'zbekcha tavsif",
  description_ru: "Ruscha tavsif",
  category: "Kategoriya",
  barcode: "Shtrix-kod",
  images: "Rasmlar",
  attributes: "Xususiyatlar",
  price: "Narx",
};

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "border-border bg-muted/35 text-muted-foreground",
  success: "border-[color:color-mix(in_srgb,var(--ok)_25%,transparent)] bg-[color:color-mix(in_srgb,var(--ok)_8%,transparent)] text-[color:var(--ok)]",
  warning: "border-[color:var(--warn-line)] bg-[color:var(--warn-bg)] text-[color:var(--warn-ink)]",
  error: "border-[color:color-mix(in_srgb,var(--bad)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--bad)_7%,transparent)] text-[color:var(--bad)]",
};

const ACTION_CLASS = "min-h-11 h-auto rounded-xl px-3 py-2.5 whitespace-normal text-left motion-reduce:transition-none motion-reduce:transform-none";
const SUMMARY_CLASS = "flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden";

function marketplaceStatus(product: WarehouseProduct): { label: string; tone: Tone } {
  if (product.uzumBlocked || product.uzumModerationValue === "PERM_BANNED") {
    return { label: "Bloklangan", tone: "error" };
  }
  if (product.uzumModerationValue === "HAS_COMPLAINTS") {
    return { label: "Uzum e'tirozi bor", tone: "error" };
  }
  if (["ON_MODERATION", "ON_PREMODERATION", "NOT_MODERATED"].includes(product.uzumModerationValue ?? "")) {
    return {
      label: product.uzumHadBlock || product.uzumWasModerated ? "Qayta moderatsiyada" : "Moderatsiya kutilmoqda",
      tone: "warning",
    };
  }
  if (product.uzumModerationValue === "MODERATED") {
    return { label: "Moderatsiyadan o'tgan", tone: "success" };
  }
  return { label: product.uzumModerationTitle || product.uzumStatusTitle || "Holati noma'lum", tone: "neutral" };
}

function validationState(state: string): { label: string; tone: Tone } {
  if (state === "ok") return { label: "Talabga mos", tone: "success" };
  if (state === "error") return { label: "Xato", tone: "error" };
  if (state === "warning") return { label: "E'tibor kerak", tone: "warning" };
  if (state === "info") return { label: "Ma'lumot", tone: "neutral" };
  return { label: state || "Tekshirilmagan", tone: "neutral" };
}

function StateIcon({ tone, className }: { tone: Tone; className?: string }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : tone === "warning" ? Clock3 : Info;
  return <Icon aria-hidden="true" className={cn("h-4 w-4 shrink-0", className)} />;
}

function fixFeedback(result: ProductFixResult, automatic: boolean): { message: string; tone: Tone } {
  const applied = result.deterministicFix?.applied ?? [];
  const manual = result.deterministicFix?.manual ?? [];
  const messages: string[] = [];
  if (applied.length) messages.push(`Tuzatildi: ${applied.join(", ")}.`);
  if (result.deterministicFix?.aiUsed) messages.push("AI tavsifni rasmlarga mosladi.");
  if (manual.length) {
    const reasons = manual.map((item) => item.reason || item.blockType).filter(Boolean);
    messages.push(reasons.length ? `Qo'lda tekshirish kerak: ${reasons.join("; ")}.` : "Ayrim qismlarni qo'lda tekshirish kerak.");
  }
  if (result.uzumPush) {
    messages.push(result.uzumPush.ok
      ? result.uzumPush.message
      : `Tuzatildi, lekin Uzum'ga yuborilmadi: ${result.uzumPush.message}`);
  }
  if (!messages.length) messages.push(automatic ? "Avtomatik tuzatish yakunlandi. Natijani AI kartochkada ko'ring." : "AI qoralama tayyor. O'zgarishlarni AI kartochkada ko'ring.");
  return { message: messages.join(" "), tone: manual.length || result.uzumPush?.ok === false ? "warning" : "neutral" };
}

export function ProductModerationCard({ data, onReload, onUpdated, onOpenAi, onComplaint, canSeeAi }: ProductModerationCardProps) {
  const [busy, setBusy] = React.useState<Action | null>(null);
  const [feedback, setFeedback] = React.useState<{ message: string; tone: Tone } | null>(null);
  const busyRef = React.useRef(false);
  const headingId = React.useId();
  const product = data.product;
  const validation = product.uzumValidation;
  const status = marketplaceStatus(product);
  const areas = validation?.areas && typeof validation.areas === "object" ? Object.entries(validation.areas) : [];
  const healthyAreas = areas.filter(([, state]) => state === "ok");
  const attentionAreas = areas.filter(([, state]) => state !== "ok");
  const findings = Array.isArray(validation?.findings) ? validation.findings : [];
  const attentionFindings = findings.filter((finding) => finding.level !== "ok");
  const healthyFindings = findings.filter((finding) => finding.level === "ok");
  const moderationErrors = Array.isArray(data.moderationErrors) ? data.moderationErrors : [];
  const readiness = typeof validation?.readiness === "number" && Number.isFinite(validation.readiness)
    ? Math.min(100, Math.max(0, validation.readiness))
    : null;
  const readinessTone: Tone = readiness === null
    ? "neutral"
    : moderationErrors.length || status.tone === "error" || validation?.summary?.error || attentionAreas.some(([, state]) => state === "error") || findings.some((finding) => finding.level === "error")
      ? "error"
      : readiness < 100 || validation?.summary?.warning || attentionAreas.length || attentionFindings.length
        ? "warning"
        : "success";
  const checkedAt = validation?.checkedAt || product.uzumValidatedAt;
  const validCheckedAt = checkedAt && Number.isFinite(new Date(checkedAt).getTime()) ? checkedAt : null;
  const canFindReason = product.uzumBlocked || ["HAS_COMPLAINTS", "PERM_BANNED"].includes(product.uzumModerationValue ?? "");

  const runAction = async (action: Action, execute: () => Promise<void>) => {
    if (busyRef.current || ((action === "ai" || action === "auto") && !canSeeAi)) return;
    busyRef.current = true;
    setBusy(action);
    setFeedback(null);
    try {
      await execute();
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : "Amal bajarilmadi. Qayta urinib ko'ring.", tone: "error" });
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const runAiFix = (field?: "title" | "description") => runAction("ai", async () => {
    const result = await aiFixProductUzum(product.id, field);
    setFeedback(fixFeedback(result, false));
    onOpenAi(result.draftId);
  });

  return (
    <Card aria-labelledby={headingId} className="overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id={headingId} className="text-base font-semibold tracking-tight">Uzum tekshiruvi</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {validCheckedAt ? `Oxirgi tekshiruv: ${formatDate(validCheckedAt)}` : "Kartochka talablari va moderatsiya holati"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          disabled={busy !== null}
          className={cn(ACTION_CLASS, "shrink-0")}
          onClick={() => void runAction("check", async () => {
            onUpdated(await checkProductUzum(product.id));
            setFeedback({ message: "Uzum holati va tekshiruv natijalari yangilandi.", tone: "neutral" });
          })}
        >
          {busy === "check" ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
          {busy === "check" ? "Tekshirilmoqda…" : "Qayta tekshirish"}
        </Button>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Uzum&apos;dagi holat</p>
            <div className={cn("mt-2 inline-flex max-w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm font-medium [overflow-wrap:anywhere]", TONE_CLASSES[status.tone])}>
              <StateIcon tone={status.tone} />
              {status.label}
            </div>
            {product.uzumBlockingReason && <p className="mt-2.5 text-sm leading-relaxed text-[color:var(--bad)] [overflow-wrap:anywhere]">{product.uzumBlockingReason}</p>}
          </div>
          <div className="min-w-0 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Talablarga tayyorlik</p>
              <span className={cn("text-lg font-semibold tabular-nums", readinessTone === "success" ? "text-[color:var(--ok)]" : readinessTone === "warning" ? "text-[color:var(--warn)]" : readinessTone === "error" ? "text-[color:var(--bad)]" : "text-muted-foreground")}>
                {readiness === null ? "—" : `${Math.round(readiness)}%`}
              </span>
            </div>
            <div
              role={readiness === null ? undefined : "progressbar"}
              aria-label={readiness === null ? undefined : "Talablarga tayyorlik"}
              aria-valuemin={readiness === null ? undefined : 0}
              aria-valuemax={readiness === null ? undefined : 100}
              aria-valuenow={readiness ?? undefined}
              className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted"
            >
              {readiness !== null && <div className={cn("h-full rounded-full", readinessTone === "success" ? "bg-[color:var(--ok)]" : readinessTone === "error" ? "bg-[color:var(--bad)]" : "bg-[color:var(--warn)]")} style={{ width: `${readiness}%` }} />}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              {readiness === null ? "Baholash uchun tekshiruvni ishga tushiring." : "Ichki tekshiruv bahosi. Uzum tasdig'i alohida ko'rsatiladi."}
            </p>
          </div>
        </div>

        {feedback && (
          <div role={feedback.tone === "error" ? "alert" : "status"} className={cn("flex items-start gap-2.5 rounded-xl border p-3 text-sm leading-relaxed [overflow-wrap:anywhere]", TONE_CLASSES[feedback.tone])}>
            <StateIcon tone={feedback.tone} className="mt-0.5" />
            <p className="min-w-0">{feedback.message}</p>
          </div>
        )}

        {moderationErrors.length > 0 && (
          <section aria-label="Uzum qaytargan sabablar" className="space-y-2.5">
            <h3 className="text-sm font-semibold">Uzum qaytargan sabablar <span className="ml-1 text-muted-foreground">· {moderationErrors.length}</span></h3>
            {moderationErrors.map((item) => (
              <div key={item.id} className="rounded-xl border border-[color:color-mix(in_srgb,var(--bad)_25%,transparent)] bg-[color:color-mix(in_srgb,var(--bad)_4%,transparent)] p-3.5 text-sm leading-relaxed [overflow-wrap:anywhere]">
                <div className="flex items-start gap-2.5"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--bad)]" aria-hidden="true" /><p className="min-w-0 font-medium">{item.errorMessage}</p></div>
                {item.suggestedFix && <p className="mt-2 text-sm">{item.suggestedFix}</p>}
                {(item.ruleTitle || item.explanation) && (
                  <details className="group mt-1">
                    <summary className={cn(SUMMARY_CLASS, "text-xs text-muted-foreground")}>
                      Qoida va izoh <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                    </summary>
                    <div className="space-y-1 pb-1 text-xs leading-relaxed text-muted-foreground">
                      {item.ruleTitle && <p>Qoida: {item.ruleTitle}</p>}
                      {item.explanation && <p>{item.explanation}</p>}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </section>
        )}

        {(attentionAreas.length > 0 || attentionFindings.length > 0) && (
          <section aria-label="E'tibor talab qiladigan qismlar" className="space-y-3">
            <h3 className="text-sm font-semibold">E&apos;tibor talab qiladigan qismlar</h3>
            {attentionAreas.length > 0 && <div className="flex flex-wrap gap-2">{attentionAreas.map(([field, state]) => <AreaStatus key={field} field={field} state={state} />)}</div>}
            {attentionFindings.map((finding, index) => <FindingRow key={`${finding.field}-${index}`} finding={finding} />)}
          </section>
        )}

        {(healthyAreas.length > 0 || healthyFindings.length > 0) && (
          <details className="group rounded-xl border px-3.5">
            <summary className={SUMMARY_CLASS}>
              <span className="flex min-w-0 items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[color:var(--ok)]" aria-hidden="true" />Talabga mos qismlar{healthyAreas.length > 0 ? ` · ${healthyAreas.length}` : ""}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
            </summary>
            <div className="space-y-2.5 pb-3.5 pt-1">
              <div className="flex flex-wrap gap-2">{healthyAreas.map(([field, state]) => <AreaStatus key={field} field={field} state={state} />)}</div>
              {healthyFindings.map((finding, index) => <FindingRow key={`${finding.field}-${index}`} finding={finding} />)}
            </div>
          </details>
        )}

        {!areas.length && !findings.length && !moderationErrors.length && (
          <div className="flex items-start gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            <Search className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div><p className="font-medium text-foreground">Hali batafsil natija yo&apos;q</p><p className="mt-1 leading-relaxed">Tekshiruvni ishga tushiring — nom, rasmlar va boshqa talablar shu yerda ko&apos;rinadi.</p></div>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t bg-muted/15 p-4 sm:p-5">
        <p className="text-xs font-medium text-muted-foreground">Kartochka ustida ishlash</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {canSeeAi && (
            <>
              <DropdownMenu>
                <div className="flex min-w-0 sm:w-auto">
                  <Button type="button" variant="outline" disabled={busy !== null} className={cn(ACTION_CLASS, "min-w-0 flex-1 rounded-r-none border-r-0")} onClick={() => void runAiFix()}>
                    {busy === "ai" ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
                    {busy === "ai" ? "AI tuzatmoqda…" : "AI bilan tuzatish"}
                  </Button>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" disabled={busy !== null} aria-label="AI bilan qaysi qismini tuzatishni tanlash" className={cn(ACTION_CLASS, "w-11 shrink-0 rounded-l-none px-0")}><ChevronDown aria-hidden="true" /></Button>
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent align="start" className="max-w-[calc(100vw-2rem)] rounded-xl motion-reduce:animate-none">
                  <DropdownMenuLabel>Alohida tuzatish</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={busy !== null} className="min-h-11 rounded-lg motion-reduce:transition-none" onSelect={() => void runAiFix("title")}>Faqat tovar nomini</DropdownMenuItem>
                  <DropdownMenuItem disabled={busy !== null} className="min-h-11 rounded-lg motion-reduce:transition-none" onSelect={() => void runAiFix("description")}>Faqat tavsifni</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button type="button" variant="outline" disabled={busy !== null} className={ACTION_CLASS} onClick={() => void runAction("auto", async () => {
                const result = await autoFixProductUzum(product.id);
                setFeedback(fixFeedback(result, true));
                onOpenAi(result.draftId);
              })}>
                {busy === "auto" ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <WandSparkles aria-hidden="true" />}
                {busy === "auto" ? "Tuzatilmoqda…" : "Avtomatik tuzatish"}
              </Button>
            </>
          )}
          {canFindReason && (
            <Button type="button" variant="outline" disabled={busy !== null} className={ACTION_CLASS} onClick={() => void runAction("reason", async () => {
              const result = await syncModerationReasons(product.id);
              setFeedback({ message: result.message, tone: "neutral" });
              await onReload();
            })}>
              {busy === "reason" ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Search aria-hidden="true" />}
              {busy === "reason" ? "Sabab aniqlanmoqda…" : "Uzum sababini aniqlash"}
            </Button>
          )}
          <Button type="button" variant="ghost" disabled={busy !== null} className={cn(ACTION_CLASS, "text-muted-foreground sm:ml-auto")} onClick={onComplaint}>
            <MessageSquare aria-hidden="true" />Operatorga yozish
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AreaStatus({ field, state }: { field: string; state: string }) {
  const status = validationState(state);
  return <div className={cn("inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs leading-relaxed [overflow-wrap:anywhere]", TONE_CLASSES[status.tone])}><StateIcon tone={status.tone} className="h-3.5 w-3.5" /><span>{FIELD_LABELS[field] || field} · {status.label}</span></div>;
}

function FindingRow({ finding }: { finding: ProductValidationFinding }) {
  const status = validationState(finding.level);
  const hasDetails = finding.ruleTitle || finding.explanation || finding.currentValue || finding.proposedValue;
  return (
    <div className="rounded-xl border p-3.5 text-sm leading-relaxed [overflow-wrap:anywhere]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{FIELD_LABELS[finding.field] || finding.field}</span>
        <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]", TONE_CLASSES[status.tone])}><StateIcon tone={status.tone} className="h-3 w-3" />{status.label}</span>
      </div>
      <p className="mt-2">{finding.message}</p>
      {finding.suggestion && <p className="mt-2 text-muted-foreground">{finding.suggestion}</p>}
      {hasDetails && (
        <details className="group mt-1">
          <summary className={cn(SUMMARY_CLASS, "text-xs text-muted-foreground")}>Batafsil ko&apos;rish<ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" /></summary>
          <div className="space-y-2 pb-1 text-xs leading-relaxed text-muted-foreground">
            {finding.ruleTitle && <p>Qoida: {finding.ruleTitle}</p>}
            {finding.explanation && <p>{finding.explanation}</p>}
            {finding.currentValue && <div className="rounded-lg bg-muted/50 p-2.5"><p className="mb-1 font-medium text-foreground">Joriy qiymat</p><p className="whitespace-pre-wrap">{finding.currentValue}</p></div>}
            {finding.proposedValue && <div className="rounded-lg bg-primary/5 p-2.5"><p className="mb-1 font-medium text-foreground">Taklif etilgan qiymat</p><p className="whitespace-pre-wrap">{finding.proposedValue}</p></div>}
          </div>
        </details>
      )}
    </div>
  );
}
