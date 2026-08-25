"use client";

import * as React from "react";
import { Plug, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { NetworkIcon } from "@/components/brand/network-icons";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkPanel } from "@/features/integrations/components/network-panel";
import { TelegramDialog } from "@/features/social/components/telegram-dialog";
import { InstagramConnectCard } from "@/features/instagram/components/connect-card";
import { MarketTokenCard } from "@/features/settings/market-token-card";
import { ShopsCard } from "@/features/settings/shops-card";
import { UzumSyncCard } from "@/features/settings/uzum-sync-card";
import { ApiError, fetchInstagramConnectUrl, fetchSocialAccounts, fetchSocialPlatforms } from "@/lib/api";
import { PLATFORM_LABEL, PLATFORM_ORDER } from "@/lib/platforms";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import type { SocialAccount, SocialPlatformRow } from "@/lib/types";

/**
 * Ulanish joylari bir sahifada, har biri o'z tabida.
 *
 * Ulanish alohida ish: unda xato bo'lsa butun tarmoq bo'limi ishlamaydi.
 * Tablar esa shuning uchun — bir tarmoqning ulanishini sozlayotgan odamga
 * qolgan uchtasi xalaqit bermasligi kerak.
 */
export default function IntegrationsPage() {
  const [platforms, setPlatforms] = React.useState<SocialPlatformRow[]>([]);
  const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
  const [telegramOpen, setTelegramOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const [rows, list] = await Promise.all([fetchSocialPlatforms(), fetchSocialAccounts()]);
      setPlatforms(rows);
      setAccounts(list);
    } catch {
      /* ulanmagan bo'lsa ham sahifa ochilishi kerak */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load);

  const onConnect = async (platform: string, hasAccounts: boolean) => {
    if (platform === "instagram") {
      try {
        // `add` — mavjud akkauntning ustiga yozmaslik uchun. Aks holda
        // ikkinchi do'konni ulamoqchi bo'lgan odam birinchisini bilmasdan
        // almashtirib yuborardi.
        const { url } = await fetchInstagramConnectUrl(hasAccounts);
        window.location.href = url;
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Ulanib bo'lmadi.");
      }
      return;
    }
    setTelegramOpen(true);
  };

  const ordered = React.useMemo(
    () =>
      [...platforms].sort(
        (a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform),
      ),
    [platforms],
  );

  const connectedCount = new Set(accounts.map((a) => a.platform)).size;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integratsiyalar"
        description="Uzum va ijtimoiy tarmoqlarga ulanish — hammasi shu yerda"
        actions={
          <span className="text-sm text-muted-foreground">
            {connectedCount}/{platforms.length} tarmoq ulangan
          </span>
        }
      />

      <Tabs defaultValue="uzum">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="uzum" className="gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" /> Uzum
          </TabsTrigger>
          {ordered.map((row) => {
            const mine = accounts.filter((a) => a.platform === row.platform);
            return (
              <TabsTrigger key={row.platform} value={row.platform} className="gap-1.5">
                <NetworkIcon platform={row.platform} colored className="h-3.5 w-3.5" />
                {PLATFORM_LABEL[row.platform]}
                {mine.length > 0 && (
                  <span className="rounded bg-background/70 px-1 text-[10px]">{mine.length}</span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── Uzum ─────────────────────────────────────────────────────── */}
        <TabsContent value="uzum" className="mt-4 space-y-4">
          <ShopsCard />
          <div className="grid gap-4 lg:grid-cols-2">
            <UzumSyncCard />
            <MarketTokenCard />
          </div>
        </TabsContent>

        {/* ── Ijtimoiy tarmoqlar ───────────────────────────────────────── */}
        {ordered.map((row) => {
          const mine = accounts.filter((a) => a.platform === row.platform);
          return (
            <TabsContent key={row.platform} value={row.platform} className="mt-4">
              <NetworkPanel
                row={row}
                accounts={mine}
                onConnect={() => onConnect(row.platform, mine.length > 0)}
                onChanged={load}
              >
                {/* Instagram ulanishi ko'p bosqichli: Facebook -> Page ->
                    reklama kabineti. Tanlash qadami shu yerda ochiladi. */}
                {row.platform === "instagram" && <InstagramConnectCard />}
              </NetworkPanel>
            </TabsContent>
          );
        })}
      </Tabs>

      <p className="text-xs text-muted-foreground">
        <Plug className="mr-1 inline h-3 w-3" />
        Bir tarmoqqa bir nechta akkaunt ulash mumkin — masalan ikkita do&apos;kon
        yoki uchta kanal. <Badge variant="secondary">Asosiy</Badge> deb belgilangani
        &quot;hamma tarmoqqa joylash&quot; deganda ishlatiladi.
      </p>

      <TelegramDialog open={telegramOpen} onOpenChange={setTelegramOpen} onConnected={load} />
    </div>
  );
}
