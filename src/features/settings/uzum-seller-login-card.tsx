"use client";

import * as React from "react";
import { CheckCircle2, Loader2, MonitorSmartphone, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, startUzumLogin } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";
import { UzumVncDialog } from "./uzum-vnc-dialog";

/**
 * Uzum sotuvchi kabinetiga ulanish — mahsulotni AVTOMATIK joylash
 * (`products-ai`) shu sessiyaga tayanadi.
 *
 * Do'kon ekranning O'ZI faol do'konga tegishli — boshqa do'konga
 * ulash uchun yuqoridagi do'kon almashtirgichdan foydalaning, xuddi
 * boshqa har bir do'konga bog'liq bo'lim kabi.
 */
export function UzumSellerLoginCard() {
  const shop = useUserStore((s) => s.user?.shops.find((sh) => sh.id === s.activeShopId));
  const [busy, setBusy] = React.useState(false);
  const [vncOpen, setVncOpen] = React.useState(false);
  const [connectedAt, setConnectedAt] = React.useState<string | null>(
    shop?.uzumSellerConnectedAt ?? null,
  );

  React.useEffect(() => {
    setConnectedAt(shop?.uzumSellerConnectedAt ?? null);
  }, [shop?.uzumSellerConnectedAt]);

  if (!shop) return null;

  const onConnect = async () => {
    setBusy(true);
    try {
      const result = await startUzumLogin(shop.id);
      if (result.status === "busy") {
        toast.error(
          "Hozir boshqa do'kon ulanmoqda — ekran bitta, bir necha daqiqadan keyin qayta urinib ko'ring.",
        );
        return;
      }
      setVncOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ulanib bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4" /> Sotuvchi kabinetiga ulanish
            </CardTitle>
            <CardDescription>
              AI tayyorlagan mahsulotni Uzum&apos;ga avtomatik joylash uchun — bir
              marta, telefon/parol yoki SMS bilan.
            </CardDescription>
          </div>
          <Badge variant={connectedAt ? "success" : "secondary"}>
            {connectedAt ? "ulangan" : "ulanmagan"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {connectedAt && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              {new Date(connectedAt).toLocaleString("uz-UZ")} da ulangan. Sessiya muddatsiz
              — Uzum o&apos;zi chiqarib yubormasa qayta kirish shart emas.
            </span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Bosganingizda brauzer oynasi shu sahifada ochiladi (VNC orqali) — parolingiz
          eStats serveriga hech qachon yuborilmaydi.
        </p>
        <Button size="sm" onClick={onConnect} disabled={busy}>
          {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {connectedAt ? "Qayta ulash" : "Ulash"}
        </Button>
      </CardContent>

      <UzumVncDialog
        open={vncOpen}
        onOpenChange={setVncOpen}
        shopId={shop.id}
        onConnected={() => setConnectedAt(new Date().toISOString())}
      />
    </Card>
  );
}
