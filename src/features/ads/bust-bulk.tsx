"use client";

import * as React from "react";
import { Rocket } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createBustBulk, fetchBustInsights, startBustInsights, type BustInsightsJob, type BustShopRow,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";

/**
 * Ommaviy Bust: tanlangan tovarlar uchun Uzum narxlari ketma-ket olinadi (har biri
 * kabinetda ~10 s), har tovardan FAQAT foydali so'rovlar (Uzum stavkasi ≤ shift)
 * avtomatik tanlanadi va hammasi BITTA kampaniyaga yig'iladi. Yaratish — tasdiq bilan.
 */
type Picked = { productId: number; title: string; skuGroupId: number; ads: { query: string; cpm: number }[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function insightsFor(productId: number, onTick: (j: BustInsightsJob) => void): Promise<BustInsightsJob> {
  let job = await startBustInsights(productId);
  onTick(job);
  for (let i = 0; i < 90 && job.status === "running"; i += 1) {
    await sleep(4000);
    job = await fetchBustInsights(job.job);
    onTick(job);
  }
  return job;
}

export function BustBulk({ rows, selected, onDone }: { rows: BustShopRow[]; selected: number[]; onDone: () => void }) {
  const [progress, setProgress] = React.useState<{ i: number; n: number; title: string } | null>(null);
  // Joriy tovar ishining o'lchangan vaqti (backend `elapsedSeconds`/`expectedSeconds`).
  const [tick, setTick] = React.useState<{ elapsed: number; expected: number } | null>(null);
  const [picked, setPicked] = React.useState<Picked[] | null>(null);
  const [skipped, setSkipped] = React.useState<string[]>([]);
  // Narx umuman olinmagan tovarlar soni (Cloudflare, sessiya) — «foydali so'rov yo'q» bilan aralashmasin.
  const [failed, setFailed] = React.useState(0);
  const [budget, setBudget] = React.useState("150000");
  const [name, setName] = React.useState("eStats — Bust");
  const [confirming, setConfirming] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const collect = async () => {
    const chosen = rows.filter((r) => selected.includes(r.productId));
    const out: Picked[] = [];
    const skip: string[] = [];
    let fails = 0;
    for (const [i, r] of chosen.entries()) {
      setProgress({ i: i + 1, n: chosen.length, title: r.title });
      try {
        const job = await insightsFor(r.productId, (j) =>
          setTick({ elapsed: j.elapsedSeconds ?? 0, expected: Math.max(j.expectedSeconds || 0, 1) }));
        const g = job.result?.groups?.[0];
        if (job.status !== "done" || !g) {
          fails += 1;
          skip.push(`${r.title.slice(0, 40)} — ${job.error || "narx olinmadi"}`);
          continue;
        }
        const ads = g.queries.filter((q) => q.verdict === "profitable" && q.suggestedCpm)
          .map((q) => ({ query: q.query, cpm: q.suggestedCpm as number }));
        if (!ads.length) skip.push(`${r.title.slice(0, 40)} — foydali so'rov yo'q (Uzum stavkasi shiftdan yuqori)`);
        else out.push({ productId: r.productId, title: r.title, skuGroupId: g.skuGroupId, ads });
      } catch (e) {
        fails += 1;
        skip.push(`${r.title.slice(0, 40)} — ${(e as Error).message}`);
      }
    }
    setProgress(null);
    setTick(null);
    setPicked(out);
    setSkipped(skip);
    setFailed(fails);
  };

  const submit = async () => {
    if (!picked?.length) return;
    setSending(true);
    try {
      const res = await createBustBulk({
        name, weeklyAmount: Number(budget), uniform: true, minus: [], confirm: true,
        items: picked.map((p) => ({ productId: p.productId, skuGroupId: p.skuGroupId, ads: p.ads })),
      });
      toast.success(`Kampaniya yaratildi: ${res.ads} ta so'rov`);
      setConfirming(false);
      setPicked(null);
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const total = picked?.reduce((n, p) => n + p.ads.length, 0) ?? 0;

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={!selected.length || !!progress} onClick={() => void collect()}>
          {progress ? `Uzum narxlari: ${progress.i}/${progress.n}` : `Tanlanganlar (${selected.length}) uchun foydali so'rovlarni topish`}
        </Button>
        {progress ? (
          <span className="text-muted-foreground text-xs">
            {(() => {
              const part = tick ? Math.min(0.95, tick.elapsed / tick.expected) : 0;
              const pct = Math.round(((progress.i - 1 + part) / progress.n) * 100);
              const per = tick?.expected ?? 120;
              const left = Math.max(0, Math.round(per - (tick?.elapsed ?? 0)) + (progress.n - progress.i) * per);
              return `${pct}% · hozir: ${progress.title.slice(0, 40)} · ${Math.round(tick?.elapsed ?? 0)} s · taxminan ${left} s qoldi`;
            })()}
          </span>
        ) : null}
      </div>
      {skipped.length ? (
        <ul className="text-muted-foreground text-xs">{skipped.map((s) => <li key={s}>— {s}</li>)}</ul>
      ) : null}
      {picked?.length ? (
        <div className="space-y-2">
          <ul className="text-sm">
            {picked.map((p) => (
              <li key={p.productId}>
                <span className="font-medium">{p.title.slice(0, 50)}</span>
                <span className="text-muted-foreground text-xs"> — {p.ads.map((a) => `${a.query} (${formatNumber(a.cpm)})`).join(", ")}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end gap-2">
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">Nomi</span>
              <Input className="h-8 w-56" maxLength={50} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">Haftalik byudjet (kamida 150 000)</span>
              <Input className="h-8 w-40" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </label>
            {!confirming ? (
              <Button size="sm" disabled={Number(budget) < 150000} onClick={() => setConfirming(true)}>
                <Rocket className="h-3.5 w-3.5" />Bitta kampaniya qilib yaratish ({total} so&apos;rov)
              </Button>
            ) : (
              <>
                <Button size="sm" variant="destructive" disabled={sending} onClick={() => void submit()}>
                  {sending ? "Yaratilmoqda…" : `Ha — haftasiga ${formatNumber(Number(budget))} so'mgacha`}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Bekor qilish</Button>
              </>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Faqat foydali so&apos;rovlar (Uzum stavkasi tovarning shiftidan past) kiritildi; bir tekisda sarflanadi;
            pul faqat haqiqiy ko&apos;rsatishlar uchun yechiladi.
          </p>
        </div>
      ) : picked && failed ? (
        <p className="text-[var(--bad)] text-xs">
          Uzum narxlari {failed} ta tovar uchun olinmadi — natija yo&apos;q, bu «foydasiz» degani emas.
          {skipped.some((s) => /tekshir|captcha/i.test(s))
            ? " Uzum brauzer tekshiruvini so'radi: Integratsiyalar → «Sotuvchi kabinetiga ulanish» → «Oyna orqali kirish» bilan bir marta o'ting va qayta urining."
            : " Birozdan keyin qayta urining."}
        </p>
      ) : picked ? (
        <p className="text-muted-foreground text-xs">Tanlangan tovarlarda foydali so&apos;rov topilmadi — kampaniya tavsiya qilinmaydi.</p>
      ) : null}
    </div>
  );
}
