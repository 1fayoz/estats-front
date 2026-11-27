"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2, ExternalLink, Loader2, Puzzle, RefreshCw, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError, clearUzumCredentials, fetchCabinetExtensionSummary, fetchUzumCredentials } from "@/lib/api";
import {
  type CabinetExtensionSummary,
  EXTENSION_HREF,
  SELLER_CABINET_URL,
  extensionIssue,
} from "@/lib/cabinet-extension";
import { formatDateTime } from "@/lib/format";
import { useUserStore } from "@/stores/user-store";

/**
 * Integratsiyalar → Uzum: «Sotuvchi kabineti».
 *
 * 2026-11-24 dan seller.uzum.uz ga SERVER kirmaydi (serverdagi brauzer
 * o'chirildi: Uzum/Cloudflare server IP'sini «Verify you are human» ga
 * tushirgan, belgini qayta-qayta bosish ham yordam bermasdi). Sotuvchi
 * kabinetga o'z brauzerida kiradi; voronka, Bust narxlari, reklama,
 * moderatsiya sababi va kartochka nusxasini eStats Lens kengaytmasi SHU
 * sessiya bilan bajaradi. Shuning uchun bu yerda parol, «Kabinetga kirish»,
 * SMS va «Oyna orqali kirish» YO'Q — faqat kengaytma holati.
 *
 * Avvalgi avtomatik kirish uchun saqlangan Uzum paroli endi kerak emas —
 * bo'lsa, uni o'chirish taklif qilinadi (backend yangisini qabul qilmaydi).
 */
