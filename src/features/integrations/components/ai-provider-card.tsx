"use client";

import * as React from "react";
import { Check, ExternalLink, ImageIcon, KeyRound, Loader2, Pencil, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError, clearOpenAiKey, deleteAiKey, saveAiKey, saveOpenAiKey } from "@/lib/api";
import type { AiKeyState, OpenAiKeyState } from "@/lib/types";

type Props = ({ provider: "gemini"; state: AiKeyState } | { provider: "openai"; state: OpenAiKeyState }) & { onSaved: () => void | Promise<void> };

export function AiProviderCard({ provider, state, onSaved }: Props) {
  const [value, setValue] = React.useState("");
  const [editing, setEditing] = React.useState(!state.configured);
  const [busy, setBusy] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const busyRef = React.useRef(false);
  const editRef = React.useRef<HTMLButtonElement>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const name = provider === "gemini" ? "Google Gemini" : "OpenAI";
  const Icon = provider === "gemini" ? Sparkles : ImageIcon;
  const keyUrl = provider === "gemini" ? state.studioUrl : state.platformUrl;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busyRef.current || !value.trim()) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await (provider === "gemini" ? saveAiKey(value.trim()) : saveOpenAiKey(value.trim()));
      setValue("");
      setEditing(false);
      toast.success(`${name} kaliti saqlandi`);
      await onSaved();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Kalit saqlanmadi. Qayta urinib ko'ring.");
    } finally { busyRef.current = false; setBusy(false); }
  };

  const remove = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await (provider === "gemini" ? deleteAiKey() : clearOpenAiKey());
      setValue("");
      setConfirmDelete(false);
      setEditing(true);
      toast.success(`${name} kaliti o‘chirildi`);
      await onSaved();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Kalit o'chirilmadi.");
    } finally { busyRef.current = false; setBusy(false); }
  };

  return (
    <article className="min-w-0 rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${state.configured ? "bg-[var(--ok)]/10 text-[var(--ok)]" : "bg-muted text-muted-foreground"}`}>{state.configured ? <Check className="size-3.5" /> : <KeyRound className="size-3.5" />}{state.configured ? "Kalit kiritilgan" : "Kalit kerak"}</span></div>
      <h3 className="mt-4 text-base font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{provider === "gemini" ? "Tovar matnlari va SEO yordamchisi" : "Tovar rasmlarini yaratish"}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{provider === "gemini" ? "Nomi, tavsifi va xususiyatlarini AI yordamida tayyorlang." : "Tovar uchun yangi vizuallar yarating. Bu kalitsiz ham matn va xususiyatlar bilan ishlash mumkin."}</p>
      <div className="mt-5 flex flex-wrap gap-2"><Button asChild variant="outline" className="min-h-11 rounded-xl"><a href={keyUrl} target="_blank" rel="noreferrer">Kalit olish <ExternalLink /></a></Button>{state.configured && !editing && <Button variant="secondary" className="min-h-11 rounded-xl" onClick={() => setEditing(true)}><Pencil /> O‘zgartirish</Button>}</div>
      {(editing || !state.configured) && <form onSubmit={save} className="mt-5 space-y-4 border-t pt-5"><div className="space-y-2"><Label htmlFor={`${provider}-api-key`}>{state.configured ? "Yangi API kaliti" : "API kaliti"}</Label><Input ref={inputRef} id={`${provider}-api-key`} type="password" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder={provider === "gemini" ? "AIza…" : "sk-…"} className="min-h-11 rounded-xl" value={value} onChange={(event) => setValue(event.target.value)} disabled={busy} aria-describedby={`${provider}-key-help`} /><p id={`${provider}-key-help`} className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" />Saqlangan kalit bu sahifada qayta ko‘rsatilmaydi.</p></div><div className="flex flex-wrap gap-2"><Button type="submit" className="min-h-11 rounded-xl" disabled={busy || !value.trim()}>{busy ? <Loader2 className="motion-safe:animate-spin" /> : <Check />} Saqlash</Button>{state.configured && <><Button type="button" variant="outline" className="min-h-11 rounded-xl" disabled={busy} onClick={() => { setEditing(false); setValue(""); }}>Bekor qilish</Button><Button ref={editRef} type="button" variant="ghost" className="min-h-11 rounded-xl text-destructive hover:text-destructive" disabled={busy} onClick={() => setConfirmDelete(true)}><Trash2 /> O‘chirish</Button></>}</div></form>}
      <Dialog open={confirmDelete} onOpenChange={(open) => { if (!busyRef.current) setConfirmDelete(open); }}><DialogContent onOpenAutoFocus={(event) => { event.preventDefault(); cancelRef.current?.focus(); }} onCloseAutoFocus={(event) => { event.preventDefault(); (editRef.current ?? inputRef.current)?.focus(); }} className="w-[calc(100%-2rem)] max-w-md rounded-2xl [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center"><DialogHeader className="pr-8"><DialogTitle>{name} kaliti o‘chirilsinmi?</DialogTitle><DialogDescription>Bu xizmat orqali AI funksiyalari ishlashi uchun kalitni qayta kiritish kerak bo‘ladi. Tayyor tovarlar o‘chirilmaydi.</DialogDescription></DialogHeader><DialogFooter><Button ref={cancelRef} variant="outline" className="min-h-11 rounded-xl" disabled={busy} onClick={() => setConfirmDelete(false)}>Bekor qilish</Button><Button variant="destructive" className="min-h-11 rounded-xl" disabled={busy} onClick={() => void remove()}>{busy && <Loader2 className="motion-safe:animate-spin" />}Kalitni o‘chirish</Button></DialogFooter></DialogContent></Dialog>
    </article>
  );
}
