"use client";

import * as React from "react";
import {
  Bot,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  KeyRound,
  Loader2,
  MessageSquare,
  Pencil,
  RefreshCw,
  Send,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ApiError,
  deleteAiWebAccount,
  saveAiWebAccount,
  setAiProviderMode,
  testAiWebChat,
  verifyAiWebAccount,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiProviderMode, AiTestChatResult, AiWebAccountState } from "@/lib/types";

interface Props {
  account: AiWebAccountState;
  onChanged: () => void | Promise<void>;
  onOpenHistory?: () => void;
}

export function AiWebProviderCard({ account, onChanged, onOpenHistory }: Props) {
  const isGemini = account.provider === "gemini_web";
  const title = isGemini ? "Google Gemini Web" : "ChatGPT Web";
  const desc = isGemini
    ? "Google Gemini akkauntingiz orqali har bir tovar vazifasi uchun bepul chat scrapingdan foydalaning."
    : "ChatGPT akkauntingiz orqali har bir tovar vazifasi uchun alohida sessiyada bepul chat scrapingdan foydalaning.";
  const siteUrl = isGemini ? "https://gemini.google.com" : "https://chatgpt.com";

  const [authMethod, setAuthMethod] = React.useState<"credentials" | "cookie">("credentials");
  const [login, setLogin] = React.useState(account.login || "");
  const [password, setPassword] = React.useState("");
  const [payloadText, setPayloadText] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [testChatOpen, setTestChatOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<"" | "save" | "verify" | "delete">("");
  const [note, setNote] = React.useState<string | null>(null);

  // Test chat holati
  const [testPrompt, setTestPrompt] = React.useState(
    isGemini
      ? "Uzum Market uchun erkaklar futbolkasi sarlavhasi yozing."
      : "Tovar uchun qisqa va jozibador reklama matni yozing."
  );
  const [testResult, setTestResult] = React.useState<AiTestChatResult | null>(null);
  const [testing, setTesting] = React.useState(false);

  const isSaved = Boolean(account.saved || (account.id > 0 && account.status !== "needs_auth"));
  const isConnected = account.status === "active";
  const connectedAt = account.connectedAt || account.lastCheckedAt;

  React.useEffect(() => {
    if (account.login) setLogin(account.login);
  }, [account.login]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (authMethod === "credentials") {
      if (!login.trim()) {
        toast.error("Telefon yoki pochtani kiriting.");
        return;
      }
      if (!password.trim() && !isSaved) {
        toast.error("Parolni kiriting.");
        return;
      }
    } else {
      if (!payloadText.trim() && !isSaved) {
        toast.error("Cookie yoki sessiya tokenini kiriting.");
        return;
      }
    }

    setBusy("save");
    setNote(null);
    try {
      await saveAiWebAccount(account.provider, {
        login: login.trim() || undefined,
        password: password.trim() || undefined,
        payload: payloadText.trim() || undefined,
        name: login.trim() || undefined,
      });
      setPassword("");
      setPayloadText("");
      setEditing(false);
      toast.success("Kirish ma'lumotlari saqlandi.");
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.");
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
      setLogin("");
      setPassword("");
      setPayloadText("");
      setEditing(false);
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

  const onRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim() || testing) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testAiWebChat(account.provider, testPrompt.trim());
      setTestResult(res);
      toast.success("AI javob qaytardi!");
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Test xabari bajarilmadi.");
    } finally {
      setTesting(false);
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

        {isSaved && !editing ? (
          <div className="flex flex-col justify-between gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 space-y-1">
              <p className="text-xs text-muted-foreground">Saqlangan hisob</p>
              <p className="break-words text-sm font-medium [overflow-wrap:anywhere]">
                {account.login || account.accountEmail || account.name || "Kirish ma'lumotlari saqlangan"}
              </p>
            </div>
            <Button
              variant="outline"
              className="min-h-11 rounded-xl"
              disabled={Boolean(busy)}
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-4" />
              Tahrirlash
            </Button>
          </div>
        ) : (
          <form className="space-y-4 rounded-xl border bg-muted/15 p-4" onSubmit={onSave}>
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-xs font-medium text-muted-foreground">Ulanish usuli:</span>
              <div className="inline-flex rounded-lg border bg-background p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMethod("credentials")}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition-colors",
                    authMethod === "credentials" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Pochta va parol
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod("cookie")}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition-colors",
                    authMethod === "cookie" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Cookie / Sessiya
                </button>
              </div>
            </div>

            {authMethod === "credentials" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor={`${account.provider}-login`}>Telefon yoki pochta</Label>
                  <Input
                    id={`${account.provider}-login`}
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder={isGemini ? "fayoz@gmail.com" : "user@openai.com"}
                    autoComplete="username"
                    className="h-11 rounded-xl bg-background"
                    disabled={Boolean(busy)}
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <Label htmlFor={`${account.provider}-password`}>Parol</Label>
                  <Input
                    id={`${account.provider}-password`}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSaved ? "Yangi parolni kiriting" : "Akkaunt parolingiz"}
                    autoComplete="current-password"
                    className="h-11 rounded-xl bg-background"
                    disabled={Boolean(busy)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${account.provider}-cookie`}>Cookie yoki Sessiya tokeni</Label>
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {siteUrl.replace("https://", "")} <ExternalLink className="size-3" />
                  </a>
                </div>
                <Textarea
                  id={`${account.provider}-cookie`}
                  rows={3}
                  value={payloadText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPayloadText(e.target.value)}
                  placeholder={
                    isGemini
                      ? "__Secure-1PSID=...; __Secure-1PSIDTS=..."
                      : "__Secure-next-auth.session-token=..."
                  }
                  className="font-mono text-xs rounded-xl bg-background"
                  disabled={Boolean(busy)}
                />
              </div>
            )}

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              Parol va sessiya ma&apos;lumotlari serverda shifrlangan holda saqlanadi.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                variant="outline"
                className="min-h-11 rounded-xl"
                disabled={Boolean(busy)}
              >
                {busy === "save" && <Loader2 className="size-4 animate-spin mr-1.5" />}
                Ma&apos;lumotlarni saqlash
              </Button>
              {isSaved && (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 rounded-xl"
                  disabled={Boolean(busy)}
                  onClick={() => {
                    setEditing(false);
                    setPassword("");
                    setPayloadText("");
                    setLogin(account.login || "");
                  }}
                >
                  Bekor qilish
                </Button>
              )}
            </div>
          </form>
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
          <Button
            className="min-h-11 rounded-xl"
            onClick={onVerify}
            disabled={Boolean(busy) || !isSaved || editing}
          >
            {busy === "verify" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            )}
            Kabinetga kirish
          </Button>

          <Button
            variant="outline"
            className="min-h-11 rounded-xl"
            onClick={() => setTestChatOpen(true)}
            disabled={Boolean(busy)}
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
      </CardContent>

      {/* Hisobni unutish dialogi */}
      <Dialog open={confirmDelete} onOpenChange={(open) => { if (!busy) setConfirmDelete(open); }}>
        <DialogContent className="w-[calc(100%_-_2rem)] rounded-2xl [&>button]:min-h-11 [&>button]:min-w-11 [&>button]:right-2 [&>button]:top-2">
          <DialogHeader>
            <DialogTitle className="pr-10 leading-snug">Saqlangan hisobni unutish</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Login va kirish ma&apos;lumotlari o&apos;chiriladi. Avtomatik chat scraping uchun ularni qayta kiritishingiz kerak bo&apos;ladi.
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

      {/* Sinab ko'rish modal dialogi */}
      <Dialog open={testChatOpen} onOpenChange={setTestChatOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-primary" />
              {title} bilan sinov suhbati
            </DialogTitle>
            <DialogDescription>
              Ushbu sinov uchun yangi alohida <strong>Task Chat Session</strong> ochiladi va AI
              javobi darhol ko‘rsatiladi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onRunTest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${account.provider}-test-prompt`}>Sinov prompti:</Label>
              <Textarea
                id={`${account.provider}-test-prompt`}
                rows={3}
                required
                className="rounded-xl text-sm"
                value={testPrompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestPrompt(e.target.value)}
              />
            </div>

            {testResult && (
              <div className="space-y-2 rounded-xl border bg-muted/20 p-3 text-xs">
                <div className="flex items-center justify-between text-muted-foreground pb-2 border-b">
                  <span>Sessiya ID: <code className="text-foreground">{testResult.sessionId.slice(0, 8)}...</code></span>
                  <span>Tezlik: {testResult.assistantMessage.durationMs}ms</span>
                </div>
                <div className="pt-1">
                  <span className="font-semibold block text-primary mb-1">AI Javobi:</span>
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground bg-card p-3 rounded-lg border max-h-48 overflow-y-auto">
                    {testResult.assistantMessage.content}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl min-h-11"
                onClick={() => setTestChatOpen(false)}
              >
                Yopish
              </Button>
              <Button type="submit" className="rounded-xl min-h-11" disabled={testing || !testPrompt.trim()}>
                {testing ? <Loader2 className="size-4 animate-spin mr-1" /> : <Send className="size-4 mr-1" />}
                {testing ? "Javob olinmoqda…" : "Yuborish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
