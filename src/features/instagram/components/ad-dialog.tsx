"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight, Check, Loader2, Megaphone, Play } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, createInstagramAd, planInstagramAd, startInstagramAd } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdPlan, InstagramPost } from "@/lib/types";

const GOALS = [
  { value: "traffic", label: "Uzum'ga o'tsin", hint: "Sotib olishga yo'naltiradi" },
  { value: "engagement", label: "Muloqot", hint: "Layk, izoh, saqlash" },
  { value: "reach", label: "Ko'proq odam", hint: "Tanitish uchun" },
  { value: "messages", label: "Direct'ga yozsin", hint: "Savol-javob orqali sotuv" },
];

const GENDERS = [
  { value: "", label: "Hammasi" },
  { value: "female", label: "Ayollar" },
  { value: "male", label: "Erkaklar" },
];

const BUDGETS = [30_000, 50_000, 100_000, 200_000];

/**
 * Reklama sehrgari: sozlash → tekshirish → yoqish.
 *
 * Uch qadam ataylab: ikkinchi qadamda byudjet qoplanadimi-yo'qmi ko'rinadi,
 * uchinchisida esa pul sarflash ALOHIDA tasdiqlanadi. Reklama Meta'da
 * to'xtatilgan holatda tug'iladi, ya'ni oxirgi tugma bosilmaguncha bir so'm
 * ham ketmaydi.
 */
export function AdDialog({
  post,
  onOpenChange,
  onSaved,
}: {
  post: InstagramPost | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [budget, setBudget] = React.useState("50000");
  const [goal, setGoal] = React.useState("traffic");
  const [ageMin, setAgeMin] = React.useState("18");
  const [ageMax, setAgeMax] = React.useState("55");
  const [gender, setGender] = React.useState("");
  const [plan, setPlan] = React.useState<AdPlan | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (post) {
      setStep(1);
      setPlan(null);
      setBudget("50000");
      setGoal("traffic");
      setGender("");
    }
  }, [post]);

  const input = () => ({
    postId: post!.id,
    dailyBudget: Number(budget),
    goal,
    ageMin: Number(ageMin) || 18,
    ageMax: Number(ageMax) || 55,
    gender: gender || null,
    productId: post?.products[0]?.id ?? null,
  });

  const valid = Number(budget) > 0 && Number(ageMin) <= Number(ageMax);

  const onCheck = async () => {
    if (!valid) {
      toast.error("Byudjet va yosh oralig'ini tekshiring.");
      return;
    }
    setBusy(true);
    try {
      setPlan(await planInstagramAd(input()));
      setStep(2);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Hisoblab bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onLaunch = async (startNow: boolean) => {
    setBusy(true);
    try {
      const ad = await createInstagramAd(input());
      if (startNow) {
        await startInstagramAd(ad.id);
        toast.success("Reklama yoqildi");
      } else {
        toast.success("Reklama yaratildi — to'xtatilgan holatda");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yaratilmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={post != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            {step === 1 ? "Reklama sozlash" : "Tekshiring"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Mavjud post reklamaga aylanadi — layk va izohlar o'sha postga qo'shiladi."
              : "Bu bosqichda hali pul sarflanmaydi."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Maqsad</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {GOALS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setGoal(item.value)}
                    className={cn(
                      "rounded-lg border p-2 text-left transition-colors",
                      goal === item.value ? "border-primary bg-primary/10" : "hover:bg-accent"
                    )}
                  >
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ad-budget">Kunlik byudjet (so&apos;m)</Label>
              <Input
                id="ad-budget"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5">
                {BUDGETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBudget(String(value))}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs transition-colors",
                      Number(budget) === value ? "border-primary bg-primary/10" : "hover:bg-accent"
                    )}
                  >
                    {formatSum(value)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ad-age-min">Yoshi</Label>
                <Input id="ad-age-min" inputMode="numeric" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ad-age-max">gacha</Label>
                <Input id="ad-age-max" inputMode="numeric" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Jinsi</Label>
                <div className="flex gap-1">
                  {GENDERS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setGender(item.value)}
                      className={cn(
                        "flex-1 rounded-md border px-1 py-1.5 text-xs transition-colors",
                        gender === item.value ? "border-primary bg-primary/10" : "hover:bg-accent"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              Qiziqishlar qo&apos;lda tanlanmaydi — kichik byudjetda auditoriyani
              toraytirish bosish narxini oshiradi. Xaridorni Meta&apos;ning o&apos;zi
              topadi, bu shu byudjetda barqaror yaxshiroq ishlaydi.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Row label="Kunlik byudjet" value={formatSum(plan?.dailyBudget ?? 0)} />
            <Row label="Auditoriya" value={plan?.audience ?? "—"} />
            <Row
              label="Taxminiy bosish (kuniga)"
              value={`${plan?.estimatedClicksLow ?? 0}–${plan?.estimatedClicksHigh ?? 0} ta`}
            />
            {plan?.profitPerSale != null && (
              <Row label="Bir sotuvdan foyda" value={formatSum(plan.profitPerSale)} />
            )}
            {plan?.breakEvenClicks != null && (
              <Row
                label="Byudjetni qoplash uchun"
                value={`~${plan.breakEvenClicks} ta bosish`}
                accent
              />
            )}

            {plan?.warning && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <span className="text-muted-foreground">{plan.warning}</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Raqamlar — taxmin, va&apos;da emas. Ular do&apos;koningizning o&apos;z
              sotuv tarixidan chiqarilgan; haqiqiy natija reklama ishlagach ko&apos;rinadi.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button onClick={onCheck} disabled={busy || !valid} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Davom etish <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)} disabled={busy}>
                Orqaga
              </Button>
              <Button variant="outline" onClick={() => onLaunch(false)} disabled={busy} className="gap-1.5">
                <Check className="h-4 w-4" /> Yaratib qo&apos;yish
              </Button>
              <Button onClick={() => onLaunch(true)} disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Yoqish
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border p-3 text-sm",
        accent && "border-primary/40 bg-primary/5"
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right font-semibold", accent && "text-primary")}>{value}</span>
    </div>
  );
}
