"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  KeyRound,
  LogOut,
  Palette,
  Plug,
  Plus,
  RefreshCw,
  Star,
  Store,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { useUserStore } from "@/stores/user-store";
import { ApiError, addShops, deleteShop, fetchMe, updateShop } from "@/lib/api";
import { MIN_TOKEN_LENGTH, isValidTokenFormat } from "@/lib/auth";
import type { Shop } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const signOut = useUserStore((s) => s.signOut);
  const activeShopId = useUserStore((s) => s.activeShopId);

  const [token, setToken] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const shops = user?.shops ?? [];

  const refresh = React.useCallback(async () => {
    try {
      setUser(await fetchMe());
    } catch {
      /* keyingi sahifa yuklanishida qayta urinadi */
    }
  }, [setUser]);

  const onAdd = async () => {
    const clean = token.trim();
    if (clean.length < MIN_TOKEN_LENGTH || !isValidTokenFormat(clean)) {
      toast.error(`Token yaroqsiz ko'rinishda (kamida ${MIN_TOKEN_LENGTH} belgi)`);
      return;
    }
    setBusy("add");
    try {
      const result = await addShops(clean);
      setToken("");
      await refresh();
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Magazin qo'shilmadi.");
    } finally {
      setBusy(null);
    }
  };

  const onMakeDefault = async (shop: Shop) => {
    setBusy(`default-${shop.id}`);
    try {
      await updateShop(shop.id, { isDefault: true });
      await refresh();
      toast.success(`"${shop.name}" asosiy magazin bo'ldi`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async (shop: Shop) => {
    setBusy(`delete-${shop.id}`);
    try {
      await deleteShop(shop.id);
      await refresh();
      toast.success(`"${shop.name}" o'chirildi`);
      // O'chirilgani faol magazin bo'lsa, butun ilova boshqasiga o'tishi kerak.
      if (activeShopId === shop.id) window.location.reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirilmadi.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sozlamalar"
        description="Magazinlaringiz va tashqi ko'rinish"
        actions={
          <Link href={"/integrations" as Route}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plug className="h-3.5 w-3.5" /> Integratsiyalar
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-4 w-4" /> Magazinlar ({shops.length})
            </CardTitle>
            <CardDescription>
              Har bir magazinning o&apos;z tokeni va o&apos;z hisob-kitobi bor. Bir
              magazin ma&apos;lumoti ikkinchisiga hech qachon aralashmaydi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shops.length === 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <div>
                  <div className="font-medium">Hali magazin qo&apos;shilmagan</div>
                  <div className="text-muted-foreground">
                    Uzum Seller kabinetingizdagi API tokenini quyiga kiriting — token
                    ochadigan barcha magazinlar avtomatik qo&apos;shiladi.
                  </div>
                </div>
              </div>
            )}

            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{shop.name}</span>
                    {shop.isDefault && (
                      <Badge variant="info" className="text-[10px]">asosiy</Badge>
                    )}
                    {activeShopId === shop.id && (
                      <Badge variant="success" className="text-[10px]">ochiq</Badge>
                    )}
                    {!shop.hasToken && (
                      <Badge variant="secondary" className="text-[10px]">token yo&apos;q</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span className="font-mono">#{shop.shopId}</span>
                    <span>
                      {shop.salesSyncedFrom
                        ? `sotuvlar: ${shop.salesSyncedFrom} … ${shop.salesSyncedTo}`
                        : "sotuvlar hali yuklanmagan"}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!shop.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMakeDefault(shop)}
                      disabled={busy === `default-${shop.id}`}
                    >
                      <Star className="h-3.5 w-3.5" /> Asosiy
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(shop)}
                    disabled={busy === `delete-${shop.id}`}
                    title="Magazin va uning butun hisob-kitobi o'chadi"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-1.5 border-t pt-4">
              <Label htmlFor="token" className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> Uzum Seller API tokeni
              </Label>
              <div className="flex gap-2">
                <Input
                  id="token"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="••••••••••••••••"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button size="sm" onClick={onAdd} disabled={busy === "add"}>
                  {busy === "add" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Qo&apos;shish
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Token Uzum&apos;da tekshiriladi va u ochadigan har bir magazin alohida
                qo&apos;shiladi. Mavjud magazin tokenini qayta yuborsangiz — yangilanadi.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> Tashqi ko&apos;rinish
            </CardTitle>
            <CardDescription>Yorug&apos; yoki qorong&apos;u rejim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
                    theme === t ? "border-primary bg-primary/5 text-primary" : "hover:bg-accent"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-md border ${
                      t === "light"
                        ? "bg-white"
                        : t === "dark"
                          ? "bg-zinc-900"
                          : "bg-gradient-to-br from-white to-zinc-900"
                    }`}
                  />
                  <span className="capitalize">
                    {t === "light" ? "Yorug'" : t === "dark" ? "Qorong'u" : "Avto"}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-4 w-4" /> Hisob
            </CardTitle>
            <CardDescription>Google akkaunt orqali kirgansiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="font-medium">{user?.fullName ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                signOut();
                router.push("/");
              }}
            >
              <LogOut className="h-3.5 w-3.5" /> Chiqish
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
