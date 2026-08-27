"use client";

import * as React from "react";
import { Check, Loader2, Phone, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError, setPhone } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";

/**
 * Telefon raqami — Telegram botga ulanish kaliti.
 *
 * Bot hisobni AYNAN shu raqam bo'yicha topadi: odam botga o'z
 * raqamini yuboradi va u shu yerdagi raqam bilan solishtiriladi.
 * Boshqa bog'lovchi yo'q — shuning uchun bu maydon bo'sh bo'lsa,
 * botdan foydalanib bo'lmaydi va buni kartochka ochiq aytadi.
 */
export function PhoneCard() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const saved = user?.phone ?? null;

  React.useEffect(() => {
    setValue(saved ?? "");
  }, [saved]);

  const dirty = value.trim() !== (saved ?? "");

  const save = async () => {
    setBusy(true);
    try {
      const updated = await setPhone(value.trim());
      setUser(updated);
      toast.success("Raqam saqlandi. Endi botga /start yozing.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-4 w-4" /> Telefon raqami
        </CardTitle>
        <CardDescription>
          Telegram bot hisobingizni shu raqam bo&apos;yicha topadi. Botda raqamni
          yuborganingizda u shu yerdagisi bilan solishtiriladi.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="+998 90 123 45 67"
            inputMode="tel"
            autoComplete="tel"
            className="sm:max-w-xs"
          />
          <Button onClick={save} disabled={busy || !dirty || value.trim().length < 9}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Saqlash
          </Button>
        </div>

        {saved ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
            <Check className="h-4 w-4 shrink-0 text-success" />
            <span>
              Raqam biriktirilgan. Botda <b>/start</b> bosib, raqamni yuboring —
              buyurtma xabarlari o&apos;sha yerga keladi.
            </span>
            <a
              href="https://t.me/estatsuz_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto"
            >
              <Button size="sm" variant="outline" className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Botni ochish
              </Button>
            </a>
          </div>
        ) : (
          <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
            Raqam kiritilmagan — botdan foydalanib bo&apos;lmaydi. O&apos;zbekiston
            raqamini kiriting: <code>+998 XX XXX XX XX</code>.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
