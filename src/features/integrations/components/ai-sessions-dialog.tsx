"use client";

/*
 * AI suhbatlari — BITTA VAZIFA = BITTA SESSIYA = BITTA TASHQI SUHBAT.
 *
 * Sotuvchi talabi: har ish o'z chatida, bir-biriga aralashmasin; hamma
 * savol, javob va rasm saqlansin; bitta sessiyani ko'p ishga ishlatmaslik.
 * Backend kafolatlari — `my-stats-back/src/integrations/ai_web/session_manager.py`.
 *
 * Bu oyna:
 *  - ro'yxat (Faol / Yakunlangan / Xato) — shu do'kon sessiyalari;
 *  - suhbat: savollar, javoblar, kiruvchi va AI yaratgan rasmlar, xatolar;
 *  - javob FONDA keladi — pufakchada progress va taxminiy qolgan vaqt (§1);
 *  - faol sessiyada davom ettirish (rasm bilan ham) va «Yakunlash»;
 *  - «Yangi suhbat» — yangi vazifa, yangi sessiya.
 */

import * as React from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Layers,
  Loader2,
  MessageSquarePlus,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ApiError,
  closeAiWebSession,
  continueAiWebSession,
  fetchAiWebSessionDetail,
  fetchAiWebSessions,
  mediaUrl,
  startAiWebSession,
} from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiChatImage, AiChatMessage, AiChatSession } from "@/lib/types";

type Provider = "gemini_web" | "chatgpt_web";
type Filter = "all" | "active" | "completed" | "failed";

const PROVIDER_LABEL: Record<string, string> = { gemini_web: "Gemini", gemini_web_2: "Gemini (2)", chatgpt_web: "ChatGPT" };

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Hammasi" },
  { value: "active", label: "Faol" },
  { value: "completed", label: "Yakunlangan" },
  { value: "failed", label: "Xato" },
];

const CLOSE_REASON: Record<string, string> = {
  done: "vazifa tugadi",
  manual: "qo'lda yakunlandi",
  idle: "uzoq ishlatilmadi",
  chat_lost: "saytdagi suhbat yo'qolgan",
  duplicate: "takroriy sessiya",
};

/** Xato turiga qarab sotuvchiga aniq keyingi qadam. */
const STATUS_HINT: Record<string, string> = {
  needs_auth: "Hisobga kirilmagan — Integratsiyalar → «Oyna orqali kirish».",
  captcha: "Sayt «robot emasligingizni» tekshiryapti — «Oyna orqali kirish»da bir marta o'zingiz o'ting.",
  chat_lost: "Vazifaning suhbati saytda topilmadi — kontekst aralashmasligi uchun savol yuborilmadi. Yangi suhbat oching.",
};

const MAX_FILES = 6;

function statusBadge(s: AiChatSession) {
  if (s.pending) return <Badge variant="secondary" className="gap-1"><Loader2 className="size-3 animate-spin" />javob kutilmoqda</Badge>;
  if (s.status === "active") return <Badge variant="success">faol</Badge>;
  if (s.status === "completed") return <Badge variant="secondary">yakunlangan</Badge>;
  if (s.status === "failed") return <Badge variant="destructive">xato</Badge>;
  return <Badge variant="outline">yopilgan</Badge>;
}

/** Fondagi javob: o'tgan vaqt / o'lchangan o'rtacha → progress va qolgan vaqt. */
function PendingBubble({ since, eta }: { since: string | null; eta: number | null }) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = since ? Math.max(0, Math.round((now - new Date(since).getTime()) / 1000)) : 0;
  const expected = eta && eta > 0 ? eta : 60;
  const percent = Math.min(95, Math.round((elapsed / expected) * 100));
  const left = expected - elapsed;
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        <Bot className="size-3 text-primary" /> AI javob yozmoqda
      </div>
      <div className="w-full max-w-sm rounded-2xl rounded-bl-xs border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            {left > 0 ? `~${left} s qoldi` : "odatdagidan uzoqroq…"}
          </span>
          <span className="tabular-nums text-muted-foreground">{`${elapsed} s`}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {eta ? `O‘rtacha javob vaqti ${eta} s (so‘nggi javoblar bo‘yicha).` : "Oynani yopsangiz ham javob saqlanadi."}
        </p>
      </div>
    </div>
  );
}

