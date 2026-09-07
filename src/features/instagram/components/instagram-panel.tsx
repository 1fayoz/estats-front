"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  AlertTriangle, ArrowRight, CheckCircle2, ImagePlus, Loader2,
  Megaphone, Package, Pause, Play, Search, Trash2, Unlink, X,
} from "lucide-react";
import { toast } from "sonner";

import { NetworkIcon } from "@/components/brand/network-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdDialog } from "@/features/instagram/components/ad-dialog";
import { LinkDialog } from "@/features/instagram/components/link-dialog";
import { PostCard } from "@/features/instagram/components/post-card";
import { BroadcastDialog } from "@/features/social/components/broadcast-dialog";
import {
  ApiError, deleteInstagramAd, fetchInstagramAccount, fetchInstagramAds,
  fetchInstagramCoverage, fetchInstagramPosts, startInstagramAd, stopInstagramAd,
  unlinkPostFromProduct,
} from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { useQueryState } from "@/lib/use-query-state";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useBroadcastStore } from "@/stores/broadcast-store";
import type { CoverageItem, InstagramAd, InstagramPost } from "@/lib/types";
import workspaceStyles from "@/features/social/components/social-workspace.module.css";

type InstagramTab = "posts" | "missing" | "ads";
type AdAction = { ad: InstagramAd; kind: "start" | "delete" };

function currentScope() {
  const state = useUserStore.getState();
  return [state.user?.id, state.workspaceId, state.activeShopId].join(":");
}

function useLazyResource<Resource>(fetcher: () => Promise<Resource>) {
  const [data, setData] = React.useState<Resource | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const mounted = React.useRef(true);
  const cached = React.useRef(false);
  const version = React.useRef(0);
  const pending = React.useRef<Promise<Resource | null> | null>(null);

  React.useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; version.current += 1; pending.current = null; };
  }, []);

  const load = React.useCallback((): Promise<Resource | null> => {
    if (pending.current) return pending.current;
    const requestVersion = ++version.current;
    setLoading(true);
    setError(null);
    const request = fetcher().then((result) => {
      if (!mounted.current || requestVersion !== version.current) return null;
      cached.current = true;
      setData(result);
      return result;
    }).catch((failure) => {
      if (mounted.current && requestVersion === version.current) {
        setError(failure instanceof Error ? failure.message : "Ma'lumotlarni yuklab bo'lmadi.");
      }
      return null;
    }).finally(() => {
      if (requestVersion === version.current) {
        pending.current = null;
        if (mounted.current) setLoading(false);
      }
    });
    pending.current = request;
    return request;
  }, [fetcher]);

  const ensure = React.useCallback(() => {
    if (!cached.current) void load();
  }, [load]);

  const invalidate = React.useCallback(() => {
    cached.current = false;
    version.current += 1;
    pending.current = null;
    if (mounted.current) {
      setLoading(false);
      setData(null);
    }
  }, []);

  return { data, error, loading, load, ensure, invalidate };
}

export function InstagramPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const scope = useUserStore((state) => [state.user?.id, state.workspaceId, state.activeShopId].join(":"));
  return <InstagramWorkspace key={scope} scope={scope} refreshKey={refreshKey} />;
}

