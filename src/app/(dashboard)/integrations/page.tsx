"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plug, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { NetworkCard } from "@/features/integrations/components/network-card";
import { TelegramDialog } from "@/features/social/components/telegram-dialog";
import { InstagramConnectCard } from "@/features/instagram/components/connect-card";
import { MarketTokenCard } from "@/features/settings/market-token-card";
import { UzumSyncCard } from "@/features/settings/uzum-sync-card";
import { ApiError, fetchInstagramConnectUrl, fetchSocialAccounts, fetchSocialPlatforms } from "@/lib/api";
import { PLATFORM_ORDER } from "@/lib/platforms";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import type { SocialAccount, SocialPlatformRow } from "@/lib/types";

/**
 * Ulanish joylari bir sahifada.
 *
 * Ilgari ular Sozlamalar ichida, do'kon nomi va mavzu tanlash orasida
 * turardi. Ulanish — alohida ish: unda xato bo'lsa butun tarmoq bo'limi
 * ishlamaydi, shuning uchun uning o'z joyi bo'lishi kerak.
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

  const onConnect = async (platform: string) => {
    if (platform === "instagram") {
      try {
        const { url } = await fetchInstagramConnectUrl();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integratsiyalar"
        description="Uzum va ijtimoiy tarmoqlarga ulanish — hammasi shu yerda"
        actions={
          !loading && (
            <span className="text-sm text-muted-foreground">
              {connectedCount}/{platforms.length} tarmoq ulangan
            </span>
          )
        }
      />

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ShoppingBag className="h-4 w-4" /> Uzum
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <UzumSyncCard />
          <MarketTokenCard />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Plug className="h-4 w-4" /> Ijtimoiy tarmoqlar
        </h2>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ordered.map((row, i) => (
              <NetworkCard
                key={row.platform}
                row={row}
                index={i}
                accounts={accounts.filter((a) => a.platform === row.platform)}
                onConnect={() => onConnect(row.platform)}
                onChanged={load}
              />
            ))}
          </div>
        )}
      </section>

      {/* Instagram ulanishi ko'p bosqichli (Facebook -> Page -> reklama
          kabineti), shuning uchun uning to'liq oqimi alohida turadi. */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <InstagramConnectCard />
      </motion.section>

      <TelegramDialog open={telegramOpen} onOpenChange={setTelegramOpen} onConnected={load} />
    </div>
  );
}
