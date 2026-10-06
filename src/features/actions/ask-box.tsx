"use client";

import * as React from "react";
import { ChevronDown, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { askData, fetchAskJob, type AskJob } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * «Ma'lumot bilan suhbat» — javob faqat do'konning o'z raqamlaridan (P&L 30 kun,
 * ochiq tavsiyalar). AI javobi fonda yoziladi: o'tgan vaqt va o'lchangan
 * o'rtacha javob vaqti bo'yicha taxmin ko'rsatiladi.
 */
export function AskBox() {
  const [question, setQuestion] = React.useState("");
  const [job, setJob] = React.useState<AskJob | null>(null);
  const [showContext, setShowContext] = React.useState(false);

  React.useEffect(() => {
    if (!job || job.status !== "running") return;
    const t = window.setInterval(async () => {
      try {
        setJob(await fetchAskJob(job.job));
      } catch {
        /* keyingi urinishda */
      }
    }, 3000);
    return () => window.clearInterval(t);
  }, [job]);

  const submit = async () => {
    if (!question.trim()) return;
    try {
      setShowContext(false);
      setJob(await askData(question));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Savol yuborilmadi");
    }
  };

  const running = job?.status === "running";
  const elapsed = Math.round(job?.elapsedSeconds ?? 0);
  const left = job ? Math.max(0, Math.round(job.expectedSeconds - elapsed)) : 0;
  const pct = job ? Math.min(95, Math.round((elapsed / Math.max(job.expectedSeconds, 1)) * 100)) : 0;

  return (
    <Card>
      <CardContent className="space-y-3 py-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          <h2 className="text-sm font-semibold">Ma&apos;lumot bilan suhbat</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Javob faqat do&apos;koningizning o&apos;z raqamlaridan (oxirgi 30 kun, FIFO tannarx, ochiq tavsiyalar).
          Ma&apos;lumotda yo&apos;q narsani AI «ma&apos;lumotim yo&apos;q» deb aytadi.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !running && void submit()}
            maxLength={500}
            placeholder="Masalan: qaysi tovar eng ko'p foyda beryapti va qaysi biri zarar?"
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <Button size="sm" onClick={() => void submit()} disabled={running || !question.trim()}>
            {running ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            So&apos;rash
          </Button>
        </div>

        {running && (
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              AI javob yozmoqda · {elapsed} s{left > 0 ? ` · taxminan ${left} s qoldi` : " · odatdagidan uzoqroq"}
            </p>
          </div>
        )}

        {job?.status === "failed" && <p className="text-sm text-destructive">{job.error}</p>}

        {job?.status === "done" && (
          <div className="space-y-2">
            <p className="whitespace-pre-line text-sm">{job.answer}</p>
            {job.context && (
              <>
                <button
                  type="button"
                  onClick={() => setShowContext((v) => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className={cn("size-4 transition-transform", showContext && "rotate-180")} />
                  Qaysi raqamlardan
                </button>
                {showContext && (
                  <pre className="max-h-72 overflow-auto rounded-md border bg-background/60 p-3 text-[11px]">
                    {JSON.stringify(job.context, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