function InstagramWorkspace({ scope, refreshKey }: { scope: string; refreshKey: number }) {
  const [rawTab, setTab] = useQueryState("ig", "posts");
  const tab: InstagramTab = rawTab === "missing" || rawTab === "ads" ? rawTab : "posts";
  const account = useLazyResource(fetchInstagramAccount);
  const posts = useLazyResource(fetchInstagramPosts);
  const coverage = useLazyResource(fetchInstagramCoverage);
  const ads = useLazyResource(fetchInstagramAds);
  const activeResource = tab === "posts" ? posts : tab === "missing" ? coverage : ads;
  const [postQuery, setPostQuery] = React.useState("");
  const [productQuery, setProductQuery] = React.useState("");
  const [linking, setLinking] = React.useState<InstagramPost | null>(null);
  const [unlinking, setUnlinking] = React.useState<{ post: InstagramPost; productId: number } | null>(null);
  const [postLimit, setPostLimit] = React.useState(24);
  const [productLimit, setProductLimit] = React.useState(24);
  const [advertising, setAdvertising] = React.useState<InstagramPost | null>(null);
  const [publishing, setPublishing] = React.useState<CoverageItem | null>(null);
  const [confirmation, setConfirmation] = React.useState<AdAction | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const actionPending = React.useRef(false);
  const mounted = React.useRef(true);
  const cancelButton = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    mounted.current = true;
    account.ensure();
    return () => { mounted.current = false; };
  }, [account.ensure]);

  React.useEffect(() => {
    if (account.data?.connected) activeResource.ensure();
  }, [account.data?.connected, activeResource.ensure]);

  const current = () => mounted.current && currentScope() === scope;
  const refresh = async () => {
    if (actionPending.current) return;
    const connected = await account.load();
    if (!current()) return;
    if (connected?.id !== account.data?.id) {
      posts.invalidate();
      coverage.invalidate();
      ads.invalidate();
      setLinking(null);
      setAdvertising(null);
      setPublishing(null);
      setConfirmation(null);
    }
    if (connected?.connected) await activeResource.load();
  };
  useAutoRefresh(refresh);
  const manualRefresh = React.useRef(refresh);
  manualRefresh.current = refresh;
  const previousRefreshKey = React.useRef(refreshKey);
  React.useEffect(() => {
    if (previousRefreshKey.current === refreshKey) return;
    previousRefreshKey.current = refreshKey;
    void manualRefresh.current();
  }, [refreshKey]);

  const refreshAfterChange = () => {
    if (!current()) return;
    posts.invalidate();
    coverage.invalidate();
    ads.invalidate();
    void activeResource.load();
  };

  const afterPublish = React.useRef(refreshAfterChange);
  afterPublish.current = refreshAfterChange;
  React.useEffect(() => useBroadcastStore.subscribe((state, previous) => {
    if (currentScope() !== scope) return;
    const completed = state.items.some((broadcast) => !broadcast.active && previous.items.some((earlier) => earlier.id === broadcast.id && earlier.active) && broadcast.items.some((item) => item.platform === "instagram" && item.ok));
    if (completed) afterPublish.current();
  }), [scope]);

  const onUnlink = async (post: InstagramPost, productId: number) => {
    if (actionPending.current || !current()) return;
    actionPending.current = true;
    setBusy("Bog'lanish uzilmoqda...");
    try {
      await unlinkPostFromProduct(post.id, productId);
      if (current()) {
        toast.success("Tovar bilan bog'lanish uzildi");
        setUnlinking(null);
        refreshAfterChange();
      }
    } catch (failure) {
      if (current()) toast.error(failure instanceof ApiError ? failure.message : "Bog'lanish uzilmadi.");
    } finally {
      actionPending.current = false;
      if (current()) setBusy(null);
    }
  };

  const runAdAction = async (ad: InstagramAd, kind: "start" | "stop" | "delete") => {
    if (actionPending.current || !current()) return;
    actionPending.current = true;
    setBusy(kind === "delete" ? "Reklama o'chirilmoqda..." : kind === "start" ? "Reklama yoqilmoqda..." : "Reklama to'xtatilmoqda...");
    setActionError(null);
    ads.invalidate();
    try {
      if (kind === "delete") await deleteInstagramAd(ad.id);
      else if (kind === "start") await startInstagramAd(ad.id);
      else await stopInstagramAd(ad.id);
      if (!current()) return;
      toast.success(kind === "delete" ? "Reklama o'chirildi" : kind === "start" ? "Reklama yoqildi" : "Reklama to'xtatildi");
      setConfirmation(null);
      posts.invalidate();
      await ads.load();
    } catch (failure) {
      if (current()) {
        const message = failure instanceof ApiError ? failure.message : "Amal bajarilmadi. Qayta urinib ko'ring.";
        setActionError(message);
        toast.error(message);
      }
    } finally {
      actionPending.current = false;
      if (current()) setBusy(null);
    }
  };

  if (!account.data) {
    return account.error ? <LoadError message={account.error} retry={() => void account.load()} /> : <LoadingCards />;
  }

  if (!account.data.connected) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-5 py-12 text-center">
        <div className="mb-4 grid size-12 place-items-center rounded-2xl border bg-background"><NetworkIcon platform="instagram" colored className="size-6" /></div>
        <h3 className="font-semibold">Instagram ulanmagan</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Postlarni boshqarish va reklama yaratish uchun Instagram akkauntingizni ulang.</p>
        <Button asChild className="mt-5 h-11 rounded-xl"><Link href={"/integrations" as Route}>Instagram ulash <ArrowRight /></Link></Button>
      </div>
    );
  }

  const connectedAccount = account.data;
  const postList = posts.data ?? [];
  const missingItems = coverage.data?.items ?? [];
  const adList = ads.data ?? [];
  const matchingPosts = postList.filter((post) => [post.caption, ...post.products.map((product) => product.title)].some((value) => value?.toLocaleLowerCase().includes(postQuery.trim().toLocaleLowerCase())) || !postQuery.trim());
  const matchingProducts = missingItems.filter((item) => item.title.toLocaleLowerCase().includes(productQuery.trim().toLocaleLowerCase()));
  const activeAds = adList.filter((ad) => ad.status === "active").length;
  const totalSpend = adList.reduce((sum, ad) => sum + ad.spend, 0);
  const initialLoading = activeResource.data === null && !activeResource.error;
  const pendingMessage = busy ?? (activeResource.loading && activeResource.data !== null ? "Yangilanmoqda..." : null);

  return (
    <div className="min-w-0 space-y-4">
      {account.error && <LoadError message={account.error} retry={() => void account.load()} />}
      {connectedAccount.missing.length > 0 && (
        <details className="rounded-xl border border-[color:var(--warn)]/25 bg-[color:var(--warn)]/5 px-4">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium"><AlertTriangle className="size-4 shrink-0 text-[var(--warn)]" />Ba'zi imkoniyatlar cheklangan <span className="ml-auto text-xs text-muted-foreground">{connectedAccount.missing.length}</span></summary>
          <div className="pb-4 text-xs leading-5 text-muted-foreground"><ul className="list-inside list-disc space-y-1">{connectedAccount.missing.map((item) => <li key={item}>{item}</li>)}</ul><Link href={"/integrations" as Route} className="mt-2 inline-flex min-h-11 items-center text-foreground underline underline-offset-4">Integratsiyalarni tekshirish <ArrowRight className="ml-2 size-3.5" /></Link></div>
        </details>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border bg-muted/25 p-1 sm:w-auto">
            <TabsTrigger value="posts" className="min-h-11 rounded-lg px-3 text-xs sm:px-5 sm:text-sm">Postlar</TabsTrigger>
            <TabsTrigger value="missing" className="min-h-11 rounded-lg px-3 text-xs sm:px-5 sm:text-sm">Joylanmagan</TabsTrigger>
            <TabsTrigger value="ads" className="min-h-11 rounded-lg px-3 text-xs sm:px-5 sm:text-sm">Reklama</TabsTrigger>
          </TabsList>
          {pendingMessage ? <span role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" />{pendingMessage}</span> : <span className="text-xs text-muted-foreground">{connectedAccount.username ? `@${connectedAccount.username} · ` : ""}Asosiy akkaunt</span>}
        </div>

        {activeResource.error && <div className="mt-4"><LoadError message={activeResource.error} retry={() => void activeResource.load()} /></div>}

        <TabsContent value="posts" className="mt-4 space-y-4">
          {initialLoading ? <LoadingCards /> : posts.data !== null && <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="text-sm font-semibold">Instagram postlari</h3><p role="status" className="mt-1 text-xs text-muted-foreground">{formatNumber(matchingPosts.length)} ta post{postQuery.trim() ? " topildi" : ""}</p></div>
              <SearchField value={postQuery} onChange={(value) => { setPostQuery(value); setPostLimit(24); }} label="Postlar yoki bog'langan tovarlarni qidirish" placeholder="Post yoki tovarni qidirish" />
            </div>
            {matchingPosts.length === 0 ? <Empty icon={ImagePlus} title={postQuery.trim() ? "Post topilmadi" : "Hali postlar yo'q"} text={postQuery.trim() ? "Boshqa so'z bilan qidiring yoki qidiruvni tozalang." : "Instagram'da post joylang yoki «Joylanmagan» bo'limidan tovar tanlang."} action={postQuery.trim() ? () => setPostQuery("") : () => setTab("missing")} actionLabel={postQuery.trim() ? "Qidiruvni tozalash" : "Tovarlarni ko'rish"} /> : <div className={workspaceStyles.postGrid}>{matchingPosts.slice(0, postLimit).map((post) => <PostCard key={post.id} post={post} onLink={setLinking} onUnlink={(item, productId) => setUnlinking({ post: item, productId })} onAdvertise={setAdvertising} canAdvertise={connectedAccount.canAdvertise && !busy} />)}</div>}
            {matchingPosts.length > postLimit && <Button variant="outline" className="h-11 rounded-xl" onClick={() => setPostLimit((value) => value + 24)}>Yana {Math.min(24, matchingPosts.length - postLimit)} ta ko‘rsatish</Button>}
          </>}
        </TabsContent>

        <TabsContent value="missing" className="mt-4 space-y-4">
          {initialLoading ? <LoadingCards /> : coverage.data !== null && <>
            <div className="grid grid-cols-2 divide-x rounded-2xl border bg-muted/20 py-4">
              <Stat label="Joylanmagan tovar" value={formatNumber(coverage.data.missing)} />
              <Stat label="Bog‘langan / jami" value={formatNumber(coverage.data.posted) + " / " + formatNumber(coverage.data.total)} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="text-sm font-semibold">Joylash uchun tovarlar</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Eng ko'p sotilganlari yuqorida. Joylashdan oldin postni tekshirasiz.</p></div>
              <SearchField value={productQuery} onChange={(value) => { setProductQuery(value); setProductLimit(24); }} label="Joylanmagan tovarlarni qidirish" placeholder="Tovarni qidirish" />
            </div>
            {matchingProducts.length === 0 ? <Empty icon={productQuery.trim() ? Search : CheckCircle2} title={productQuery.trim() ? "Tovar topilmadi" : "Barcha tovarlar joylangan"} text={productQuery.trim() ? "Boshqa nom bilan qidiring." : "Yangi tovarlar qo'shilganda shu yerda ko'rinadi."} action={productQuery.trim() ? () => setProductQuery("") : undefined} actionLabel="Qidiruvni tozalash" /> : <div className="overflow-hidden rounded-2xl border bg-card">
              <p role="status" className="border-b px-4 py-3 text-xs text-muted-foreground">{formatNumber(matchingProducts.length)} ta tovar</p>
              <div className="divide-y">{matchingProducts.slice(0, productLimit).map((item) => (
                <article key={item.productId} className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
                  {item.image ? <img src={item.image} alt="" loading="lazy" className="size-14 shrink-0 rounded-xl border bg-background object-contain" /> : <div className="grid size-14 shrink-0 place-items-center rounded-xl border bg-muted/40"><Package className="size-5 text-muted-foreground" /></div>}
                  <div className="min-w-0 flex-1">
                    <Link href={("/warehouse/" + item.productId) as Route} className="line-clamp-2 text-sm font-medium leading-5 hover:underline">{item.title}</Link>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{formatNumber(item.soldQuantity)} sotilgan · qoldiq {formatNumber(item.stock)} · {formatNumber(item.imageCount)} ta rasm</p>
                    {(!item.canPublish || !connectedAccount.canPublish) && <p className="mt-1 text-xs leading-5 text-[var(--warn)]">{item.reason || "Post joylash uchun Instagram ruxsatlarini tekshiring."}</p>}
                  </div>
                  <Button variant="outline" className="h-11 w-full shrink-0 rounded-xl sm:w-auto" onClick={() => setPublishing(item)} disabled={!item.canPublish || !connectedAccount.canPublish || Boolean(busy)}><ImagePlus /> Post tayyorlash</Button>
                </article>
              ))}</div>
              {matchingProducts.length > productLimit && <div className="border-t p-4"><Button variant="outline" className="h-11 rounded-xl" onClick={() => setProductLimit((value) => value + 24)}>Yana {Math.min(24, matchingProducts.length - productLimit)} ta ko‘rsatish</Button></div>}
            </div>}
          </>}
        </TabsContent>

        <TabsContent value="ads" className="mt-4 space-y-4">
          {initialLoading ? <LoadingCards /> : ads.data !== null && <>
            <div className="grid grid-cols-2 divide-x rounded-2xl border bg-muted/20 py-4"><Stat label="Jami sarflangan" value={formatSum(totalSpend)} /><Stat label="Faol reklamalar" value={formatNumber(activeAds)} hint={formatNumber(adList.length) + " ta reklamadan"} /></div>
            <div><h3 className="text-sm font-semibold">Reklamalar</h3><p className="mt-1 text-xs text-muted-foreground">Byudjet, holat va natijalarni kuzating.</p></div>
            {actionError && !confirmation && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{actionError}</p>}
            {adList.length === 0 ? <Empty icon={Megaphone} title="Hali reklama yo'q" text="«Postlar» bo'limidan post tanlang va reklama rejasini tayyorlang." action={() => setTab("posts")} actionLabel="Postlarni ko'rish" /> : <div className="grid gap-4 xl:grid-cols-2">{adList.map((ad) => (
              <article key={ad.id} className="min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  {ad.thumbnail ? <img src={ad.thumbnail} alt="" loading="lazy" className="size-14 shrink-0 rounded-xl border object-cover" /> : <div className="grid size-14 shrink-0 place-items-center rounded-xl border bg-muted/40"><Megaphone className="size-5 text-muted-foreground" /></div>}
                  <div className="min-w-0 flex-1"><h4 className="line-clamp-2 text-sm font-semibold leading-5">{ad.title}</h4><div className="mt-2"><AdStatusBadge status={ad.status} /></div></div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3"><Mini label="Kunlik byudjet" value={formatSum(ad.dailyBudget)} /><Mini label="Auditoriya" value={ad.audience || "—"} /></dl>
                {ad.error && <p className="mt-3 rounded-lg bg-destructive/5 p-3 text-xs leading-5 text-destructive [overflow-wrap:anywhere]">{ad.error}</p>}
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4"><Mini label="Sarflandi" value={formatSum(ad.spend)} /><Mini label="Ko'rsatildi" value={formatNumber(ad.impressions)} /><Mini label="Bosildi" value={formatNumber(ad.clicks)} /><Mini label="Bir bosish" value={ad.costPerClick != null ? formatSum(ad.costPerClick) : "—"} /></dl>
                <div className="mt-4 flex gap-2 border-t pt-3">
                  {ad.status !== "failed" && <Button variant="outline" className="h-11 flex-1 rounded-xl" disabled={Boolean(busy) || (ad.status !== "active" && !connectedAccount.canAdvertise)} onClick={() => { setActionError(null); if (ad.status === "active") void runAdAction(ad, "stop"); else setConfirmation({ ad, kind: "start" }); }}>{ad.status === "active" ? <Pause /> : <Play />}{ad.status === "active" ? "To'xtatish" : "Yoqish"}</Button>}
                  <Button variant="ghost" size="icon" className="size-11 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive" disabled={Boolean(busy)} onClick={() => { setActionError(null); setConfirmation({ ad, kind: "delete" }); }} aria-label={ad.title + " reklamasini o'chirish"}><Trash2 /></Button>
                </div>
              </article>
            ))}</div>}
          </>}
        </TabsContent>
      </Tabs>

      <LinkDialog post={linking} onOpenChange={(open) => !open && setLinking(null)} onSaved={refreshAfterChange} />
      <AdDialog post={advertising} onOpenChange={(open) => !open && setAdvertising(null)} onSaved={refreshAfterChange} />
      <BroadcastDialog productId={publishing?.productId ?? null} onOpenChange={(open) => !open && setPublishing(null)} onPublished={refreshAfterChange} />
      <Dialog open={unlinking !== null} onOpenChange={(open) => { if (!open && !actionPending.current) setUnlinking(null); }}>
        <DialogContent className={cn("max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl p-5 [&>button]:right-2 [&>button]:top-2 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center", busy && "[&>button]:hidden")}>
          <DialogHeader><DialogTitle className="pr-8">Bog‘lanishni uzasizmi?</DialogTitle><DialogDescription>E’lon Instagram’dan o‘chirilmaydi. Faqat ushbu tovar bilan bog‘lanishi olib tashlanadi.</DialogDescription></DialogHeader>
          <p className="rounded-xl border p-4 text-sm [overflow-wrap:anywhere]">{unlinking?.post.products.find((product) => product.id === unlinking.productId)?.title}</p>
          <DialogFooter><Button variant="outline" className="h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => setUnlinking(null)}>Bekor qilish</Button><Button variant="destructive" className="h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => { if (unlinking) void onUnlink(unlinking.post, unlinking.productId); }}>{busy ? <Loader2 className="animate-spin" /> : <Unlink />}Bog‘lanishni uzish</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmation !== null} onOpenChange={(open) => { if (!open && !actionPending.current) setConfirmation(null); }}>
        <DialogContent className={cn("max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 [&>button]:right-2 [&>button]:top-2 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center", busy && "[&>button]:hidden")} onOpenAutoFocus={(event) => { event.preventDefault(); cancelButton.current?.focus(); }}>
          <DialogHeader><DialogTitle className="pr-8">{confirmation?.kind === "delete" ? "Reklama o'chirilsinmi?" : "Reklama yoqilsinmi?"}</DialogTitle><DialogDescription className="leading-6">{confirmation?.kind === "delete" ? "Reklama o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi." : "Tasdiqlasangiz, reklama ishga tushadi va quyidagi kunlik byudjet bo'yicha pul sarflash boshlanadi."}</DialogDescription></DialogHeader>
          {confirmation && <div className="rounded-xl border bg-muted/25 p-4"><p className="text-sm font-medium [overflow-wrap:anywhere]">{confirmation.ad.title}</p><p className="mt-2 text-sm font-semibold tabular-nums [overflow-wrap:anywhere]">{formatSum(confirmation.ad.dailyBudget)} / kun</p></div>}
          {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
          <DialogFooter><Button ref={cancelButton} variant="outline" className="h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => setConfirmation(null)}>Bekor qilish</Button><Button variant={confirmation?.kind === "delete" ? "destructive" : "default"} className="h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => { if (confirmation) void runAdAction(confirmation.ad, confirmation.kind); }}>{busy ? <Loader2 className="animate-spin" /> : confirmation?.kind === "delete" ? <Trash2 /> : <Play />}{confirmation?.kind === "delete" ? "Reklamani o'chirish" : "Tasdiqlash va yoqish"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SearchField({ value, onChange, label, placeholder }: { value: string; onChange: (value: string) => void; label: string; placeholder: string }) {
  return <div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" /><Input value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} placeholder={placeholder} className="h-11 rounded-xl pl-10 pr-11 text-base md:text-sm" />{value && <Button variant="ghost" size="icon" className="absolute right-0 top-0 size-11 rounded-xl" aria-label="Qidiruvni tozalash" onClick={() => onChange("")}><X /></Button>}</div>;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <div className="min-w-0 px-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-lg font-semibold tabular-nums [overflow-wrap:anywhere] sm:text-xl">{value}</p>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium tabular-nums [overflow-wrap:anywhere]">{value}</dd></div>;
}

function Empty({ icon: Icon, title, text, action, actionLabel }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string; action?: () => void; actionLabel?: string }) {
  return <div className="rounded-2xl border border-dashed bg-card px-5 py-12 text-center"><Icon className="mx-auto mb-4 size-7 text-muted-foreground" /><h3 className="text-sm font-semibold">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>{action && <Button variant="outline" className="mt-5 h-11 rounded-xl" onClick={action}>{actionLabel}</Button>}</div>;
}

function LoadingCards() {
  return <div role="status" aria-label="Instagram ma'lumotlari yuklanmoqda" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /><Skeleton className="hidden h-64 rounded-2xl xl:block" /></div>;
}

function LoadError({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="text-sm"><p className="font-medium">Ma'lumotlarni yuklab bo'lmadi</p><p className="mt-1 text-muted-foreground [overflow-wrap:anywhere]">{message}</p></div><Button variant="outline" className="h-11 shrink-0 rounded-xl" onClick={retry}>Qayta urinish</Button></div>;
}

const AD_STATUS = {
  draft: "Qoralama",
  paused: "To'xtatilgan",
  active: "Ishlayapti",
  finished: "Tugagan",
  failed: "Xato",
} as const;

function AdStatusBadge({ status }: { status: InstagramAd["status"] }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground", status === "active" && "bg-[color:var(--ok)]/10 text-[var(--ok)]", status === "failed" && "bg-destructive/10 text-destructive")}><span className="size-1.5 rounded-full bg-current" />{AD_STATUS[status] ?? AD_STATUS.draft}</span>;
}
