"use client";

import * as React from "react";
import { Check, ExternalLink, ImageIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, clearOpenAiKey, saveOpenAiKey } from "@/lib/api";
import type { OpenAiKeyState } from "@/lib/types";

/**
 * OpenAI kaliti — FAQAT rasm generatsiyasi uchun.
 *
 * Loyihada GPT boshqa hech qayerda ishlatilmaydi: matn, tahlil va
 * xususiyatlar Gemini'da, chunki u shu ishlarda sezilarli arzon.
 *
 * Kalit bazada saqlanadi va QAYTIB KELMAYDI — maydon har doim
 * bo'sh turadi, faqat "kiritilgan" degan holat ko'rinadi.
 */
export function OpenAiKeyCard({
  state,
  onSaved,
}: {
  state: OpenAiKeyState;
  onSaved: () => void | Promise<void>;
}) {
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(!state.configured);

  const price = state.imagePriceUsd
    ? `$${state.imagePriceUsd.toFixed(3)}`
    : "$0.042";

  const onSave = async () => {
    if (!value.trim()) {
      toast.error("Kalit kiriting.");
      return;
    }
    setBusy(true);
    try {
      await saveOpenAiKey(value.trim());
      setValue("");
      toast.success("Kalit saqlandi — endi rasm yasaladi.");
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
      await clearOpenAiKey();
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
              <ImageIcon className="h-4 w-4" /> OpenAI (rasm)
              {state.configured && (
                <Badge variant="success" className="gap-1">
                  <Check className="h-3 w-3" /> Kalit kiritilgan
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Tovar rasmini yasash uchun. Kalitsiz ham AI kartochka tayyorlaydi —
              matn, xususiyat va MXIK ishlaydi, faqat rasm yasalmaydi.
            </CardDescription>
          </div>
          <div className="flex shrink-0 gap-2">
            <a href={state.platformUrl} target="_blank" rel="noreferrer">
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
              <Label htmlFor="openai-key">API kaliti</Label>
              <Input
                id="openai-key"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder={
                  state.configured
                    ? "saqlangan — o'zgartirish uchun yangisini kiriting"
                    : "sk-…"
                }
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(false)}
                    disabled={busy}
                  >
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

        {/*
          Narx ochiq aytiladi. Rasm quvurdagi eng qimmat qadam va
          sotuvchi buni tugmani bosishdan OLDIN bilishi kerak —
          keyin hisobdan bilib qolish yoqimsiz.
        */}
        <p className="rounded-md border border-dashed p-2.5 text-xs text-muted-foreground">
          {"Bitta rasm taxminan "}
          <b>{price}</b>
          {" turadi — kartochkaning matn qismidan ~15 barobar qimmat. Shuning "}
          {"uchun AI faqat asosiy rasmni yasaydi va natijani arzon model "}
          {"tekshiradi: mos kelmasa, ikki martagacha qayta yasaydi."}
        </p>
      </CardContent>
    </Card>
  );
}