function Images({ images }: { images: AiChatImage[] }) {
  if (!images?.length) return null;
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {images.map((img, idx) => (
        <a
          key={`${img.url}-${idx}`}
          href={img.url ? mediaUrl(img.url) : undefined}
          target="_blank"
          rel="noreferrer"
          className="group relative block overflow-hidden rounded-xl border bg-background"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.url ? mediaUrl(img.url) : ""} alt={img.name || `Rasm ${idx + 1}`} className="h-28 w-full object-cover transition-transform group-hover:scale-105" />
          <span className="absolute bottom-1 left-1 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px]">
            {img.role === "generated" ? "✨ AI yaratdi" : "📎 Yuborilgan"}
          </span>
        </a>
      ))}
    </div>
  );
}

function Message({ msg, provider }: { msg: AiChatMessage; provider: string }) {
  if (msg.role === "system") {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
        <span>{msg.error || msg.content}{msg.status && STATUS_HINT[msg.status] ? ` ${STATUS_HINT[msg.status]}` : ""}</span>
      </div>
    );
  }
  const isUser = msg.role === "user";
  const failed = !isUser && Boolean(msg.error);
  return (
    <div className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
      <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        {isUser ? <><span>Siz</span><User className="size-3" /></> : <><Bot className="size-3 text-primary" /><span>{PROVIDER_LABEL[provider] ?? provider}</span></>}
        {msg.durationMs ? <span>{`· ${(msg.durationMs / 1000).toFixed(1)} s`}</span> : null}
        <span>{`· ${formatDate(new Date(msg.createdAt))}`}</span>
      </div>
      <div
        className={cn(
          "max-w-[88%] whitespace-pre-wrap rounded-2xl p-4 text-sm leading-relaxed",
          isUser && "rounded-br-xs bg-primary text-primary-foreground",
          !isUser && !failed && "rounded-bl-xs border bg-muted/40 text-foreground",
          failed && "rounded-bl-xs border border-destructive/30 bg-destructive/5 text-foreground",
        )}
      >
        {failed ? (
          <span className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span>
              {msg.error}
              {msg.status && STATUS_HINT[msg.status] ? (
                <span className="mt-1 block text-xs text-muted-foreground">{STATUS_HINT[msg.status]}</span>
              ) : null}
            </span>
          </span>
        ) : (
          msg.content
        )}
        <Images images={msg.images} />
      </div>
    </div>
  );
}

