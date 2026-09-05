"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
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
import { ApiError, fetchComplaintJob, fetchComplaintPreview, sendComplaint } from "@/lib/api";
import type { ComplaintJob, ComplaintPreview } from "@/lib/types";
import { JobProgress, jobIsActive } from "./job-progress";

interface Props {
  productId: number | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Uzum moderatsiya operatoriga (`@umarket_business_bot`) xabar.
 *
 * Yuborish FONDA ketadi: bot menyusi bo'ylab yurish 20-40 soniya
 * oladi (bot javobini kutish + odam kabi tanaffuslar), sotuvchi
 * shuncha vaqt oynaga tikilib o'tirmasligi kerak. Oyna yopilsa ham
 * ish davom etadi va qayta ochilganda holat o'sha yerdan ko'rinadi.
 *
 * Operatorning JAVOBI ham shu yerda ko'rinadi — Telegramni ochish
 * shart emas.
 */
export function ComplaintDialog({ productId, onOpenChange }: Props) {
  const [preview, setPreview] = React.useState<ComplaintPreview | null>(null);
  const [text, setText] = React.useState("");
  const [job, setJob] = React.useState<ComplaintJob | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const active = jobIsActive(job);

  // Matn va mavjud fon vazifasi — oyna ochilganda birga o'qiladi:
  // ish allaqachon ketayotgan bo'lsa progress darhol ko'rinadi.
  React.useEffect(() => {
    if (productId == null) return;
    setPreview(null);
    setError(null);
    void (async () => {
      try {
        const [next, state] = await Promise.all([
          fetchComplaintPreview(productId),
          fetchComplaintJob(productId).catch(() => null),
        ]);
        setPreview(next);
        setText(next.text);
        setJob(state && state.status !== "idle" ? state : null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Matnni tayyorlab bo'lmadi.");
      }
    })();
  }, [productId]);

  // Ish ketayotganda holatni so'rab turamiz. Tugagach ham bir necha
  // daqiqa davom etadi: operator javobi keyinroq keladi.
  React.useEffect(() => {
    if (productId == null || job === null) return;
    const waitingReply = job.status === "done" && !job.replyText;
    if (!jobIsActive(job) && !waitingReply) return;

    const timer = setInterval(async () => {
      try {
        const next = await fetchComplaintJob(productId);
        setJob(next.status === "idle" ? null : next);
      } catch {
        /* tarmoq uzilishi — keyingi urinishda o'zi tiklanadi */
      }
    }, jobIsActive(job) ? 2000 : 15000);
    return () => clearInterval(timer);
  }, [productId, job]);

  const onSend = async () => {
    if (productId == null || !text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const started = await sendComplaint(productId, text.trim(), Boolean(preview?.lastSentAt));
      setJob(started);
      toast.success("Yozish boshlandi — fonda davom etadi, kutib turish shart emas.");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Boshlab bo'lmadi.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const alreadySent = preview?.lastSentAt ? new Date(preview.lastSentAt) : null;

  return (
    <Dialog open={productId != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" /> Uzum operatoriga yozish
          </DialogTitle>
          <DialogDescription>
            Xabar sizning Telegram hisobingizdan <b>@umarket_business_bot</b> ga
            yuboriladi. Matnni tahrirlashingiz mumkin.
          </DialogDescription>
        </DialogHeader>

        {!preview && !error && (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Matn tayyorlanmoqda…
          </div>
        )}

        {preview && !preview.connected && !job && (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            Telegram hisobi ulanmagan. Integratsiyalar → Telegram bo&apos;limidan
            raqamingizni ulang, keyin bu yerdan yuborasiz.
          </p>
        )}

        {job && <JobProgress job={job} />}

        {alreadySent && !job && (
          <p className="text-xs text-muted-foreground">
            Bu tovar bo&apos;yicha oxirgi marta {alreadySent.toLocaleString("uz-UZ")} da
            yozilgan.
          </p>
        )}

        {preview && !active && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={job ? 8 : 14}
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
              {job?.status === "failed"
                ? "Qayta urinish"
                : job?.status === "done"
                  ? "Yana yozish"
                  : alreadySent
                    ? "Baribir yuborish"
                    : "Yuborish"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
