"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  RotateCw,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { retryBroadcast } from "@/lib/api";
import { PLATFORM_LABEL } from "@/lib/platforms";
import { useBroadcastStore, visibleBroadcasts } from "@/stores/broadcast-store";
import { cn } from "@/lib/utils";
import type { BroadcastResult } from "@/lib/types";

/**
 * Ketayotgan e'lonlar paneli.
 *
 * Layout ichida yashaydi, sahifada emas — shuning uchun boshqa bo'limga
 * o'tganda ham joyida qoladi va e'lon qanday ketayotgani ko'rinib turadi.
 * Sotuvchi tugmani bosgach kutib o'tirmasligi kerak edi, aynan shuning
 * uchun bu panel bor.
 */
export function BroadcastTray() {
  const watch = useBroadcastStore((s) => s.watch);
  const dismiss = useBroadcastStore((s) => s.dismiss);
  const items = useBroadcastStore(visibleBroadcasts);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => watch(), [watch]);

  // Tugagan e'lon o'zi yo'qolmaydi: natijani (ayniqsa xatoni) sotuvchi
  // ko'rishi kerak. Faqat hammasi ketgan bo'lsa — o'zi yopiladi.
  const shown = items.filter(
    (b) => b.active || b.failed > 0 || Date.now() - Date.parse(b.finishedAt ?? "") < 20_000,
  );
  if (shown.length === 0) return null;

  const busy = shown.some((b) => b.active);

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-50 flex w-[min(23rem,calc(100vw-2rem))] flex-col items-end gap-2 lg:bottom-6">
      <AnimatePresence initial={false}>
        {open &&
          shown.map((broadcast) => (
            <motion.div
              key={broadcast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pointer-events-auto w-full overflow-hidden rounded-xl border bg-card shadow-lg"
            >
              <BroadcastRow broadcast={broadcast} onDismiss={() => dismiss(broadcast.id)} />
            </motion.div>
          ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs shadow-lg transition-colors hover:bg-accent"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        ) : (
          <Send className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className="font-medium">
          {busy ? "E'lon ketmoqda" : "E'lonlar"} · {shown.length}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !open && "rotate-180")} />
      </button>
    </div>
  );
}

function BroadcastRow({
  broadcast,
  onDismiss,
}: {
  broadcast: BroadcastResult;
  onDismiss: () => void;
}) {
  const put = useBroadcastStore((s) => s.put);
  const [retrying, setRetrying] = React.useState(false);
  const total = broadcast.items.length || 1;
  const finished = broadcast.sent + broadcast.failed;

  const onRetry = async () => {
    setRetrying(true);
    try {
      put(await retryBroadcast(broadcast.id));
    } catch {
      toast.error("Qayta urinib bo'lmadi.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-start gap-2.5">
        {broadcast.productImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={broadcast.productImage}
            alt=""
            className="h-10 w-10 shrink-0 rounded-md border object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted">
            <Send className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {broadcast.productTitle ?? "Tovar"}
          </p>
          <p className="text-xs text-muted-foreground">
            {broadcast.active
              ? `${finished}/${total} tarmoq · ketmoqda`
              : broadcast.failed > 0
                ? `${broadcast.sent} ketdi · ${broadcast.failed} ketmadi`
                : `${broadcast.sent} tarmoqqa ketdi`}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Yopish"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn(
            "h-full rounded-full",
            broadcast.failed > 0 ? "bg-amber-500" : "bg-primary",
          )}
          animate={{ width: `${Math.round((finished / total) * 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="mt-2 space-y-1">
        {broadcast.items.map((item) => (
          <div key={item.accountId} className="flex items-center gap-1.5 text-xs">
            {item.status === "done" ? (
              <Check className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-500" />
            ) : item.status === "failed" ? (
              <AlertTriangle className="h-3 w-3 shrink-0 text-destructive" />
            ) : (
              <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
            )}
            <span className="shrink-0 text-muted-foreground">
              {PLATFORM_LABEL[item.platform] ?? item.platform}
            </span>
            {item.error ? (
              <span className="truncate text-destructive" title={item.error}>
                {item.error}
              </span>
            ) : item.permalink ? (
              <a
                href={item.permalink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 truncate text-muted-foreground hover:text-foreground hover:underline"
              >
                ochish <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {!broadcast.active && broadcast.failed > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full gap-1.5"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RotateCw className="h-3.5 w-3.5" />
          )}
          Ketmaganlariga qayta urinish
        </Button>
      )}
    </div>
  );
}
