"use client";

import * as React from "react";
import {
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  ImageIcon,
  Layers,
  Loader2,
  MessageSquare,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchAiWebSessionDetail, fetchAiWebSessions } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiChatSession } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiSessionsDialog({ open, onOpenChange }: Props) {
  const [sessions, setSessions] = React.useState<AiChatSession[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selectedSession, setSelectedSession] = React.useState<AiChatSession | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  // Ro'yxatni yuklash
  React.useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    fetchAiWebSessions({ limit: 50 })
      .then((res) => {
        if (!active) return;
        setSessions(res);
        if (res.length > 0 && !selectedId) {
          setSelectedId(res[0].id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, selectedId]);

  // Tanlangan sessiya tafsilotini yuklash
  React.useEffect(() => {
    if (!selectedId || !open) return;
    let active = true;
    setLoadingDetail(true);
    fetchAiWebSessionDetail(selectedId)
      .then((res) => {
        if (active) setSelectedSession(res);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingDetail(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 rounded-2xl overflow-hidden gap-0">
        <DialogHeader className="p-5 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="size-5" />
              </span>
              <div>
                <DialogTitle className="text-base font-semibold">AI Sessiyalar va Suhbatlar Tarixi</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Har bir vazifa (task) uchun alohida ochilgan chat sessiyalari, promptlar va rasmlar.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] flex-1 min-h-0 divide-y md:divide-y-0 md:divide-x">
          {/* Chap ustun: Sessiyalar ro'yxati */}
          <aside className="overflow-y-auto p-3 space-y-1.5 bg-muted/10">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-xs gap-2">
                <Loader2 className="size-5 animate-spin text-primary" />
                Sessiyalar yuklanmoqda…
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Hozircha AI sessiyalari ochilmagan. Mahsulot yaratishda yoki sinovda avtomatik ochiladi.
              </div>
            ) : (
              sessions.map((item) => {
                const isSelected = item.id === selectedId;
                const isGemini = item.provider.includes("gemini");
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all border text-xs space-y-1.5",
                      isSelected
                        ? "bg-card border-primary/40 shadow-xs ring-1 ring-primary/20"
                        : "bg-card/50 hover:bg-card border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-foreground truncate flex items-center gap-1.5">
                        {isGemini ? (
                          <Sparkles className="size-3.5 text-primary shrink-0" />
                        ) : (
                          <Bot className="size-3.5 text-primary shrink-0" />
                        )}
                        {item.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                        {item.taskType}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span className="truncate max-w-[140px] font-mono">
                        {item.provider}
                      </span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </aside>

          {/* O'ng ustun: Suhbat va rasmlar oqimi */}
          <section className="flex flex-col flex-1 min-h-0 bg-background overflow-hidden">
            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground text-xs gap-2">
                <Loader2 className="size-6 animate-spin text-primary" />
                Suhbat yuklanmoqda…
              </div>
            ) : !selectedSession ? (
              <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground text-xs p-6 text-center">
                <MessageSquare className="size-8 text-muted-foreground/50 mb-2" />
                Chap tomondan biror sessiyani tanlang.
              </div>
            ) : (
              <>
                {/* Sessiya haqida qisqacha tepa qator */}
                <div className="p-3.5 px-5 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{selectedSession.title}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedSession.provider}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                    <span className="font-mono">ID: {selectedSession.id.slice(0, 8)}...</span>
                    <span>Burilishlar: {selectedSession.turnCount}</span>
                    <span>Holati: {selectedSession.status}</span>
                  </div>
                </div>

                {/* Xabarlar ro'yxati */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {selectedSession.messages && selectedSession.messages.length > 0 ? (
                    selectedSession.messages.map((msg) => {
                      const isUser = msg.role === "user";
                      return (
                        <div
                          key={msg.id}
                          className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}
                        >
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
                            {isUser ? (
                              <>
                                <span>Foydalanuvchi</span>
                                <User className="size-3" />
                              </>
                            ) : (
                              <>
                                <Bot className="size-3 text-primary" />
                                <span>AI Javobi ({selectedSession.provider})</span>
                              </>
                            )}
                            {msg.durationMs && <span>· {msg.durationMs}ms</span>}
                          </div>

                          <div
                            className={cn(
                              "rounded-2xl p-4 max-w-[85%] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs",
                              isUser
                                ? "bg-primary text-primary-foreground rounded-br-xs"
                                : "bg-muted/40 border text-foreground rounded-bl-xs"
                            )}
                          >
                            {msg.content}

                            {/* Biriktirilgan yoki yaratilgan rasmlar */}
                            {msg.images && msg.images.length > 0 && (
                              <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                                {msg.images.map((img, idx) => (
                                  <div
                                    key={idx}
                                    className="relative rounded-xl overflow-hidden border bg-background group"
                                  >
                                    {img.url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={img.url}
                                        alt={img.name || `Rasm ${idx + 1}`}
                                        className="w-full h-32 object-cover group-hover:scale-105 transition-all"
                                      />
                                    ) : (
                                      <div className="w-full h-32 flex flex-col items-center justify-center text-muted-foreground">
                                        <ImageIcon className="size-6 mb-1" />
                                        <span className="text-[10px]">{img.name || "Rasm"}</span>
                                      </div>
                                    )}
                                    <div className="p-1.5 text-[10px] bg-background/90 text-foreground truncate">
                                      {img.role === "generated" ? "✨ Yaratilgan rasm" : "📸 Namunaviy rasm"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground text-xs py-8">
                      Bu sessiyada hali xabarlar yo‘q.
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
