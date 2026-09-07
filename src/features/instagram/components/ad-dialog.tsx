"use client";

import * as React from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ImageIcon, Loader2, Megaphone, Play } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, createInstagramAd, planInstagramAd, startInstagramAd, type AdInput } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import type { AdPlan, InstagramPost } from "@/lib/types";

const GOALS = [
  { value: "traffic", label: "Uzum'ga o'tish", hint: "Mahsulot sahifasiga yo'naltirish" },
  { value: "engagement", label: "Muloqot", hint: "Layk, izoh va saqlashlar" },
  { value: "reach", label: "Qamrov", hint: "Ko'proq odamga tanitish" },
  { value: "messages", label: "Direct xabarlari", hint: "Savol-javob orqali sotuv" },
];
const GENDERS = [
  { value: "", label: "Hammasi" },
  { value: "female", label: "Ayollar" },
  { value: "male", label: "Erkaklar" },
];
const BUDGETS = [30_000, 50_000, 100_000, 200_000];

interface AdDialogProps {
  post: InstagramPost | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function currentScope() {
  const state = useUserStore.getState();
  return [state.user?.id, state.workspaceId, state.activeShopId].join(":");
}

export function AdDialog(props: AdDialogProps) {
  const scope = useUserStore((state) => [state.user?.id, state.workspaceId, state.activeShopId].join(":"));
  return <AdDialogForm key={scope + ":" + (props.post?.id ?? "closed")} {...props} scope={scope} />;
}

function AdDialogForm({ post, onOpenChange, onSaved, scope }: AdDialogProps & { scope: string }) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [budget, setBudget] = React.useState("50000");
  const [goal, setGoal] = React.useState("traffic");
  const [ageMin, setAgeMin] = React.useState("18");
  const [ageMax, setAgeMax] = React.useState("55");
  const [gender, setGender] = React.useState("");
  const [plan, setPlan] = React.useState<AdPlan | null>(null);
  const [checkedInput, setCheckedInput] = React.useState<AdInput | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [createdId, setCreatedId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const submitting = React.useRef(false);
  const mounted = React.useRef(true);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  React.useEffect(() => {
    if (step > 1) headingRef.current?.focus();
  }, [step]);

  const current = () => mounted.current && currentScope() === scope;
  const dailyBudget = Number(budget);
  const minimumAge = Number(ageMin);
  const maximumAge = Number(ageMax);
  const budgetValid = budget.trim() !== "" && Number.isFinite(dailyBudget) && dailyBudget > 0;
  const ageValid = ageMin.trim() !== "" && ageMax.trim() !== "" && Number.isInteger(minimumAge) && Number.isInteger(maximumAge) && minimumAge >= 13 && maximumAge <= 65 && minimumAge <= maximumAge;
  const valid = budgetValid && ageValid;

  const onCheck = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!post || !valid || submitting.current || !current()) return;
    const payload: AdInput = {
      postId: post.id,
      dailyBudget,
      goal,
      ageMin: minimumAge,
      ageMax: maximumAge,
      gender: gender || null,
      productId: post.products[0]?.id ?? null,
    };
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await planInstagramAd(payload);
      if (!current()) return;
      setPlan(result);
      setCheckedInput(payload);
      setStep(2);
    } catch (failure) {
      if (current()) setError(failure instanceof ApiError ? failure.message : "Hisoblab bo'lmadi. Qayta urinib ko'ring.");
    } finally {
      submitting.current = false;
      if (current()) setBusy(false);
    }
  };

  const onLaunch = async (startNow: boolean) => {
    if (!checkedInput || !plan || submitting.current || !current()) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    let adId = createdId;
    try {
      if (adId === null) {
        const created = await createInstagramAd(checkedInput);
        if (!current()) return;
        adId = created.id;
        setCreatedId(created.id);
      }
      if (startNow) {
        if (!current()) return;
        await startInstagramAd(adId);
      }
      if (!current()) return;
      toast.success(startNow ? "Reklama yoqildi" : "Reklama yaratildi — to'xtatilgan holatda");
      onSaved();
      onOpenChange(false);
    } catch (failure) {
      if (current()) {
        const message = failure instanceof ApiError ? failure.message : "Amal bajarilmadi. Qayta urinib ko'ring.";
        setError(adId !== null && startNow ? "Reklama yaratildi, ammo yoqilmadi. " + message : message);
        if (adId !== null) onSaved();
      }
    } finally {
      submitting.current = false;
      if (current()) setBusy(false);
    }
  };

  const goBack = () => {
    if (submitting.current) return;
    setError(null);
    setStep(step === 3 ? 2 : 1);
  };

  return (
    <Dialog open={post !== null} onOpenChange={(open) => { if (!submitting.current) onOpenChange(open); }}>
      <DialogContent className={cn("max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xl gap-5 overflow-y-auto rounded-2xl p-4 sm:p-6 [&>button]:right-2 [&>button]:top-2 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center", busy && "[&>button]:hidden")}>
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2 pr-9 text-xs text-muted-foreground"><Megaphone className="size-4" />Instagram reklamasi <span className="ml-auto">{step} / 3</span></div>
          <DialogTitle className="pr-8 text-xl">{step === 1 ? "Reklamani sozlash" : step === 2 ? "Rejani tekshirish" : "Pul sarflashni tasdiqlash"}</DialogTitle>
          <DialogDescription className="leading-6">{step === 1 ? "Maqsad, kunlik byudjet va auditoriyani tanlang." : step === 2 ? "Taxminiy natijalarni ko'ring. Bu bosqichda pul sarflanmaydi." : "Tasdiqlasangiz, reklama yoqiladi va kunlik byudjet bo'yicha pul sarflash boshlanadi."}</DialogDescription>
        </DialogHeader>

        <ol aria-label="Reklama yaratish bosqichlari" className="grid grid-cols-3 gap-2">
          {["Sozlash", "Tekshirish", "Tasdiqlash"].map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} className={cn("border-t-2 pt-2 text-xs", step === index + 1 ? "border-foreground font-medium text-foreground" : "border-border text-muted-foreground")}>{index + 1}. {label}</li>)}
        </ol>

        <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
          {post?.thumbnail ? <img src={post.thumbnail} alt="" className="size-12 shrink-0 rounded-lg border object-cover" /> : <div className="grid size-12 shrink-0 place-items-center rounded-lg border bg-background"><ImageIcon className="size-5 text-muted-foreground" /></div>}
          <div className="min-w-0"><p className="line-clamp-2 text-sm font-medium">{post?.caption || "Instagram posti"}</p><p className="mt-1 text-xs text-muted-foreground">{post?.products[0]?.title || "Tovarga bog'lanmagan post"}</p></div>
        </div>

        {step === 1 ? (
          <form id="instagram-ad-settings" onSubmit={onCheck} className="space-y-5" aria-busy={busy}>
            <fieldset disabled={busy} className="space-y-5">
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Reklama maqsadi</legend>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((item) => <label key={item.value} className="relative cursor-pointer"><input type="radio" name="instagram-ad-goal" value={item.value} checked={goal === item.value} onChange={() => setGoal(item.value)} className="peer sr-only" /><span className="flex min-h-20 flex-col rounded-xl border p-3 transition-colors peer-checked:border-foreground/60 peer-checked:bg-muted/50 peer-focus-visible:ring-2 peer-focus-visible:ring-ring"><span className="text-sm font-medium">{item.label}</span><span className="mt-1 text-xs leading-5 text-muted-foreground">{item.hint}</span></span></label>)}
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="ad-budget">Kunlik byudjet, so'm</Label>
                <Input id="ad-budget" inputMode="numeric" required value={budget} onChange={(event) => setBudget(event.target.value.replace(/\s/g, ""))} className="h-11 rounded-xl text-base" aria-invalid={!budgetValid} aria-describedby="ad-budget-help" />
                <p id="ad-budget-help" className={cn("text-xs", budgetValid ? "text-muted-foreground" : "text-destructive")}>{budgetValid ? "Har bir kun uchun ajratilgan summa." : "Noldan katta byudjet kiriting."}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Tayyor kunlik byudjetlar">
                  {BUDGETS.map((value) => <Button key={value} type="button" variant="outline" aria-pressed={dailyBudget === value} onClick={() => setBudget(String(value))} className={cn("h-11 rounded-xl px-2 text-xs", dailyBudget === value && "border-foreground/60 bg-muted/50")}>{formatSum(value)}</Button>)}
                </div>
              </div>

              <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-medium">Auditoriya</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label htmlFor="ad-age-min">Yosh, dan</Label><Input id="ad-age-min" inputMode="numeric" required value={ageMin} onChange={(event) => setAgeMin(event.target.value)} className="h-11 rounded-xl text-base" aria-invalid={!ageValid} aria-describedby="ad-age-help" /></div>
                  <div className="space-y-2"><Label htmlFor="ad-age-max">Yosh, gacha</Label><Input id="ad-age-max" inputMode="numeric" required value={ageMax} onChange={(event) => setAgeMax(event.target.value)} className="h-11 rounded-xl text-base" aria-invalid={!ageValid} aria-describedby="ad-age-help" /></div>
                </div>
                <p id="ad-age-help" className={cn("text-xs", ageValid ? "text-muted-foreground" : "text-destructive")}>{ageValid ? "13–65 yosh oralig'ida tanlang." : "13–65 oralig'ida yosh kiriting. Boshlang'ich yosh oxirgisidan katta bo'lmasin."}</p>
                <fieldset><legend className="mb-2 text-sm font-medium">Jins</legend><div className="grid grid-cols-3 gap-2">{GENDERS.map((item) => <label key={item.value} className="relative cursor-pointer"><input type="radio" name="instagram-ad-gender" value={item.value} checked={gender === item.value} onChange={() => setGender(item.value)} className="peer sr-only" /><span className="flex min-h-11 items-center justify-center rounded-xl border px-2 text-sm transition-colors peer-checked:border-foreground/60 peer-checked:bg-muted/50 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">{item.label}</span></label>)}</div></fieldset>
              </fieldset>
            </fieldset>
            <p className="rounded-xl bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">Auditoriya qiziqishlarini Meta avtomatik tanlaydi. Mavjud postning layk va izohlari saqlanadi.</p>
          </form>
        ) : (
          <div className="space-y-3">
            <h3 ref={headingRef} tabIndex={-1} className="sr-only">{step === 2 ? "Reklama rejasi" : "Reklama yoqishni tasdiqlash"}</h3>
            <div className="rounded-xl border bg-muted/20 p-4"><p className="text-xs text-muted-foreground">Kunlik byudjet</p><p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums [overflow-wrap:anywhere]">{formatSum(plan?.dailyBudget ?? 0)}</p><p className="mt-1 text-xs text-muted-foreground">{plan?.audience || "—"}</p></div>
            <dl className="divide-y rounded-xl border px-4">
              <Row label="Maqsad" value={GOALS.find((item) => item.value === checkedInput?.goal)?.label || "—"} />
              <Row label="Taxminiy bosish / kun" value={formatNumber(plan?.estimatedClicksLow ?? 0) + "–" + formatNumber(plan?.estimatedClicksHigh ?? 0) + " ta"} />
              {plan?.profitPerSale != null && <Row label="Bir sotuvdan foyda" value={formatSum(plan.profitPerSale)} />}
              {plan?.breakEvenClicks != null && <Row label="Byudjetni qoplash uchun" value={"~" + formatNumber(plan.breakEvenClicks) + " ta bosish"} accent />}
            </dl>
            {plan?.warning && <div className="flex items-start gap-2 rounded-xl border border-[color:var(--warn)]/25 bg-[color:var(--warn)]/5 p-3 text-sm leading-6"><AlertTriangle className="mt-1 size-4 shrink-0 text-[var(--warn)]" /><span>{plan.warning}</span></div>}
            {step === 2 ? <p className="text-xs leading-5 text-muted-foreground">Natijalar do'koningizning sotuv tarixiga asoslangan taxmin. Haqiqiy natija reklama ishlagandan keyin ko'rinadi.</p> : <p className="rounded-xl border p-4 text-sm leading-6">«Tasdiqlash va yoqish» tugmasi reklama xarajatlarini boshlaydi. Uni keyin «Reklama» bo'limida to'xtatishingiz mumkin.</p>}
          </div>
        )}

        {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm leading-6 text-destructive [overflow-wrap:anywhere]">{error}</p>}

        <DialogFooter className="border-t pt-4 [&>button]:min-h-11 [&>button]:rounded-xl">
          {step === 1 ? <>
            <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" form="instagram-ad-settings" disabled={busy || !valid}>{busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}{busy ? "Hisoblanmoqda..." : "Rejani ko'rish"}</Button>
          </> : step === 2 ? <>
            <Button variant="outline" onClick={goBack} disabled={busy || createdId !== null}><ArrowLeft />Orqaga</Button>
            <Button variant="outline" onClick={() => void onLaunch(false)} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Check />}{createdId !== null ? "Yaratilgan reklamani saqlash" : "Yaratib qo'yish"}</Button>
            <Button onClick={() => { setError(null); setStep(3); }} disabled={busy}><ArrowRight />Yoqishga o'tish</Button>
          </> : <>
            <Button variant="outline" onClick={goBack} disabled={busy}>Orqaga</Button>
            <Button onClick={() => void onLaunch(true)} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Play />}{busy ? "Yoqilmoqda..." : "Tasdiqlash va yoqish"}</Button>
          </>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-3 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className={cn("ml-auto text-right font-medium tabular-nums [overflow-wrap:anywhere]", accent && "font-semibold")}>{value}</dd></div>;
}
