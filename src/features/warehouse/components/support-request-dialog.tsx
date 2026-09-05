"use client";

import * as React from "react";
import { Clock, Headphones, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  fetchShopRequestJob,
  fetchShopRequestPreview,
  sendShopRequest,
} from "@/lib/api";
import type { ComplaintJob, ShopRequestPreview } from "@/lib/types";
import { JobProgress, jobIsActive } from "./job-progress";

/**
 * Uzum qo'llab-quvvatlashiga DO'KON darajasidagi savol.
 *
 * Bloklangan kartochka — bitta tovar haqida; bu yerda esa
 * sotuvchining qolgan savollari: ombordagi qaytarilgan tovarlar
 * tayyormi, nuqsonli tovarlar qachon yig'ib olinadi, mablag'
 * qachon yechiladi.
 *
 * Matnni server ANIQ ma'lumotdan tuzadi (qaytarilgan/nuqsonli
 * tovarlar soni Uzum javobidan) — sotuvchi tahrirlashi mumkin.
 */
const KINDS: { key: string; label: string }[] = [
  { key: "returns", label: "Qaytarilgan tovarlar" },
  { key: "defective", label: "Nuqsonli tovarlar" },
  { key: "funds", label: "Mablag' yechish" },
  { key: "supply", label: "Omborga yuborish" },
  { key: "dimensions", label: "Gabarit guruhi" },
  { key: "photo", label: "Fotosurat qo'shish" },
  { key: "other", label: "Boshqa savol" },
];

export function SupportRequestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [kind, setKind] = React.useState("returns");
  const [preview, setPreview] = React.useState<ShopRequestPreview | null>(null);
  const [text, setText] = React.useState("");
  const [job, setJob] = React.useState<ComplaintJob | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const active = jobIsActive(job);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setPreview(null);
    void (async () => {
      try {
        const [next, state] = await Promise.all([
          fetchShopRequestPreview(kind),
          fetchShopRequestJob().catch(() => null),
        ]);
        setPreview(next);
        setText(next.text);
        setJob(state && state.status !== "idle" ? state : null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Matnni tayyorlab bo'lmadi.");
      }
    })();
  }, [open, kind]);

  React.useEffect(() => {
    if (!open || job === null) return;
    const waitingReply = job.status === "done" && !job.replyText;
    if (!jobIsActive(job) && !waitingReply) return;

    const timer = setInterval(async () => {
      try {
        const next = await fetchShopRequestJob();
        setJob(next.status === "idle" ? null : next);
      } catch {
        /* tarmoq uzilishi — keyingi urinishda tiklanadi */
      }
    }, jobIsActive(job) ? 2000 : 15000);
    return () => clearInterval(timer);
  }, [open, job]);

  const onSend = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const started = await sendShopRequest(kind, text.trim());
      setJob(started);
      toast.success("Yozish boshlandi — fonda davom etadi.");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Boshlab bo'lmadi.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headphones className="h-4 w-4" /> Uzum qo&apos;llab-quvvatlashiga yozish
          </DialogTitle>
          <DialogDescription>
            Savol turini tanlang — matn ombordagi haqiqiy ma&apos;lumotdan tuziladi.
            Xabar sizning Telegram hisobingizdan yuboriladi.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={active}
              onClick={() => setKind(item.key)}
              className={
                "rounded-full border px-3 py-1 text-xs transition-colors " +
                (kind === item.key
                  ? "border-primary bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-muted")
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        {preview && !preview.supportOpen && (
          <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            Uzum qo&apos;llab-quvvatlash markazi 09:00–21:00 (Toshkent) ishlaydi. Hozir
            yozsangiz ham javob ish vaqtida keladi.
          </p>
        )}

        {preview && !preview.connected && !job && (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            Telegram hisobi ulanmagan. Integratsiyalar → Telegram bo&apos;limidan
            raqamingizni ulang.
          </p>
        )}

        {preview && preview.items > 0 && (
          <p className="text-xs text-muted-foreground">
            Ombordan {preview.items} ta tovar topildi va matnga qo&apos;shildi.
          </p>
        )}

        {job && <JobProgress job={job} />}

        {!preview && !error && (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Matn tayyorlanmoqda…
          </div>
        )}

        {preview && !active && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={job ? 8 : 13}
            className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        )}

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
            {active ? "Fonda davom etsin" : "Yopish"}
          </Button>
          {!active && (
            <Button
              size="sm"
              onClick={onSend}
              disabled={busy || !preview?.connected || !text.trim()}
            >
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {job?.status === "failed" ? "Qayta urinish" : "Yuborish"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
