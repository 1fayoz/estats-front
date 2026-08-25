"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { ArrowRight, Camera, Info, Link2, Send, Users } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNetworksOverview } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { useCountUp } from "@/lib/use-count-up";
import { cn } from "@/lib/utils";
import type { NetworksOverview } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Camera,
  telegram: Send,
  tiktok: Link2,
  linkedin: Link2,
};

export default function NetworksPage() {
  const [data, setData] = React.useState<NetworksOverview | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      setData(await fetchNetworksOverview());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const networks = data?.networks ?? [];
  const connected = networks.filter((n) => n.accounts > 0);
  const biggest = Math.max(1, ...networks.map((n) => n.followers));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarmoqlar"
        description="Qaysi tarmoqda qancha odam bor va qayerdan qancha e'tibor kelyapti."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-info/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> Jami auditoriya
            </div>
            <BigNumber value={data?.totalFollowers ?? 0} />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Mini label="Ulangan tarmoq" value={`${connected.length} ta`} />
              <Mini label="E'lonlar" value={formatNumber(data?.totalPosts ?? 0)} />
              <Mini label="E'lonlar qamrovi" value={formatNumber(data?.totalAudience ?? 0)} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Qamrov — e&apos;lonlaringiz jami nechta odamga yetgani. Obunachidan
              farq qiladi: bitta e&apos;lon obuna bo&apos;lmaganlarga ham
              ko&apos;rinishi mumkin.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tarmoq kesimida</CardTitle>
          <CardDescription>
            Ulanmagan tarmoq ham ro&apos;yxatda — qayerda hali ishlamayotganingiz
            ko&apos;rinib tursin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {networks.map((n, index) => {
            const Icon = ICONS[n.platform] ?? Link2;
            const share = Math.round((n.followers / biggest) * 100);
            return (
              <motion.div
                key={n.platform}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  "rounded-lg border p-3",
                  n.accounts === 0 && "border-dashed opacity-70"
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-md bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{n.label}</span>
                      {n.accounts > 0 ? (
                        <Badge variant="secondary">{`${n.accounts} ta akkaunt`}</Badge>
                      ) : (
                        <Badge variant="outline">ulanmagan</Badge>
                      )}
                      {!n.insightsAvailable && n.accounts > 0 && (
                        <Badge variant="warning" className="gap-1">
                          <Info className="h-3 w-3" /> statistika bermaydi
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${share}%` }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.7 }}
                      />
                    </div>
                  </div>

                  <div className="grid shrink-0 grid-cols-3 gap-4 text-right">
                    <Stat label="Obunachi" value={formatNumber(n.followers)} />
                    <Stat label="E'lon" value={formatNumber(n.posts)} />
                    <Stat
                      label="Qamrov"
                      value={n.insightsAvailable ? formatNumber(n.audience) : "—"}
                    />
                  </div>
                </div>

                {n.engagementRate != null && n.engagementRate > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {`Faollik: ${n.engagementRate.toFixed(1)}% — qamrovning shuncha qismi reaksiya bildirgan.`}
                  </p>
                )}
              </motion.div>
            );
          })}

          <Link
            href={"/settings" as Route}
            className="inline-flex items-center gap-1 pt-1 text-sm text-primary hover:underline"
          >
            Tarmoq ulash <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function BigNumber({ value }: { value: number }) {
  const animated = useCountUp(value);
  return (
    <div className="mt-1 text-4xl font-bold tabular-nums tracking-tight md:text-5xl">
      {formatNumber(animated)}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/60 p-3 backdrop-blur">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
