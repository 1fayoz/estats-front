"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CircleCheck, Link2, RefreshCw, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { NetworkIcon } from "@/components/brand/network-icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppKeysCard } from "@/features/integrations/components/app-keys-card";
import { AiProviderCard } from "@/features/integrations/components/ai-provider-card";
import { NetworkPanel } from "@/features/integrations/components/network-panel";
import styles from "@/features/integrations/components/integrations.module.css";
import { TelegramDialog } from "@/features/social/components/telegram-dialog";
import { InstagramConnectCard } from "@/features/instagram/components/connect-card";
import { MarketTokenCard } from "@/features/settings/market-token-card";
import { MarketAccountLoginCard } from "@/features/settings/market-account-login-card";
import { ShopsCard } from "@/features/settings/shops-card";
import { TelegramAccountCard } from "@/features/settings/telegram-account-card";
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
import { useShops, useUserStore } from "@/stores/user-store";
import type { AiKeyState, OpenAiKeyState, SocialAccount, SocialApp, SocialPlatformRow } from "@/lib/types";

function IntegrationsSkeleton() {
  return <div className="space-y-4" role="status" aria-label="Integratsiyalar yuklanmoqda"><Skeleton className="h-9 w-56 rounded-xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-72 rounded-2xl" /></div>;
}

export default function IntegrationsPage() {
  const activeShopId = useUserStore((state) => state.activeShopId);
  const workspaceId = useUserStore((state) => state.workspaceId);
  return <React.Suspense fallback={<IntegrationsSkeleton />}><IntegrationsWorkspace key={`${workspaceId}:${activeShopId}`} /></React.Suspense>;
}

