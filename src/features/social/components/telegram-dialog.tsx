"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, connectSocialAccount } from "@/lib/api";

/**
 * Telegram kanalini ulash.
 *
 * OAuth yo'q — BotFather tokeni va kanal manzili yetadi. Ulanish paytida
 * bot kanalda admin ekani darhol tekshiriladi: buni keyin, e'lon
 * qilmoqchi bo'lganda bilish ancha yomon.
 */
export function TelegramDialog({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}) {
  const [token, setToken] = React.useState("");
  const [chat, setChat] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const savingRef = React.useRef(false);

  React.useEffect(() => {
    if (open) {
      setToken("");
      setChat("");
    }
  }, [open]);

  const valid = token.trim().length > 20 && chat.trim().length > 1;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const account = await connectSocialAccount({
        platform: "telegram",
        credential: token.trim(),
        chat: chat.trim(),
      });
      toast.success(`${account.name ?? account.username ?? "Kanal"} ulandi`);
      onConnected();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ulanmadi.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!savingRef.current) onOpenChange(nextOpen); }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8 leading-snug">
            <Send className="h-4 w-4" /> Telegram kanalini ulash
          </DialogTitle>
          <DialogDescription>
            Kanalga tovarlarni bir tugma bilan joylash uchun.
          </DialogDescription>
        </DialogHeader>

        <ol className="list-decimal space-y-2 rounded-xl border bg-muted/40 p-4 pl-8 text-sm leading-relaxed text-muted-foreground">
          <li>
            Telegram&apos;da{" "}<span className="font-medium text-foreground">@BotFather</span>{" "}ga yozing →{" "}<code className="text-xs">/newbot</code>{" "}→ bot yarating.
          </li>
          <li>BotFather bergan tokenni nusxalang.</li>
          <li>
            Botni kanalingizga{" "}<span className="font-medium text-foreground">admin</span>{" "}qilib qo&apos;shing (xabar yuborish huquqi bilan).
          </li>
        </ol>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tg-token">Bot tokeni</Label>
            <Input
              id="tg-token"
              type="password"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={saving}
              className="min-h-11 rounded-xl text-base sm:text-sm"
              placeholder="1234567890:AAH..."
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tg-chat">Kanal manzili</Label>
            <Input
              id="tg-chat"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={saving}
              className="min-h-11 rounded-xl text-base sm:text-sm"
              placeholder="@dokonim"
              value={chat}
              onChange={(event) => setChat(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Kanal ochiq bo&apos;lsa @ bilan yozing. Yopiq kanal uchun uning
              raqamli id&apos;sini kiriting.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="min-h-11 rounded-xl" disabled={saving} onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" className="min-h-11 rounded-xl" disabled={saving || !valid}>
              {saving ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" /> : null}
              {saving ? "Ulanmoqda…" : "Kanalni ulash"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
