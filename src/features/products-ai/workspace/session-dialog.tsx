"use client";

import * as React from "react";
import { ExternalLink, Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Message, PendingBubble, statusBadge } from "@/features/integrations/components/ai-sessions-dialog";
import { ApiError, fetchAiWebSessionDetail } from "@/lib/api";
import { aiAccountLabel } from "@/lib/ai-accounts";
import { formatDate } from "@/lib/format";
import type { AiChatSession } from "@/lib/types";

/**
 * Bitta sessiyaning to'liq tarixi — savollar, javoblar, rasmlar, xato.
 * Faqat O'QISH: davom ettirish Integratsiyalar → «AI suhbatlari»da
 * (u yerda rasm biriktirish va «Yakunlash» bor). Bu yerda sotuvchi
 * «aynan shu rasm/matn uchun AI nima qildi» degan savolga javob oladi.
 */
export function SessionDialog({
  sessionId,
  onClose,
}: {
  sessionId: string | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = React.useState<AiChatSession | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!sessionId) {
      setDetail(null);
      setError(null);
      return;
    }
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const fresh = await fetchAiWebSessionDetail(sessionId);
        if (!alive) return;
        setDetail(fresh);
        // Javob fonda kelayotgan bo'lsa — kelguncha so'rab turamiz.
        if (fresh.pending) timer = setTimeout(load, 2500);
      } catch (err) {
        if (alive) setError(err instanceof ApiError ? err.message : "Sessiya ochilmadi.");
      }
    };
    void load();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  return (
    <Dialog open={sessionId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[88vh] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="shrink-0 space-y-1 border-b px-5 py-4 text-left">
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-8 text-base">
            {detail ? detail.target?.label || detail.title : "Sessiya"}
            {detail && statusBadge(detail)}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-2 text-xs">
            {detail ? (
              <>
                <span>{aiAccountLabel(detail.provider)}</span>
                <span>· {detail.turnCount} savol · {detail.imageCount} rasm</span>
                <span>· {formatDate(new Date(detail.createdAt))}</span>
                {detail.chatUrl && (
                  <a href={detail.chatUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="size-3" /> Saytda ochish
                  </a>
                )}
              </>
            ) : (
              "Suhbat tarixi yuklanmoqda"
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !detail ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Yuklanmoqda…
            </div>
          ) : (
            <>
              {detail.messages.map((msg) => (
                <Message key={msg.id} msg={msg} provider={detail.provider} />
              ))}
              {detail.pending && <PendingBubble since={detail.pendingSince} eta={detail.etaSeconds} />}
              {detail.messages.length === 0 && !detail.pending && (
                <p className="text-sm text-muted-foreground">Bu sessiyada hali xabar yo&apos;q.</p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