function IntegrationsWorkspace() {
  const shops = useShops();
  const hasShop = shops.length > 0;
  const [platforms, setPlatforms] = React.useState<SocialPlatformRow[]>([]);
  const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
  const [accountsKnown, setAccountsKnown] = React.useState(false);
  const [socialApps, setSocialApps] = React.useState<SocialApp[]>([]);
  const [aiKey, setAiKey] = React.useState<AiKeyState | null>(null);
  const [openAiKey, setOpenAiKey] = React.useState<OpenAiKeyState | null>(null);
  const [issues, setIssues] = React.useState<string[]>([]);
  const [restricted, setRestricted] = React.useState<string[]>([]);
  const [telegramOpen, setTelegramOpen] = React.useState(false);
  const [connecting, setConnecting] = React.useState(false);
  const connectingRef = React.useRef(false);
  const requestVersion = React.useRef(0);
  const servicesRef = React.useRef<HTMLElement>(null);
  const [tab, setTab] = useQueryState("tab", "uzum");
  const [loading, setLoading] = React.useState(hasShop);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!hasShop) { setLoading(false); return; }
    const version = ++requestVersion.current;
    setRefreshing(true);
    const results = await Promise.allSettled([
      fetchSocialPlatforms(), fetchSocialAccounts(), fetchSocialApps(), fetchAiKey(), fetchOpenAiKey(),
    ]);
    if (version !== requestVersion.current) return;
    const [networks, connections, apps, gemini, openai] = results;
    if (networks.status === "fulfilled") setPlatforms(networks.value);
    if (connections.status === "fulfilled") { setAccounts(connections.value); setAccountsKnown(true); }
    if (apps.status === "fulfilled") setSocialApps(apps.value);
    if (gemini.status === "fulfilled") setAiKey(gemini.value);
    if (openai.status === "fulfilled") setOpenAiKey(openai.value);
    const labels = ["Xizmatlar", "Akkauntlar", "Ilova sozlamalari", "Gemini", "OpenAI"];
    const denied: string[] = [];
    const failed: string[] = [];
    results.forEach((result, index) => {
      if (result.status !== "rejected") return;
      if (result.reason instanceof ApiError && result.reason.status === 403) denied.push(labels[index]);
      else failed.push(labels[index]);
    });
    if (denied.includes("Xizmatlar")) setPlatforms([]);
    if (denied.includes("Akkauntlar")) { setAccounts([]); setAccountsKnown(false); }
    if (denied.includes("Ilova sozlamalari")) setSocialApps([]);
    if (denied.includes("Gemini")) setAiKey(null);
    if (denied.includes("OpenAI")) setOpenAiKey(null);
    setIssues(failed);
    setRestricted(denied);
    setRefreshing(false);
    setLoading(false);
  }, [hasShop]);

  React.useEffect(() => {
    void load();
    return () => { requestVersion.current += 1; };
  }, [load]);
  useAutoRefresh(load);

  const params = useSearchParams();
  const handledReturn = React.useRef<string | null>(null);
  const failed = params.get("net_error");
  const connected = params.get("net_connected");
  React.useEffect(() => {
    if (!failed && !connected) { handledReturn.current = null; return; }
    const returnKey = `${failed}:${connected}`;
    if (handledReturn.current === returnKey) return;
    handledReturn.current = returnKey;
    if (failed) toast.error(failed);
    if (connected) { toast.success(`${PLATFORM_LABEL[connected] ?? connected} ulandi`); void load(); }
  }, [failed, connected, load]);

  const onConnect = async (platform: string, hasAccounts: boolean) => {
    if (connectingRef.current) return;
    if (platform === "telegram") { setTelegramOpen(true); return; }
    connectingRef.current = true;
    setConnecting(true);
    try {
      const { url } = platform === "instagram" ? await fetchInstagramConnectUrl(hasAccounts) : await fetchSocialConnectUrl(platform);
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Ulanib bo'lmadi. Qayta urinib ko'ring.");
    } finally { connectingRef.current = false; setConnecting(false); }
  };

  const selected = !hasShop || !["uzum", "ai", ...PLATFORM_ORDER].includes(tab) ? "uzum" : tab;
  const selectedPlatform = platforms.find((row) => row.platform === selected);
  React.useEffect(() => {
    const navigation = servicesRef.current;
    if (!navigation) return;
    const revealSelected = () => {
      if (navigation.scrollWidth <= navigation.clientWidth) return;
      const button = navigation.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!button) return;
      const position = button.getBoundingClientRect();
      navigation.scrollTo({ left: navigation.scrollLeft + position.left - navigation.getBoundingClientRect().left - (navigation.clientWidth - position.width) / 2, behavior: "instant" });
    };
    revealSelected();
    const observer = new ResizeObserver(revealSelected);
    observer.observe(navigation);
    return () => observer.disconnect();
  }, [selected]);
  const attentionCount = accounts.filter((account) => account.tokenExpired || account.tokenExpiresSoon || account.error || account.warning).length;
  const aiStates = [aiKey, openAiKey].filter((state) => state !== null);
  const aiConfigured = aiStates.filter((state) => state.configured).length;
  const services = [
    { value: "uzum", label: "Uzum Market", icon: <ShoppingBag />, detail: hasShop ? `${shops.length} ta do‘kon` : "Birinchi do‘konni ulang", connected: hasShop },
    { value: "ai", label: "AI yordamchilar", icon: <Sparkles />, detail: aiStates.length ? `${aiConfigured}/${aiStates.length} kalit kiritilgan` : "Matn va tovar rasmlari", connected: aiConfigured > 0 },
    ...PLATFORM_ORDER.map((platform) => {
      const mine = accounts.filter((account) => account.platform === platform);
      const row = platforms.find((item) => item.platform === platform);
      return {
        value: platform, label: PLATFORM_LABEL[platform], icon: <NetworkIcon platform={platform} colored />,
        detail: mine.length ? `${mine.length} ta akkaunt` : row?.unavailable ? "Hozircha mavjud emas" : accountsKnown ? "Akkaunt ulanmagan" : "Holati noma’lum",
        connected: mine.length > 0,
      };
    }),
  ];

  return (
    <div className={cn(styles.workspace, "space-y-5 sm:space-y-6")}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-primary"><Link2 className="size-3.5" /> Ulanish markazi</div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Integratsiyalar</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Do‘konlar, ijtimoiy tarmoqlar va AI — barchasini bir joydan boshqaring.</p>
        </div>
        {hasShop && selected !== "uzum" && <Button variant="outline" className="min-h-11 rounded-xl" disabled={refreshing} onClick={() => void load()}><RefreshCw className={cn(refreshing && "motion-safe:animate-spin")} />{refreshing ? "Yangilanmoqda" : "Yangilash"}</Button>}
      </header>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Do‘konlar", value: shops.length, detail: "Uzum Market", icon: ShoppingBag },
          { label: "Akkauntlar", value: accountsKnown ? accounts.length : "—", detail: attentionCount ? `${attentionCount} ta e’tibor talab qiladi` : "Ijtimoiy tarmoqlar", icon: Link2 },
          { label: "AI kalitlari", value: aiStates.length ? `${aiConfigured}/${aiStates.length}` : "—", detail: "Matn va rasmlar", icon: Sparkles },
        ].map((item) => (
          <div key={item.label} className="min-w-0 rounded-2xl border bg-card/80 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground sm:text-sm"><span>{item.label}</span><item.icon className="hidden size-4 text-primary sm:block" /></div>
            <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{loading && item.label !== "Do‘konlar" ? <Skeleton className="h-9 w-12" /> : item.value}</div>
            <p className={cn("mt-1 hidden text-xs sm:block", item.label === "Akkauntlar" && attentionCount ? "text-[var(--warn)]" : "text-muted-foreground")}>{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[228px_minmax(0,1fr)] xl:gap-6">
        <aside className="min-w-0">
          <div className="xl:sticky xl:top-5">
            <p className="mb-3 hidden px-2 text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground xl:block">Xizmatlar</p>
            <nav ref={servicesRef} aria-label="Integratsiya xizmatlari" className={styles.services}>
              {services.map((service) => (
                <button key={service.value} type="button" aria-pressed={selected === service.value} aria-controls="integration-content" disabled={!hasShop && service.value !== "uzum"} onClick={() => setTab(service.value)} className={cn(styles.service, selected === service.value && styles.selected)}>
                  <span className={styles.serviceIcon}>{service.icon}</span>
                  <span className="min-w-0 text-left"><span className="block whitespace-nowrap text-sm font-medium">{service.label}</span><span className="mt-1 hidden text-xs text-muted-foreground xl:block">{service.detail}</span></span>
                  {service.connected && <CircleCheck aria-label="Ulangan" className="ml-auto hidden size-4 shrink-0 text-[var(--ok)] xl:block" />}
                </button>
              ))}
            </nav>
            <p className="mt-4 hidden items-start gap-2 px-2 text-xs leading-relaxed text-muted-foreground xl:flex"><ShieldCheck className="mt-0.5 size-4 shrink-0" />Ulanishlarni istalgan vaqtda boshqarishingiz yoki uzishingiz mumkin.</p>
          </div>
        </aside>

        <section id="integration-content" aria-label={services.find((service) => service.value === selected)?.label} className="min-w-0 space-y-4">
          {issues.length > 0 && <div role="alert" className="flex flex-wrap items-start gap-3 rounded-2xl border border-[var(--warn)]/25 bg-[var(--warn)]/5 p-4"><AlertCircle className="mt-0.5 size-5 shrink-0 text-[var(--warn)]" /><div className="min-w-0 flex-1 text-sm"><p className="font-medium">Ayrim holatlarni yangilab bo‘lmadi</p><p className="mt-1 text-muted-foreground">{issues.join(", ")}. Avval yuklangan ma’lumotlar bo‘lsa, saqlanib turibdi.</p></div><Button variant="outline" className="min-h-11 rounded-xl" disabled={refreshing} onClick={() => void load()}>Qayta urinish</Button></div>}

          {selected === "uzum" && <div className={cn(styles.panel, "space-y-4")}>

            <ShopsCard />
            {hasShop && <><UzumSyncCard /><div className="grid min-w-0 gap-4 2xl:grid-cols-2"><UzumSellerLoginCard /><MarketAccountLoginCard /></div><MarketTokenCard collapsible /></>}
          </div>}

          {selected !== "uzum" && loading ? <IntegrationsSkeleton /> : selected === "ai" ? <div className={cn(styles.panel, "space-y-4")}>
            <div className="rounded-2xl border bg-card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-3 text-primary"><Sparkles className="size-5" /></span><div><h2 className="text-lg font-semibold">AI yordamchilar</h2><p className="mt-1 text-sm text-muted-foreground">Tovar kartochkalarini tezroq tayyorlang.</p></div></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Gemini matn va xususiyatlar bilan, OpenAI esa tovar rasmlari bilan yordam beradi. Har bir xizmat alohida API kaliti orqali ulanadi.</p></div>
            <div className="grid min-w-0 gap-4 2xl:grid-cols-2">{aiKey && <AiProviderCard provider="gemini" state={aiKey} onSaved={load} />}{openAiKey && <AiProviderCard provider="openai" state={openAiKey} onSaved={load} />}</div>
            {!aiKey && !openAiKey && <div className="rounded-2xl border border-dashed p-6 text-center"><ShieldCheck className="mx-auto size-7 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">{restricted.some((label) => label === "Gemini" || label === "OpenAI") ? "AI kalitlarini boshqarish uchun hisob egasidan ruxsat so‘rang." : "AI xizmatlari holati yuklanmadi. Qayta urinib ko‘ring."}</p></div>}
          </div> : selectedPlatform && accountsKnown ? <div key={selected} className={styles.panel}>
            <NetworkPanel row={selectedPlatform} accounts={accounts.filter((account) => account.platform === selected)} connecting={connecting} onConnect={() => onConnect(selected, accounts.some((account) => account.platform === selected))} onChanged={load}>
              {selected === "instagram" && <InstagramConnectCard />}
              {socialApps.filter((app) => app.platform === selected).map((app) => <AppKeysCard key={app.platform} app={app} onSaved={load} />)}
              {selected === "telegram" && <TelegramAccountCard />}
            </NetworkPanel>
          </div> : selected !== "uzum" && <div className="rounded-2xl border bg-card p-6 text-center"><Link2 className="mx-auto size-8 text-primary" /><h2 className="mt-4 text-lg font-semibold">{PLATFORM_LABEL[selected]} ulanishi</h2><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{(restricted.includes("Xizmatlar") || restricted.includes("Akkauntlar")) ? "Bu xizmatni boshqarish uchun sizga ruxsat kerak." : "Xizmat holatini yuklab bo‘lmadi. Ulanishlarni yangilab ko‘ring."}</p><Button variant="outline" className="mt-4 min-h-11 rounded-xl" onClick={() => void load()} disabled={refreshing}>Yangilash</Button></div>}
        </section>
      </div>
      <TelegramDialog open={telegramOpen} onOpenChange={setTelegramOpen} onConnected={load} />
    </div>
  );
}