function Composer({
  busy,
  placeholder,
  onSend,
  provider,
  onProvider,
}: {
  busy: boolean;
  placeholder: string;
  onSend: (prompt: string, files: File[]) => Promise<boolean>;
  provider?: Provider;
  onProvider?: (p: Provider) => void;
}) {
  const [text, setText] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const previews = React.useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  React.useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || busy) return;
    if (await onSend(text.trim(), files)) {
      setText("");
      setFiles([]);
    }
  };

  return (
    <form onSubmit={submit} className="shrink-0 space-y-2 border-t bg-background p-3">
      {onProvider && (
        <div className="inline-flex rounded-lg border bg-muted/20 p-0.5 text-xs">
          {(["gemini_web", "chatgpt_web"] as Provider[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onProvider(p)}
              className={cn("rounded-md px-3 py-1 font-medium", provider === p ? "bg-background shadow-xs" : "text-muted-foreground")}
            >
              {PROVIDER_LABEL[p]}
            </button>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={`${f.name}-${i}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previews[i]} alt={f.name} className="size-14 rounded-lg border object-cover" />
              <button
                type="button"
                aria-label={`${f.name}: olib tashlash`}
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="absolute -right-1.5 -top-1.5 rounded-full border bg-background p-0.5"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = "";
            const next = [...files, ...picked].slice(0, MAX_FILES);
            if (files.length + picked.length > MAX_FILES) toast.error(`Ko‘pi bilan ${MAX_FILES} ta rasm.`);
            setFiles(next);
          }}
        />
        <Button type="button" variant="outline" size="icon" className="size-11 shrink-0 rounded-xl" aria-label="Rasm biriktirish" onClick={() => fileRef.current?.click()} disabled={busy}>
          <ImagePlus className="size-4" />
        </Button>
        <Textarea
          rows={2}
          value={text}
          placeholder={placeholder}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          className="min-h-11 flex-1 resize-none rounded-xl text-sm"
          disabled={busy}
        />
        <Button type="submit" className="size-11 shrink-0 rounded-xl" size="icon" aria-label="Yuborish" disabled={busy || !text.trim()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </form>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Berilsa oyna «Yangi suhbat» holatida shu provayder bilan ochiladi. */
  newChatProvider?: Provider | null;
}

export function AiSessionsDialog({ open, onOpenChange, newChatProvider }: Props) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [sessions, setSessions] = React.useState<AiChatSession[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<AiChatSession | null>(null);
  const [composing, setComposing] = React.useState<Provider | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const loadList = React.useCallback(async () => {
    try {
      const rows = await fetchAiWebSessions({ limit: 60, ...(filter === "all" ? {} : { status: filter }) });
      setSessions(rows);
      return rows;
    } catch {
      return [];
    }
  }, [filter]);

  const loadDetail = React.useCallback(async (id: string) => {
    try {
      const next = await fetchAiWebSessionDetail(id);
      setDetail(next);
      return next;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setDetail(null);
      return null;
    }
  }, []);

  // Ochilganda: yangi suhbat rejimi yoki ro'yxat + birinchi sessiya.
  React.useEffect(() => {
    if (!open) return;
    setComposing(newChatProvider ?? null);
    setLoading(true);
    void loadList().then((rows) => {
      setLoading(false);
      if (!newChatProvider && rows.length && !selectedId) setSelectedId(rows[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, newChatProvider, filter]);

  React.useEffect(() => {
    if (open && selectedId && !composing) void loadDetail(selectedId);
  }, [open, selectedId, composing, loadDetail]);

  // Javob fonda kelayotganda so'rab turamiz (2 s), tugagach ro'yxatni ham yangilaymiz.
  const pending = Boolean(detail?.pending);
  React.useEffect(() => {
    if (!open || !pending || !detail) return;
    const t = setInterval(async () => {
      const next = await loadDetail(detail.id);
      if (next && !next.pending) void loadList();
    }, 2000);
    return () => clearInterval(t);
  }, [open, pending, detail, loadDetail, loadList]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [detail?.messages.length, pending]);

  const sendNew = async (prompt: string, files: File[]) => {
    if (!composing) return false;
    setBusy(true);
    try {
      const created = await startAiWebSession(composing, prompt, files);
      setComposing(null);
      setSelectedId(created.id);
      setDetail(created);
      void loadList();
      return true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Suhbatni boshlab bo‘lmadi.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const sendMore = async (prompt: string, files: File[]) => {
    if (!detail) return false;
    setBusy(true);
    try {
      setDetail(await continueAiWebSession(detail.id, prompt, files));
      return true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuborib bo‘lmadi.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      setDetail(await closeAiWebSession(detail.id));
      toast.success("Vazifa yakunlandi — keyingi ish yangi suhbatda boshlanadi.");
      void loadList();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yakunlab bo‘lmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88vh] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="shrink-0 border-b p-5 pb-3">
          <div className="flex items-center gap-2.5 pr-8">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold">AI suhbatlari</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs">
                Har vazifa o‘z suhbatida — bir-biriga aralashmaydi. Savollar, javoblar va rasmlar saqlanadi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 divide-y md:grid-cols-[300px_minmax(0,1fr)] md:divide-x md:divide-y-0">
          <aside className="flex min-h-0 flex-col bg-muted/10">
            <div className="shrink-0 space-y-2 p-3">
              <Button className="h-10 w-full rounded-xl" onClick={() => { setComposing("gemini_web"); setDetail(null); setSelectedId(null); }}>
                <MessageSquarePlus className="size-4" /> Yangi suhbat
              </Button>
              <div className="flex flex-wrap gap-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium",
                      filter === f.value ? "bg-card shadow-xs ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
              {loading ? (
                <div className="flex h-40 items-center justify-center text-xs text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" /> Yuklanmoqda…</div>
              ) : sessions.length === 0 ? (
                <p className="p-6 text-center text-xs text-muted-foreground">Bu bo‘limda suhbat yo‘q.</p>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setComposing(null); setSelectedId(s.id); }}
                    className={cn(
                      "w-full space-y-1.5 rounded-xl border p-3 text-left text-xs transition-colors",
                      s.id === selectedId && !composing ? "border-primary/40 bg-card ring-1 ring-primary/20" : "border-transparent bg-card/50 hover:bg-card",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                        {s.provider.startsWith("gemini_web") ? <Sparkles className="size-3.5 shrink-0 text-primary" /> : <Bot className="size-3.5 shrink-0 text-primary" />}
                        <span className="truncate">{s.title}</span>
                      </span>
                      {statusBadge(s)}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{`${s.taskType} · ${s.turnCount} savol${s.imageCount ? ` · ${s.imageCount} rasm` : ""}`}</span>
                      <span className="shrink-0">{formatDate(new Date(s.createdAt))}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col bg-background">
            {composing ? (
              <>
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
                  <MessageSquarePlus className="size-8 text-primary/60" />
                  <p className="text-sm font-medium">Yangi vazifa — yangi suhbat</p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    Bu savol uchun alohida sessiya ochiladi. Davomi shu suhbatda qoladi, boshqa ishlarga aralashmaydi.
                  </p>
                </div>
                <Composer busy={busy} placeholder="Savolingizni yozing…" onSend={sendNew} provider={composing} onProvider={setComposing} />
              </>
            ) : !detail ? (
              <div className="flex flex-1 items-center justify-center p-6 text-xs text-muted-foreground">Chapdan suhbatni tanlang yoki yangisini oching.</div>
            ) : (
              <>
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-5 py-3 text-xs">
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-semibold">{detail.title}</p>
                    <p className="text-muted-foreground">
                      {`${PROVIDER_LABEL[detail.provider] ?? detail.provider} · ${detail.taskType} · ${detail.turnCount} savol`}
                      {detail.closeReason ? ` · ${CLOSE_REASON[detail.closeReason] ?? detail.closeReason}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(detail)}
                    {detail.chatUrl && (
                      <Button asChild variant="outline" size="sm" className="rounded-lg">
                        <a href={detail.chatUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" /> Saytda</a>
                      </Button>
                    )}
                    {detail.status === "active" && (
                      <Button variant="outline" size="sm" className="rounded-lg" onClick={finish} disabled={busy || detail.pending}>
                        <CheckCircle2 className="size-3.5" /> Yakunlash
                      </Button>
                    )}
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                  {detail.messages.map((m) => <Message key={m.id} msg={m} provider={detail.provider} />)}
                  {detail.pending && <PendingBubble since={detail.pendingSince} eta={detail.etaSeconds} />}
                  <div ref={bottomRef} />
                </div>

                {detail.status === "active" ? (
                  <Composer busy={busy || detail.pending} placeholder="Shu vazifa bo‘yicha keyingi savol…" onSend={sendMore} />
                ) : (
                  <p className="shrink-0 border-t bg-muted/20 p-3 text-center text-xs text-muted-foreground">
                    Bu vazifa yakunlangan — suhbat faqat o‘qish uchun. Yangi ish uchun «Yangi suhbat».
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