export function UzumSellerLoginCard() {
  const shop = useUserStore((s) => s.user?.shops.find((sh) => sh.id === s.activeShopId));
  const [summary, setSummary] = React.useState<CabinetExtensionSummary | null>(null);
  const [savedLogin, setSavedLogin] = React.useState<{ saved: boolean; login: string | null }>({ saved: false, login: null });
  const [loadError, setLoadError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [ext, creds] = await Promise.allSettled([fetchCabinetExtensionSummary(), fetchUzumCredentials()]);
    if (ext.status === "fulfilled") setSummary(ext.value);
    if (creds.status === "fulfilled") setSavedLogin({ saved: Boolean(creds.value.saved), login: creds.value.login ?? null });
    setLoadError(ext.status === "rejected" && !(ext.reason instanceof ApiError && ext.reason.status === 403));
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load, shop?.id]);

  if (!shop) return null;

  const issue = extensionIssue(summary);
  const ready = Boolean(summary && !issue);
  const badge = !summary
    ? { variant: "secondary" as const, text: loading ? "Tekshirilmoqda" : "Holat noma'lum" }
    : ready
      ? { variant: "success" as const, text: "Kengaytma orqali ulangan" }
      : issue === "logged_out"
        ? { variant: "warning" as const, text: "Kabinetga kirilmagan" }
        : issue === "offline"
          ? { variant: "secondary" as const, text: "Kengaytma oflayn" }
          : issue === "outdated"
            ? { variant: "warning" as const, text: "Kengaytmani yangilang" }
            : { variant: "secondary" as const, text: "Ulanmagan" };

  const onClear = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      const next = await clearUzumCredentials();
      setSavedLogin({ saved: Boolean(next.saved), login: next.login ?? null });
      setConfirmClear(false);
      toast.success("Saqlangan Uzum paroli o'chirildi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Parolni o'chirib bo'lmadi.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base font-semibold tracking-tight">Sotuvchi kabineti</h3>
            <CardDescription className="leading-relaxed">
              seller.uzum.uz ga o&apos;z brauzeringizda kirasiz — voronka, Bust narxlari, reklama, moderatsiya sababi va
              kartochka nusxasini eStats Lens kengaytmasi shu sessiya bilan bajaradi. Server brauzer ochmaydi, parol kerak emas.
            </CardDescription>
          </div>
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loadError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-3">
            <p className="text-sm">Kengaytma holatini yuklab bo&apos;lmadi.</p>
            <Button variant="outline" className="min-h-11 rounded-xl" disabled={loading} onClick={() => void load()}>
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Qayta urinish
            </Button>
          </div>
        )}

        {summary && (
          <div
            className={
              "flex items-start gap-3 rounded-xl border p-4 text-sm " +
              (ready ? "border-[var(--ok)]/25 bg-[var(--ok)]/5" : "border-[var(--warn)]/30 bg-[var(--warn)]/5")
            }
          >
            {ready
              ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--ok)]" aria-hidden />
              : <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--warn)]" aria-hidden />}
            <div className="min-w-0 space-y-1 leading-relaxed">
              <p className="font-medium">
                {ready
                  ? `${shop.name}: kabinet vazifalari shu brauzerda bajarilyapti`
                  : issue === "unpaired"
                    ? "eStats Lens hali bu do'kon uchun ulanmagan"
                    : issue === "offline"
                      ? "eStats Lens oflayn — brauzer yopiq yoki kabinet vazifalari o'chiq"
                      : issue === "logged_out"
                        ? "Brauzerda seller.uzum.uz ga kirilmagan"
                        : `Kengaytma eski${summary.minVersion ? ` — kamida ${summary.minVersion} kerak` : ""}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.version ? `eStats Lens v${summary.version}` : "eStats Lens"}
                {summary.lastSeenAt ? ` · oxirgi aloqa ${formatDateTime(summary.lastSeenAt)}` : ""}
                {issue === "unpaired" &&
                  " · Kengaytma belgisi → «Sotuvchi kabineti vazifalari» → «Shu brauzerda bajarish», so'ng seller.uzum.uz ga do'kon egasining hisobi bilan kiring."}
                {issue === "offline" && " · Chrome'ni oching — vazifalar o'zi davom etadi."}
                {issue === "outdated" && " · Chrome uni do'kondan o'zi yangilaydi; kutmaslik uchun chrome://extensions → «Yangilash»."}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:flex-wrap">
          <Button asChild className="min-h-11 rounded-xl">
            <Link href={EXTENSION_HREF as Route}>
              <Puzzle className="size-4" /> Kengaytma sozlamalari
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <a href={SELLER_CABINET_URL} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> seller.uzum.uz ni ochish
            </a>
          </Button>
          <Button variant="ghost" className="min-h-11 rounded-xl sm:ml-auto" disabled={loading} onClick={() => void load()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Yangilash
          </Button>
        </div>

        {savedLogin.saved && (
          <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex min-w-0 items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              <span>
                eStats&apos;da avvalgi avtomatik kirish uchun saqlangan Uzum paroli bor
                {savedLogin.login ? <> (<span className="[overflow-wrap:anywhere]">{savedLogin.login}</span>)</> : null} — endi u
                ishlatilmaydi. O&apos;chirib qo&apos;yishingiz mumkin.
              </span>
            </p>
            <Button variant="outline" className="min-h-11 shrink-0 rounded-xl" disabled={clearing} onClick={() => setConfirmClear(true)}>
              <Trash2 className="size-4" /> Saqlangan Uzum parolini o&apos;chirish
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={confirmClear} onOpenChange={(open) => { if (!clearing) setConfirmClear(open); }}>
        <DialogContent className="w-[calc(100%_-_2rem)] rounded-2xl [&>button]:min-h-11 [&>button]:min-w-11 [&>button]:right-2 [&>button]:top-2">
          <DialogHeader>
            <DialogTitle className="pr-10 leading-snug">Saqlangan Uzum parolini o&apos;chirish</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Login va parol eStats&apos;dan o&apos;chiriladi. Kabinet vazifalari baribir ishlaydi — ular sizning brauzeringizdagi
              seller.uzum.uz sessiyasidan foydalanadi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="min-h-11 rounded-xl" disabled={clearing} onClick={() => setConfirmClear(false)}>Bekor qilish</Button>
            <Button variant="destructive" className="min-h-11 rounded-xl" disabled={clearing} onClick={() => void onClear()}>
              {clearing && <Loader2 className="size-4 animate-spin" />}O&apos;chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
