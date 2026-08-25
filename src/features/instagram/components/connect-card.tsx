"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Camera, Check, ExternalLink, Loader2, Unlink } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ApiError, disconnectInstagram, fetchInstagramAccount, fetchInstagramChoices,
  fetchInstagramConnectUrl, selectInstagramAccount,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InstagramAccount, InstagramChoices } from "@/lib/types";

/**
 * Sozlamalardagi Instagram bo'limi.
 *
 * Ulanish Facebook orqali ketadi: Instagram Business akkaunti doim bitta
 * Facebook Page'ga biriktirilgan va reklama ham, to'liq statistika ham faqat
 * shu yo'l bilan ochiladi.
 */
export function InstagramConnectCard() {
  const params = useSearchParams();
  const [account, setAccount] = React.useState<InstagramAccount | null>(null);
  const [choices, setChoices] = React.useState<InstagramChoices | null>(null);
  const [pageId, setPageId] = React.useState("");
  const [adAccountId, setAdAccountId] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const acc = await fetchInstagramAccount();
      setAccount(acc);
      // OAuth'dan qaytildi, lekin akkaunt hali tanlanmagan.
      if (acc.needsSelection) {
        setChoices(await fetchInstagramChoices().catch(() => null));
      }
    } catch {
      /* ulanmagan bo'lsa ham sahifa ishlashi kerak */
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Facebook'dan qaytgandagi natija.
  React.useEffect(() => {
    const error = params.get("ig_error");
    const connected = params.get("ig_connected");
    if (error) toast.error(error);
    if (connected) {
      toast.success("Facebook ulandi — endi akkauntni tanlang");
      void (async () => setChoices(await fetchInstagramChoices().catch(() => null)))();
    }
  }, [params]);

  const onConnect = async () => {
    setBusy(true);
    try {
      const { url } = await fetchInstagramConnectUrl();
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ulanib bo'lmadi.");
      setBusy(false);
    }
  };

  const onSelect = async () => {
    const page = choices?.pages.find((p) => p.pageId === pageId);
    if (!page?.instagramId) {
      toast.error("Bu Page'ga Instagram Business akkaunt ulanmagan.");
      return;
    }
    setBusy(true);
    try {
      setAccount(
        await selectInstagramAccount({
          pageId: page.pageId,
          instagramId: page.instagramId,
          adAccountId: adAccountId || null,
        })
      );
      setChoices(null);
      toast.success("Instagram ulandi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectInstagram();
      setAccount(null);
      setChoices(null);
      await load();
      toast.success("Uzildi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Uzilmadi.");
    } finally {
      setBusy(false);
    }
  };

  const connected = account?.connected && account.username;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Camera className="h-4 w-4" /> Instagram
        </CardTitle>
        <CardDescription>
          Postlarni tovarga bog'lash, statistika va reklama. Ulanish Facebook orqali
          ketadi — Instagram Business akkaunti Page'ga biriktirilgan bo'lishi kerak.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected ? (
          <>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              {account!.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={account!.profilePicture}
                  alt=""
                  className="h-11 w-11 rounded-full border object-cover"
                />
              ) : (
                <div className="h-11 w-11 rounded-full border bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{`@${account!.username}`}</span>
                  <Badge variant="success" className="gap-1">
                    <Check className="h-3 w-3" /> Ulangan
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {`${formatNumber(account!.followers)} obunachi · ${account!.postCount} post`}
                  {account!.pageName ? ` · ${account!.pageName}` : ""}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                disabled={busy}
                className="shrink-0 gap-1.5 text-destructive hover:text-destructive"
              >
                <Unlink className="h-3.5 w-3.5" /> Uzish
              </Button>
            </div>

            {account!.adAccountId ? (
              <div className="rounded-lg border p-3 text-sm">
                <div className="text-xs text-muted-foreground">Reklama kabineti</div>
                <div className="font-medium">
                  {`${account!.adAccountName ?? account!.adAccountId}${account!.adAccountCurrency ? ` · ${account!.adAccountCurrency}` : ""}`}
                </div>
              </div>
            ) : null}

            {account!.missing.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <div>
                  <div className="font-medium">Yetishmayotgan ruxsatlar</div>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {account!.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" onClick={onConnect} disabled={busy} className="mt-2">
                    Qayta ulash
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : choices ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Qaysi Instagram akkaunt?</Label>
              {choices.pages.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Facebook Page topilmadi. Instagram akkauntingiz Business bo&apos;lishi
                  va Facebook Page&apos;ga ulangan bo&apos;lishi kerak.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {choices.pages.map((page) => (
                    <button
                      key={page.pageId}
                      type="button"
                      onClick={() => setPageId(page.pageId)}
                      disabled={!page.instagramId}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors disabled:opacity-50",
                        pageId === page.pageId ? "border-primary bg-primary/5" : "hover:bg-accent"
                      )}
                    >
                      {page.picture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={page.picture} alt="" className="h-9 w-9 rounded-full border object-cover" />
                      ) : (
                        <div className="h-9 w-9 rounded-full border bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {page.instagramUsername ? `@${page.instagramUsername}` : page.pageName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {page.instagramId ? page.pageName : "Instagram ulanmagan"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {choices.adAccounts.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="ig-ad-account">Reklama kabineti (ixtiyoriy)</Label>
                <select
                  id="ig-ad-account"
                  value={adAccountId}
                  onChange={(e) => setAdAccountId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">Tanlanmagan — reklamasiz</option>
                  {choices.adAccounts.map((item) => (
                    <option key={item.id} value={item.id} disabled={!item.isActive}>
                      {`${item.name ?? item.id}${item.currency ? ` (${item.currency})` : ""}${item.isActive ? "" : " — faol emas"}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Reklama yoqish uchun kerak. Keyin ham tanlash mumkin.
                </p>
              </div>
            )}

            <Button onClick={onSelect} disabled={busy || !pageId} className="gap-1.5">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Saqlash
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ulangandan keyin postlaringiz tortiladi, ularni tovarlarga bog&apos;laysiz va
              qaysi post qancha sotuv keltirgani ko&apos;rinadi.
            </p>
            <Button onClick={onConnect} disabled={busy} className="gap-1.5">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Facebook orqali ulash
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
