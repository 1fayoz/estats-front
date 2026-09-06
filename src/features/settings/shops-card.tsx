"use client";

import * as React from "react";
import {
  ChevronDown, KeyRound, Plus, RefreshCw, ShieldCheck, Star, Store, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, addShops, deleteShop, fetchMe, updateShop } from "@/lib/api";
import { MIN_TOKEN_LENGTH, isValidTokenFormat } from "@/lib/auth";
import { useUserStore } from "@/stores/user-store";
import type { Shop } from "@/lib/types";

/**
 * Magazinlar va Uzum Seller tokeni.
 *
 * Ikkalasi bitta kartada, chunki ular bitta narsa: token magazinni
 * OCHADI. Token kiritilgach u ochadigan har bir magazin alohida qator
 * bo'lib paydo bo'ladi — ya'ni "token qo'shish" va "magazin qo'shish"
 * bir xil harakat.
 */
export function ShopsCard() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const activeShopId = useUserStore((s) => s.activeShopId);

  const [token, setToken] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const shops = user?.shops ?? [];
  const [adding, setAdding] = React.useState(shops.length === 0);
  const [deleteTarget, setDeleteTarget] = React.useState<Shop | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setUser(await fetchMe());
    } catch {
      /* keyingi sahifa yuklanishida qayta urinadi */
    }
  }, [setUser]);

  const onAdd = async () => {
    if (busy) return;
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
      setAdding(false);
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Magazin qo'shilmadi.");
    } finally {
      setBusy(null);
    }
  };

  const onMakeDefault = async (shop: Shop) => {
    if (busy) return;
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
    if (busy) return;
    setBusy(`delete-${shop.id}`);
    try {
      await deleteShop(shop.id);
      await refresh();
      setDeleteTarget(null);
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
    <Card className="rounded-2xl shadow-none">
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">Do&apos;konlar</h3>
              <Badge variant="secondary">{shops.length} ta</Badge>
            </div>
            <CardDescription className="max-w-lg leading-relaxed">
              Uzum do&apos;konlaringiz va ularning hisob-kitobi bir joyda.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            className="min-h-11 rounded-xl"
            onClick={() => setAdding(!adding)}
            aria-expanded={adding || shops.length === 0}
            aria-controls="shop-token-form"
            disabled={Boolean(busy)}
          >
            {adding ? <ChevronDown className="size-4" /> : <Plus className="size-4" />}
            Do&apos;kon qo&apos;shish
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {shops.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-muted/20 px-4 py-7 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Store className="size-6" /></span>
            <div className="max-w-sm space-y-1.5">
              <p className="text-sm font-semibold">Birinchi do&apos;koningizni ulang</p>
              <p className="text-sm leading-relaxed text-muted-foreground">Uzum Seller API tokenini kiriting. Unga tegishli do&apos;konlar avtomatik qo&apos;shiladi.</p>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {shops.map((shop) => (
            <div key={shop.id} className="flex flex-col gap-4 rounded-2xl border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-muted-foreground"><Store className="size-5" /></span>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-words text-sm font-semibold [overflow-wrap:anywhere]">{shop.name}</span>
                    {shop.isDefault && <Badge variant="info">Asosiy</Badge>}
                    {activeShopId === shop.id && <Badge variant="success">Tanlangan</Badge>}
                    {!shop.hasToken && <Badge variant="warning">Token kerak</Badge>}
                  </div>
                  <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                    <p className="break-all">Do&apos;kon ID: {shop.shopId}</p>
                    <p>{shop.salesSyncedFrom ? `Sotuvlar: ${shop.salesSyncedFrom}${shop.salesSyncedTo ? ` — ${shop.salesSyncedTo}` : ""}` : "Sotuvlar hali yuklanmagan"}</p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2 border-t pt-3 sm:border-0 sm:pt-0">
                {!shop.isDefault && (
                  <Button variant="outline" className="min-h-11 flex-1 rounded-xl sm:flex-none" onClick={() => onMakeDefault(shop)} disabled={Boolean(busy)}>
                    {busy === `default-${shop.id}` ? <RefreshCw className="size-4 animate-spin" /> : <Star className="size-4" />} Asosiy qilish
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="size-11 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteTarget(shop)} disabled={Boolean(busy)} aria-label={`${shop.name} do'konini o'chirish`}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {(adding || shops.length === 0) && (
          <form id="shop-token-form" className="space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4" onSubmit={(event) => { event.preventDefault(); void onAdd(); }}>
            <Label htmlFor="shop-api-token" className="flex items-center gap-2 text-sm font-medium"><KeyRound className="size-4 text-primary" /> Uzum Seller API tokeni</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input id="shop-api-token" type="password" autoComplete="off" spellCheck={false} placeholder="API tokeningizni kiriting" value={token} onChange={(event) => setToken(event.target.value)} className="h-11 min-w-0 rounded-xl bg-background" disabled={Boolean(busy)} aria-describedby="shop-token-help" />
              <Button type="submit" className="min-h-11 rounded-xl px-5" disabled={Boolean(busy) || !token.trim()}>
                {busy === "add" ? <RefreshCw className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {busy === "add" ? "Ulanmoqda…" : "Do'konni ulash"}
              </Button>
            </div>
            <p id="shop-token-help" className="text-xs leading-relaxed text-muted-foreground">Tokenni Uzum Seller kabinetingizdan oling. Mavjud do&apos;kon tokenini kiritsangiz, u yangilanadi.</p>
          </form>
        )}
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> Har bir do&apos;konning ma&apos;lumotlari alohida saqlanadi.</p>
      </CardContent>
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !busy) setDeleteTarget(null); }}>
        <DialogContent className="w-[calc(100%_-_2rem)] rounded-2xl [&>button]:min-h-11 [&>button]:min-w-11 [&>button]:right-2 [&>button]:top-2">
          <DialogHeader>
            <DialogTitle className="pr-10 leading-snug">Do&apos;konni o&apos;chirish</DialogTitle>
            <DialogDescription className="break-words leading-relaxed">«{deleteTarget?.name}» do&apos;koni va unga tegishli barcha hisob-kitoblar o&apos;chiriladi. Bu amalni ortga qaytarib bo&apos;lmaydi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="min-h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
            <Button variant="destructive" className="min-h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => deleteTarget && void onDelete(deleteTarget)}>{busy?.startsWith("delete-") && <RefreshCw className="size-4 animate-spin" />} Do&apos;konni o&apos;chirish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
