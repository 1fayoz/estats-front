"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { NetworkIcon } from "@/components/brand/network-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { AppKeysCard } from "@/features/integrations/components/app-keys-card";
import { AiKeyCard } from "@/features/seo/components/ai-key-card";
import { OpenAiKeyCard } from "@/features/products-ai/components/openai-key-card";
import { NetworkPanel } from "@/features/integrations/components/network-panel";
import { TelegramDialog } from "@/features/social/components/telegram-dialog";
import { InstagramConnectCard } from "@/features/instagram/components/connect-card";
import { MarketTokenCard } from "@/features/settings/market-token-card";
import { MarketAccountLoginCard } from "@/features/settings/market-account-login-card";
import { ShopsCard } from "@/features/settings/shops-card";
import { TelegramOperatorCard } from "@/features/settings/telegram-operator-card";
import { UzumSellerLoginCard } from "@/features/settings/uzum-seller-login-card";
import { UzumSyncCard } from "@/features/settings/uzum-sync-card";
import {
  ApiError, fetchAiKey, fetchInstagramConnectUrl, fetchOpenAiKey, fetchSocialAccounts, fetchSocialApps,
  fetchSocialConnectUrl, fetchSocialPlatforms,
} from "@/lib/api";
import { PLATFORM_LABEL, PLATFORM_ORDER } from "@/lib/platforms";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { useQueryState } from "@/lib/use-query-state";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import type { AiKeyState, OpenAiKeyState, SocialAccount, SocialApp, SocialPlatformRow } from "@/lib/types";

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
  const [socialApps, setSocialApps] = React.useState<SocialApp[]>([]);
  const [aiKey, setAiKey] = React.useState<AiKeyState | null>(null);
  const [openAiKey, setOpenAiKey] = React.useState<OpenAiKeyState | null>(null);
  const [telegramOpen, setTelegramOpen] = React.useState(false);
  const [tab, setTab] = useQueryState("tab", "uzum");
  const [loading, setLoading] = React.useState(true);
  // Magazinsiz do'kon so'rovlari ma'nosiz — hammasi `X-Shop-Id` ga
  // bog'langan. Yangi foydalanuvchi shu sahifaga tushadi, shuning uchun
  // u magazinsiz ham ochilishi va tokendan boshqa hech narsa
  // ko'rsatmasligi kerak.
  const hasShop = useUserStore((s) => (s.user?.shops.length ?? 0) > 0);

  const load = React.useCallback(async () => {
    if (!hasShop) {
      setLoading(false);
      return;
    }
    try {
      const [rows, list, appList, ai, gpt] = await Promise.all([
        fetchSocialPlatforms(),
        fetchSocialAccounts(),
        fetchSocialApps().catch(() => [] as SocialApp[]),
        fetchAiKey().catch(() => null),
        // Ruxsati yo'q a'zoda 403 keladi — kartochka shunchaki
        // ko'rinmaydi va sahifaning qolgani ishlayveradi.
        fetchOpenAiKey().catch(() => null),
      ]);
      setPlatforms(rows);
      setAccounts(list);
      setSocialApps(appList);
      setAiKey(ai);
      setOpenAiKey(gpt);
    } catch {
      /* ulanmagan bo'lsa ham sahifa ochilishi kerak */
    } finally {
      setLoading(false);
    }
  }, [hasShop]);

  React.useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load);

  // Tarmoqdan qaytgandagi natija. Xato manzilda keladi, chunki
  // foydalanuvchi tarmoqning saytidan qaytadi — bu yerda hech qanday
  // holat saqlanib qolmagan.
  const params = useSearchParams();
  React.useEffect(() => {
    const failed = params.get("net_error");
    const connected = params.get("net_connected");
    if (failed) toast.error(failed);
    if (connected) {
      toast.success(`${PLATFORM_LABEL[connected] ?? connected} ulandi`);
      void load();
    }
  }, [params, load]);

  const onConnect = async (platform: string, hasAccounts: boolean) => {
    if (platform === "telegram") {
      setTelegramOpen(true);
      return;
    }
    try {
      // Instagram'da `add` — mavjud akkauntning ustiga yozmaslik uchun.
      // Aks holda ikkinchi do'konni ulamoqchi bo'lgan odam birinchisini
      // bilmasdan almashtirib yuborardi.
      const { url } =
        platform === "instagram"
          ? await fetchInstagramConnectUrl(hasAccounts)
          : await fetchSocialConnectUrl(platform);
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ulanib bo'lmadi.");
    }
  };

  const ordered = React.useMemo(
    () =>
      [...platforms].sort(
        (a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform),
      ),
    [platforms],
  );

  const connectedCount = new Set(accounts.map((a) => a.platform)).size;

  const TAB_ITEMS = React.useMemo(() => {
    const items: { value: string; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
      { value: "uzum", label: "Uzum", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
      {
        value: "ai",
        label: "AI",
        icon: <Sparkles className="h-3.5 w-3.5" />,
        badge: aiKey?.configured ? "✓" : undefined,
      },
    ];
    for (const row of ordered) {
      const mine = accounts.filter((a) => a.platform === row.platform).length;
      items.push({
        value: row.platform,
        label: PLATFORM_LABEL[row.platform],
        icon: <NetworkIcon platform={row.platform} colored className="h-3.5 w-3.5" />,
        badge: mine > 0 ? mine : undefined,
      });
    }
    return items;
  }, [ordered, accounts, aiKey]);

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
          hasShop ? (
            <span className="text-sm text-muted-foreground">
              {connectedCount}/{platforms.length} tarmoq ulangan
            </span>
          ) : null
        }
      />

      {/*
        Radix `Tabs` shu yerda ATAYLAB ishlatilmaydi: `?tab=` manzildan
        kelgan qiymat bilan boshlanganda (masalan to'g'ridan-to'g'ri
        `/integrations?tab=instagram` havolasidan kirilganda) keyingi
        bosishlar tasodifiy ishlamay qolardi — `onValueChange` HECH
        chaqirilmasdan (tekshirilgan: konsolga chiqarilgan log
        umuman ko'rinmadi). Oddiy tugma + shart bo'yicha ko'rsatish
        — jadval sahifasidagi bilan bir xil, ishonchli naqsh.
      */}
      <div className="flex flex-wrap gap-1 rounded-xl border bg-muted/30 p-1">
        {TAB_ITEMS.map(({ value, label, icon, badge }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {icon}
            {label}
            {badge != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  tab === value ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Uzum ─────────────────────────────────────────────────────── */}
      {tab === "uzum" && (
        <div className="space-y-4">
          <ShopsCard />
          {hasShop && (
            <div className="grid gap-4 lg:grid-cols-2">
              <UzumSyncCard />
              <UzumSellerLoginCard />
              <MarketAccountLoginCard />
              <MarketTokenCard />
            </div>
          )}
        </div>
      )}

      {tab === "ai" && (
        <div className="space-y-4">
          {aiKey && <AiKeyCard state={aiKey} onSaved={load} />}
          {openAiKey && <OpenAiKeyCard state={openAiKey} onSaved={load} />}
        </div>
      )}

      {/* ── Ijtimoiy tarmoqlar ───────────────────────────────────────── */}
      {ordered.map((row) => {
        if (tab !== row.platform) return null;
        const mine = accounts.filter((a) => a.platform === row.platform);
        const app = socialApps.find((a) => a.platform === row.platform);
        return (
          <NetworkPanel
            key={row.platform}
            row={row}
            accounts={mine}
            onConnect={() => onConnect(row.platform, mine.length > 0)}
            onChanged={load}
          >
            {/* Instagram ulanishi ko'p bosqichli: Facebook -> Page ->
                reklama kabineti. Tanlash qadami shu yerda ochiladi. */}
            {row.platform === "instagram" && <InstagramConnectCard />}
            {/* LinkedIn va TikTok sotuvchining O'Z ilovasi bilan
                ishlaydi — kalitlar shu yerda kiritiladi. */}
            {app && <AppKeysCard app={app} onSaved={load} />}
            {/* Uzum moderatsiya operatoriga yozish uchun — kanal
                ulanishidan BUTUNLAY BOSHQA hisob (Fayozning O'Z shaxsiy
                Telegram akkaunti), lekin joyi shu yerda tabiiy: ikkalasi
                ham "Telegram" haqida. */}
            {row.platform === "telegram" && <TelegramOperatorCard />}
          </NetworkPanel>
        );
      })}

      <TelegramDialog open={telegramOpen} onOpenChange={setTelegramOpen} onConnected={load} />
    </div>
  );
}
