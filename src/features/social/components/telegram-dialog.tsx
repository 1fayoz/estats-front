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

  React.useEffect(() => {
    if (open) {
      setToken("");
      setChat("");
    }
  }, [open]);

  const valid = token.trim().length > 20 && chat.trim().length > 1;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" /> Telegram kanalini ulash
          </DialogTitle>
          <DialogDescription>
            Kanalga tovarlarni bir tugma bilan joylash uchun.
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          <li>
            1. Telegram&apos;da <span className="font-medium text-foreground">@BotFather</span> ga
            yozing → <code className="text-xs">/newbot</code> → bot yarating.
          </li>
          <li>2. BotFather bergan tokenni nusxalang.</li>
          <li>
            3. Botni kanalingizga <span className="font-medium text-foreground">admin</span> qilib
            qo&apos;shing (xabar yuborish huquqi bilan).
          </li>
        </ol>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tg-token">Bot tokeni</Label>
            <Input
              id="tg-token"
              autoFocus
              placeholder="1234567890:AAH..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tg-chat">Kanal manzili</Label>
            <Input
              id="tg-chat"
              placeholder="@dokonim"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Kanal ochiq bo&apos;lsa @ bilan yozing. Yopiq kanal uchun uning
              raqamli id&apos;sini kiriting.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={saving || !valid}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Ulash
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
