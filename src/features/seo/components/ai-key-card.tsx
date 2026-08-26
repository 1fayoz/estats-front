"use client";

import * as React from "react";
import { Check, ExternalLink, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, deleteAiKey, saveAiKey } from "@/lib/api";
import type { AiKeyState } from "@/lib/types";

/**
 * Gemini kaliti.
 *
 * Kalitni sotuvchining o'zi Google AI Studio'dan oladi. U bazada
 * saqlanadi va QAYTIB KELMAYDI — maydon har doim bo'sh turadi.
 */
export function AiKeyCard({
  state,
  onSaved,
}: {
  state: AiKeyState;
  onSaved: () => void | Promise<void>;
}) {
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(!state.configured);

  const onSave = async () => {
    if (!value.trim()) {
      toast.error("Kalit kiriting.");
      return;
    }
    setBusy(true);
    try {
      await saveAiKey(value.trim());
      setValue("");
      toast.success("Kalit saqlandi");
      await onSaved();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteAiKey();
      toast.success("Kalit o'chirildi");
      await onSaved();
      setOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirilmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" /> Gemini (AI)
              {state.configured && (
                <Badge variant="success" className="gap-1">
                  <Check className="h-3 w-3" /> Kalit kiritilgan
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Matn yozish va rasm tahlili uchun. Kalitsiz ham SEO auditi ishlaydi,
              faqat AI qismlari yopiq bo&apos;ladi.
            </CardDescription>
          </div>
          <div className="flex shrink-0 gap-2">
            <a href={state.studioUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                Kalit olish <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
            {state.configured && !open && (
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                O&apos;zgartirish
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {open && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="gemini-key">API kaliti</Label>
              <Input
                id="gemini-key"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder={state.configured ? "saqlangan — o'zgartirish uchun yangisini kiriting" : "AIza…"}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={onSave} disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Saqlash
              </Button>
              {state.configured && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={busy}>
                    Bekor qilish
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    disabled={busy}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> O&apos;chirish
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        <p className="rounded-md border border-dashed p-2.5 text-xs text-muted-foreground">
          {"Ishlatiladigan modellar ataylab eng arzoni: matn uchun "}
          <code>gemini-2.5-flash</code>
          {", rasm uchun "}
          <code>gemini-2.5-flash-lite</code>
          {". Bu vazifalarda kattaroq model sezilarli yaxshi natija bermaydi, narxi esa bir necha barobar."}
        </p>
      </CardContent>
    </Card>
  );
}
