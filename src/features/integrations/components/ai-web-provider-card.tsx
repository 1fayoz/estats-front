"use client";

import * as React from "react";
import {
  Bot,
  CheckCircle2,
  Loader2,
  MessageSquare,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ApiError,
  deleteAiWebAccount,
  startAiWebLogin,
  setAiProviderMode,
  verifyAiWebAccount,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { AiWebVncDialog } from "./ai-web-vnc-dialog";
import type { AiProviderMode, AiWebAccountState } from "@/lib/types";

interface Props {
  account: AiWebAccountState;
  onChanged: () => void | Promise<void>;
  onOpenHistory?: () => void;
  /** Sessiyalar oynasini shu provayder bilan «Yangi suhbat» holatida ochadi. */
  onNewChat?: () => void;
}

export function AiWebProviderCard({ account, onChanged, onOpenHistory, onNewChat }: Props) {
  const isGemini = account.provider === "gemini_web";
  const title = isGemini ? "Google Gemini Web" : "ChatGPT Web";
  const desc = isGemini
    ? "Google Gemini akkauntingiz orqali har bir tovar vazifasi uchun bepul chat scrapingdan foydalaning."
    : "ChatGPT akkauntingiz orqali har bir tovar vazifasi uchun alohida sessiyada bepul chat scrapingdan foydalaning.";
  const siteUrl = isGemini ? "https://gemini.google.com" : "https://chatgpt.com";

  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [busy, setBusy] = React.useState<"" | "vnc" | "verify" | "delete">("");
  const [vncOpen, setVncOpen] = React.useState(false);
  const shopId = useUserStore((s) => s.activeShopId);
  const [note, setNote] = React.useState<string | null>(null);

  const isSaved = Boolean(account.saved || (account.id > 0 && account.status !== "needs_auth"));
  const isConnected = account.status === "active";
  const connectedAt = account.connectedAt || account.lastCheckedAt;

  const onVnc = async () => {
    if (busy) return;
    if (!shopId) {
      toast.error("Avval do'konni tanlang.");
      return;
    }
    setBusy("vnc");
    setNote(null);
    try {
      const result = await startAiWebLogin(account.provider);
      if (result.status === "busy") {
        toast.error("Kirish oynasi hozir boshqa ulanish bilan band — biroz kutib qayta urining.");
        return;
      }
      if (result.status !== "ready") {
        toast.error(result.message || "Oynani ochib bo'lmadi.");
        return;
      }
      setVncOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Oynani ochib bo'lmadi.");
    } finally {
      setBusy("");
    }
  };

  const onVerify = async () => {
    if (busy) return;
    setBusy("verify");
    setNote(null);
    try {
      const res = await verifyAiWebAccount(account.provider);
      if (res.status === "active") {
        toast.success(`${title} kabinetiga muvaffaqiyatli ulandi.`);
      } else {
        setNote(res.lastError || "Kabinetga ulanib bo'lmadi. Ma'lumotlarni tekshiring.");
        toast.error(`Ulanishda xatolik: ${res.lastError || "Faol emas"}`);
      }
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kabinetga ulanib bo'lmadi.");
    } finally {
      setBusy("");
    }
  };

  const onChangeMode = async (mode: AiProviderMode) => {
    try {
      await setAiProviderMode(account.provider, mode);
      toast.success(`Rejim "${mode.toUpperCase()}" ga o‘zgartirildi`);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Rejimni o‘zgartirib bo‘lmadi.");
    }
  };

  const onDelete = async () => {
    if (busy) return;
    setBusy("delete");
    try {
      await deleteAiWebAccount(account.provider);
      setConfirmDelete(false);
      setNote(null);
      toast.success("Kirish ma'lumotlari o'chirildi.");
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O‘chirib bo‘lmadi.");
    } finally {
      setBusy("");
    }
  };

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {isGemini ? <Sparkles className="size-4" /> : <Bot className="size-4" />}
              </span>
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            </div>
            <CardDescription className="leading-relaxed">
              {desc}
            </CardDescription>
          </div>
          <Badge variant={isConnected ? "success" : "secondary"}>
            {isConnected ? "Ulangan" : "Ulanmagan"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected && connectedAt && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0 space-y-1">
              <p className="break-words font-medium">{title} kabineti ulangan</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {new Date(connectedAt).toLocaleString("uz-UZ")}
              </p>
            </div>
          </div>
        )}

        {isSaved && (
          <div className="min-w-0 space-y-1 rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Saqlangan hisob</p>
            <p className="break-words text-sm font-medium [overflow-wrap:anywhere]">
              {account.accountEmail || account.login || account.name}
            </p>
          </div>
        )}

        {account.status === "captcha" && (
          <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed">
            Sayt «robot emasligingizni» tekshirdi va avtomatik o‘tib bo‘lmadi (kutildi, kesh tozalandi, brauzer qayta
            ochildi). «Oyna orqali qayta kirish»ni bosib tekshiruvdan bir marta o‘zingiz o‘ting — keyin avtomatika davom etadi.
          </p>
        )}
        {account.status !== "captcha" && account.lastError && !isConnected && isSaved && (
          <p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed">
            {account.lastError}
          </p>
        )}

        {note && (
          <p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed">
            {note}
          </p>
        )}

        {/* Rejim tanlash (Web / Auto / API) */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Ishlash ustuvorligi:</span>
            <span className="text-[11px] text-muted-foreground">
              {account.mode === "web"
                ? "Faqat bepul Web sessiya"
                : account.mode === "api"
                ? "Rasmiy API kaliti"
                : "Avtomatik zaxira"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/20 border">
            <button
              type="button"
              onClick={() => onChangeMode("web")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center",
                account.mode === "web"
                  ? "bg-background text-foreground shadow-xs border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              🌐 Web (Bepul)
            </button>
            <button
              type="button"
              onClick={() => onChangeMode("auto")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center",
                account.mode === "auto"
                  ? "bg-background text-foreground shadow-xs border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              🔄 Avtomatik
            </button>
            <button
              type="button"
              onClick={() => onChangeMode("api")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center",
                account.mode === "api"
                  ? "bg-background text-foreground shadow-xs border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              ⚡ API Kalit
            </button>
          </div>
        </div>

        {/* Pastki Harakatlar qatori */}
        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:flex-wrap">
          <Button className="min-h-11 rounded-xl" onClick={onVnc} disabled={Boolean(busy)}>
            {busy === "vnc" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <MonitorSmartphone className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isSaved ? "Oyna orqali qayta kirish" : "Oyna orqali kirish"}
          </Button>

          {isSaved && (
            <Button variant="outline" className="min-h-11 rounded-xl" onClick={onVerify} disabled={Boolean(busy)}>
              {busy === "verify" ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              Tekshirish
            </Button>
          )}

          <Button
            variant="outline"
            className="min-h-11 rounded-xl"
            onClick={onNewChat}
            disabled={Boolean(busy) || !isConnected || !onNewChat}
            title={isConnected ? undefined : "Avval «Oyna orqali kirish» bilan ulang"}
          >
            <MessageSquare className="size-4 mr-1.5" />
            Sinov suhbati
          </Button>

          {onOpenHistory && (
            <Button
              variant="outline"
              className="min-h-11 rounded-xl text-muted-foreground"
              onClick={onOpenHistory}
            >
              Sessiyalar tarixi
            </Button>
          )}

          {isSaved && (
            <Button
              variant="ghost"
              className="min-h-11 rounded-xl text-muted-foreground hover:text-destructive sm:ml-auto"
              onClick={() => setConfirmDelete(true)}
              disabled={Boolean(busy)}
            >
              <Trash2 className="size-4" /> Hisobni unutish
            </Button>
          )}
        </div>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          {`${siteUrl.replace("https://", "")} oynada ochiladi — hisobingizga o'zingiz kirasiz, parol eStats'da saqlanmaydi.`}
        </p>
      </CardContent>

      {shopId && (
        <AiWebVncDialog
          open={vncOpen}
          onOpenChange={setVncOpen}
          provider={account.provider}
          title={title}
          shopId={shopId}
          onConnected={() => void onChanged()}
        />
      )}

      {/* Hisobni unutish dialogi */}
      <Dialog open={confirmDelete} onOpenChange={(open) => { if (!busy) setConfirmDelete(open); }}>
        <DialogContent className="w-[calc(100%_-_2rem)] rounded-2xl [&>button]:min-h-11 [&>button]:min-w-11 [&>button]:right-2 [&>button]:top-2">
          <DialogHeader>
            <DialogTitle className="pr-10 leading-snug">Saqlangan hisobni unutish</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Saqlangan sessiya o&apos;chiriladi. Qayta ishlatish uchun «Oyna orqali kirish» bilan yana kirishingiz kerak bo&apos;ladi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="min-h-11 rounded-xl"
              disabled={Boolean(busy)}
              onClick={() => setConfirmDelete(false)}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              className="min-h-11 rounded-xl"
              disabled={Boolean(busy)}
              onClick={onDelete}
            >
              {busy === "delete" && <Loader2 className="size-4 animate-spin mr-1.5" />}
              Hisobni unutish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
}
