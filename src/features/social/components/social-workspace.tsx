"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Check, ChevronLeft, ChevronRight, CircleHelp, Layers3, Loader2, Package, RefreshCw, Search, Send, Settings2, Unlink, X } from "lucide-react";
import { toast } from "sonner";
import { NetworkIcon } from "@/components/brand/network-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InstagramPanel } from "@/features/instagram/components/instagram-panel";
import { ApiError, fetchNetworksOverview, fetchProducts, fetchSocialAccounts, fetchSocialPosts, unlinkSocialPost } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { PLATFORM_LABEL, PLATFORM_ORDER } from "@/lib/platforms";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { useQueryState } from "@/lib/use-query-state";
import { cn } from "@/lib/utils";
import type { NetworksOverview, SocialAccount, SocialPlatform, SocialPost, WarehouseProduct } from "@/lib/types";
import { useBroadcastStore } from "@/stores/broadcast-store";
import { useSocialResource } from "../use-social-resource";
import { LinkPostDialog } from "./link-post-dialog";
import { PostTile } from "./post-tile";
import { PublishEverywhereDialog } from "./publish-everywhere-dialog";
import styles from "./social-workspace.module.css";

type Coverage = Map<number, Map<SocialPlatform, SocialPost[]>>;
const loadPosts = () => fetchSocialPosts();
const loadAccounts = () => fetchSocialAccounts();
const PAGE_SIZE = 24;

export function SocialWorkspace() {
  const [rawTab, setTab] = useQueryState("tab", "coverage");
  const [instagramTab] = useQueryState("ig", "posts");
  const tab = rawTab === "coverage" || PLATFORM_ORDER.includes(rawTab as SocialPlatform) ? rawTab : "coverage";
  const showOverview = tab !== "instagram" || !["missing", "ads"].includes(instagramTab);
  const [query, setQuery] = useQueryState("q", "");
  const accountsResource = useSocialResource(loadAccounts);
  const overviewResource = useSocialResource(fetchNetworksOverview, showOverview);
  const accounts = accountsResource.data ?? [];
  const needsPosts = accounts.length > 0 && (tab === "coverage" || tab !== "instagram" && accounts.some((account) => account.platform === tab));
  const postsResource = useSocialResource(loadPosts, needsPosts);
  const posts = React.useMemo(() => [...new Map((postsResource.data ?? []).map((post) => [post.id, post])).values()], [postsResource.data]);
  const [linking, setLinking] = React.useState<SocialPost | null>(null);
  const [publishing, setPublishing] = React.useState<WarehouseProduct | null>(null);
  const [browsing, setBrowsing] = React.useState<{ product: WarehouseProduct; platform: SocialPlatform } | null>(null);
  const [unlinking, setUnlinking] = React.useState<{ post: SocialPost; productId: number } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const submitting = React.useRef(false);
  const mounted = React.useRef(true);
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const connected = React.useMemo(() => PLATFORM_ORDER.filter((platform) => accounts.some((account) => account.platform === platform)), [accounts]);
  const coverage = React.useMemo<Coverage>(() => {
    const result: Coverage = new Map();
    for (const post of posts) {
      for (const productId of new Set(post.products.map((product) => product.id))) {
        if (!result.has(productId)) result.set(productId, new Map());
        const platforms = result.get(productId)!;
        if (!platforms.has(post.platform)) platforms.set(post.platform, []);
        platforms.get(post.platform)!.push(post);
      }
    }
    return result;
  }, [posts]);
  const refresh = React.useCallback(() => {
    if (!mounted.current) return;
    void accountsResource.refresh();
    if (showOverview) void overviewResource.refresh();
    if (needsPosts) void postsResource.refresh();
  }, [accountsResource.refresh, overviewResource.refresh, postsResource.refresh, showOverview, needsPosts]);
  useAutoRefresh(refresh);
  const jobs = useBroadcastStore((state) => state.items);
  const activeJobs = React.useRef(new Set<number>());
  React.useEffect(() => {
    let completed = false;
    for (const job of jobs) {
      if (job.active) activeJobs.current.add(job.id);
      else if (activeJobs.current.delete(job.id)) completed = true;
    }
    if (completed) refresh();
  }, [jobs, refresh]);

  const askUnlink = (post: SocialPost, productId: number) => {
    setBrowsing(null);
    setUnlinking({ post, productId });
  };
  const unlink = async () => {
    if (!unlinking || submitting.current) return;
    submitting.current = true;
    setSaving(true);
    try {
      await unlinkSocialPost(unlinking.post.id, unlinking.productId);
      if (!mounted.current) return;
      setUnlinking(null);
      toast.success("Tovar bilan bog‘lanish uzildi");
      void postsResource.refresh();
    } catch (error) {
      if (mounted.current) toast.error(error instanceof ApiError ? error.message : "Bog‘lanishni uzib bo‘lmadi.");
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  };
  const refreshing = accountsResource.loading || overviewResource.loading || postsResource.loading;
  const selectedPosts = browsing ? coverage.get(browsing.product.id)?.get(browsing.platform) ?? [] : [];

  return (
    <div className={styles.workspace}>
      <Tabs value={tab} onValueChange={setTab}>
        <div className={styles.navigation}>
          <div className={styles.tabScroll}>
            <TabsList aria-label="Ijtimoiy tarmoqlar" className={styles.tabs}>
              <TabsTrigger value="coverage" className={styles.tab}><Layers3 /> Bog‘lanishlar</TabsTrigger>
              {PLATFORM_ORDER.map((platform) => (
                <TabsTrigger key={platform} value={platform} className={styles.tab}>
                  <NetworkIcon platform={platform} colored />{PLATFORM_LABEL[platform]}
                  {connected.includes(platform) && <span className={styles.connectedDot} aria-label="Ulangan" />}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className={styles.navActions}>
            <Button variant="ghost" size="icon" className={styles.iconButton} onClick={() => { refresh(); setRefreshKey((value) => value + 1); }} disabled={refreshing} aria-label="Ma’lumotlarni yangilash"><RefreshCw className={cn(refreshing && "animate-spin")} /></Button>
            <Button asChild variant="outline" className={styles.settings}><Link href={"/integrations" as Route} aria-label="Integratsiyalar" title="Integratsiyalar"><Settings2 /><span>Integratsiyalar</span></Link></Button>
          </div>
        </div>

        {showOverview && (overviewResource.loading && !overviewResource.data ? <Skeleton className="my-5 h-28 rounded-2xl" /> : overviewResource.data && connected.length > 0 ? <Overview overview={overviewResource.data} accounts={accounts} platform={tab === "coverage" ? null : tab as SocialPlatform} /> : null)}
        {showOverview && overviewResource.error && <Notice message="Statistika yangilanmadi. Qolgan bo‘limlardan foydalanishingiz mumkin." onRetry={overviewResource.refresh} />}
        {accountsResource.error && <Notice message={accountsResource.error} onRetry={accountsResource.refresh} />}

        <TabsContent value="coverage" className={styles.content}>
          <div className={styles.sectionHeading}>
            <div><h1>Tovarlar va e’lonlar</h1><p>Tovar qayerga joylanganini bir joyda kuzating.</p></div>
          </div>
          {accountsResource.loading && !accountsResource.data ? <LoadingRows /> : !accountsResource.data ? null : connected.length === 0 ? <Disconnected /> : (
            <>
              <div className={styles.toolbar}><ProductSearch value={query} onChange={setQuery} /><span className={styles.quietLabel}>Ulangan tarmoqlar va mavjud e’lonlar</span></div>
              {postsResource.error && <Notice message={postsResource.error} onRetry={postsResource.refresh} />}
              <CoverageResults key={query} query={query} coverage={coverage} connected={connected} postsReady={postsResource.data !== null ? true : postsResource.error ? null : false} canPublish={accounts.some((account) => account.canPublish && !account.tokenExpired)} onPublish={setPublishing} onBrowse={(product, platform) => setBrowsing({ product, platform })} />
            </>
          )}
        </TabsContent>

        <TabsContent value="instagram" className={styles.content}><InstagramPanel refreshKey={refreshKey} /></TabsContent>
        {PLATFORM_ORDER.filter((platform) => platform !== "instagram").map((platform) => (
          <TabsContent key={platform} value={platform} className={styles.content}>
            {accountsResource.loading && !accountsResource.data ? <LoadingRows /> : !accountsResource.data ? null : !connected.includes(platform) ? <Disconnected platform={platform} /> : (
              <>
                {accounts.filter((account) => account.platform === platform && (account.error || account.warning || account.tokenExpired)).map((account) => <Notice key={account.id} message={`${account.name ?? account.username ?? PLATFORM_LABEL[platform]}: ${account.tokenExpired ? "ulanish muddati tugagan. Integratsiyalarda qayta ulang." : account.error ?? account.warning}`} />)}
                {postsResource.error && <Notice message={postsResource.error} onRetry={postsResource.refresh} />}
                {postsResource.data === null ? postsResource.loading ? <LoadingRows /> : null : <NetworkFeed key={platform} platform={platform} posts={posts.filter((post) => post.platform === platform)} onLink={setLinking} onUnlink={askUnlink} onPublish={() => setTab("coverage")} />}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={browsing !== null} onOpenChange={(open) => !open && setBrowsing(null)}>
        <DialogContent className={styles.postsDialog}>
          <DialogHeader className="pr-9"><DialogTitle>{browsing ? PLATFORM_LABEL[browsing.platform] : "Tarmoq"} e’lonlari</DialogTitle><DialogDescription className="line-clamp-2">{browsing?.product.title}</DialogDescription></DialogHeader>
          <div className={styles.dialogBody}><div className={styles.postGrid}>{selectedPosts.map((post) => <PostTile key={post.id} post={post} onLink={(item) => { setBrowsing(null); setLinking(item); }} onUnlink={askUnlink} />)}</div>{selectedPosts.length === 0 && <Empty title="Bog‘langan e’lon qolmadi" description="Ushbu tovar uchun yangi e’lon joylashingiz mumkin." />}</div>
        </DialogContent>
      </Dialog>
      <LinkPostDialog post={linking} onOpenChange={(open) => !open && setLinking(null)} onSaved={() => { void postsResource.refresh(); }} />
      <PublishEverywhereDialog product={publishing} accounts={accounts} onOpenChange={(open) => !open && setPublishing(null)} />
      <Dialog open={unlinking !== null} onOpenChange={(open) => { if (!open && !submitting.current) setUnlinking(null); }}>
        <DialogContent className={styles.confirmDialog} aria-busy={saving}>
          <DialogHeader className="pr-8"><span className={styles.emptyIcon}><Unlink /></span><DialogTitle>Bog‘lanishni uzasizmi?</DialogTitle><DialogDescription>E’lon tarmoqdan o‘chirilmaydi. Faqat ushbu tovar bilan bog‘lanishi olib tashlanadi.</DialogDescription></DialogHeader>
          <p className={styles.confirmProduct}>{unlinking?.post.products.find((product) => product.id === unlinking.productId)?.title}</p>
          <DialogFooter><Button variant="outline" disabled={saving} onClick={() => setUnlinking(null)}>Bekor qilish</Button><Button variant="destructive" disabled={saving} onClick={unlink}>{saving ? <Loader2 className="animate-spin" /> : <Unlink />}Bog‘lanishni uzish</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Overview({ overview, accounts, platform }: { overview: NetworksOverview; accounts: SocialAccount[]; platform: SocialPlatform | null }) {
  const network = platform ? overview.networks.find((item) => item.platform === platform) : null;
  const matching = platform ? accounts.filter((account) => account.platform === platform) : accounts;
  if (matching.length === 0) return null;
  const connected = PLATFORM_ORDER.filter((name) => matching.some((account) => account.platform === name));
  const metrics = [
    { label: "Obunachilar", value: platform ? network?.followers : overview.totalFollowers, hint: "Akkauntlardagi obunachilar yig‘indisi. Bir odam bir necha akkauntda bo‘lishi mumkin." },
    { label: "E’lonlar", value: platform ? network?.posts : overview.totalPosts },
    { label: "Qamrov", value: platform ? network?.insightsAvailable ? network.audience : null : overview.networks.some((item) => item.accounts > 0 && item.insightsAvailable) ? overview.totalAudience : null, hint: "E’lonlar qamrovi yig‘indisi, noyob auditoriya emas. Faqat statistika taqdim etadigan tarmoqlar hisoblanadi." },
    ...(platform ? [{ label: "Faollik", value: network?.interactionsAvailable ? network.engagementRate : null, suffix: "%" }] : []),
  ];
  return <section className={styles.overview} aria-label="Tarmoq statistikasi">
    <div className={styles.accountSummary}>
      <div className={styles.networkIcons}>{connected.map((name) => <span key={name}><NetworkIcon platform={name} colored /></span>)}</div>
      <div><strong>{platform ? matching.length === 1 ? matching[0].name ?? matching[0].username ?? PLATFORM_LABEL[platform] : PLATFORM_LABEL[platform] : "Ulangan tarmoqlar"}</strong><p>{platform ? `${matching.length} ta akkaunt` : `${connected.length} ta tarmoq · ${matching.length} ta akkaunt`}</p></div>
    </div>
    <dl className={cn(styles.metrics, platform && styles.fourMetrics)}>{metrics.map((metric) => <div key={metric.label}><dt title={metric.hint}>{metric.label}{metric.hint && <CircleHelp aria-hidden="true" />}</dt><dd>{metric.value == null ? "—" : `${formatNumber(metric.value)}${"suffix" in metric ? metric.suffix ?? "" : ""}`}</dd></div>)}</dl>
  </section>;
}

function ProductSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);
  React.useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChange(draft), 350);
    return () => clearTimeout(timer);
  }, [draft, value, onChange]);
  return <div className={styles.search}><Search /><Input aria-label="Tovar qidirish" placeholder="Tovar nomi yoki SKU bo‘yicha qidirish" value={draft} onChange={(event) => setDraft(event.target.value)} />{draft && <button type="button" aria-label="Qidiruvni tozalash" onClick={() => setDraft("")}><X /></button>}</div>;
}

function CoverageResults({ query, ...props }: { query: string; coverage: Coverage; connected: SocialPlatform[]; postsReady: boolean | null; canPublish: boolean; onPublish: (product: WarehouseProduct) => void; onBrowse: (product: WarehouseProduct, platform: SocialPlatform) => void }) {
  const [page, setPage] = React.useState(1);
  return <ProductPage key={`${query}:${page}`} query={query} page={page} onPage={setPage} {...props} />;
}

function ProductPage({ query, page, onPage, coverage, connected, postsReady, canPublish, onPublish, onBrowse }: { query: string; page: number; onPage: (page: number) => void; coverage: Coverage; connected: SocialPlatform[]; postsReady: boolean | null; canPublish: boolean; onPublish: (product: WarehouseProduct) => void; onBrowse: (product: WarehouseProduct, platform: SocialPlatform) => void }) {
  const loader = React.useCallback(() => fetchProducts({ search: query.trim() || undefined, page, size: PAGE_SIZE }), [query, page]);
  const resource = useSocialResource(loader);
  if (resource.error && !resource.data) return <Notice message={resource.error} onRetry={resource.refresh} />;
  if (!resource.data) return <LoadingRows />;
  const { results, count, pages } = resource.data;
  if (results.length === 0) return <Empty title={query ? "Tovar topilmadi" : "Hozircha tovar yo‘q"} description={query ? "Boshqa nom yoki SKU bilan qidirib ko‘ring." : "Avval omborga tovar qo‘shing, keyin uni tarmoqlarga joylang."} action={page > 1 ? <Button variant="outline" onClick={() => onPage(1)}>Birinchi sahifaga qaytish</Button> : !query ? <Button asChild variant="outline"><Link href={"/warehouse" as Route}>Omborga o‘tish<ArrowRight /></Link></Button> : undefined} />;
  return <section className={styles.catalog} aria-label="Tovarlarning tarmoqlardagi holati">
    <div className={styles.catalogHeader}><span>Tovar</span><span>Tarmoqlardagi e’lonlar</span></div>
    <div>{results.map((product) => {
      const linked = coverage.get(product.id);
      const platforms = PLATFORM_ORDER.filter((platform) => connected.includes(platform) || linked?.has(platform));
      return <article key={product.id} className={styles.productRow}>
        <Link href={`/warehouse/${product.id}` as Route} className={styles.productIdentity}>
          <span className={styles.productImage}>{product.image ? <img src={product.image} alt="" loading="lazy" /> : <Package />}</span>
          <span><strong>{product.title}</strong><small>{[product.variantName, product.skuCode ?? product.sellerSku ?? `ID ${product.id}`].filter(Boolean).join(" · ")}</small></span>
        </Link>
        <div className={styles.productNetworks}>{platforms.map((platform) => {
          const linkedPosts = linked?.get(platform) ?? [];
          const label = `${PLATFORM_LABEL[platform]}: ${postsReady === null ? "holat yuklanmadi" : postsReady ? linkedPosts.length > 0 ? `${linkedPosts.length} ta bog‘langan e’lon` : "hali joylanmagan" : "holat yuklanmoqda"}`;
          return linkedPosts.length > 0 ? <button type="button" key={platform} className={cn(styles.networkChip, styles.networkLinked)} onClick={() => onBrowse(product, platform)} aria-label={label} title={label}><NetworkIcon platform={platform} colored /><span className={styles.networkName}>{PLATFORM_LABEL[platform]}</span>{linkedPosts.length > 1 ? <span>{linkedPosts.length}</span> : <Check />}</button> : <span key={platform} className={styles.networkChip} title={label} aria-label={label}><NetworkIcon platform={platform} /><span className={styles.networkName}>{PLATFORM_LABEL[platform]}</span><span aria-hidden="true">{postsReady === null ? "?" : postsReady ? "—" : "…"}</span></span>;
        })}</div>
        <Button variant="outline" className={styles.publishButton} onClick={() => onPublish(product)} disabled={!canPublish} title={canPublish ? undefined : "Joylash uchun Integratsiyalarda faol akkaunt ulang"} aria-label={`${product.title} — joylash`}><Send /> Joylash</Button>
      </article>;
    })}</div>
    <div className={styles.pagination}><span>{`${formatNumber((page - 1) * PAGE_SIZE + 1)}–${formatNumber(Math.min(page * PAGE_SIZE, count))} / ${formatNumber(count)} ta tovar`}</span><div><Button variant="outline" size="icon" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Oldingi sahifa"><ChevronLeft /></Button><span>{page} / {Math.max(1, pages)}</span><Button variant="outline" size="icon" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Keyingi sahifa"><ChevronRight /></Button></div></div>
  </section>;
}

function NetworkFeed({ platform, posts, onLink, onUnlink, onPublish }: { platform: SocialPlatform; posts: SocialPost[]; onLink: (post: SocialPost) => void; onUnlink: (post: SocialPost, productId: number) => void; onPublish: () => void }) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [limit, setLimit] = React.useState(PAGE_SIZE);
  const filtered = React.useMemo(() => posts.filter((post) => (filter === "all" || (filter === "linked" ? post.products.length > 0 : post.products.length === 0)) && `${post.caption ?? ""} ${post.products.map((product) => product.title).join(" ")}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [posts, query, filter]);
  return <div className={styles.feed}>
    <div className={styles.sectionHeading}><div><h1>E’lonlar</h1><p>Kontent, natija va bog‘langan tovar — bitta kartada.</p></div><Button className={styles.primaryAction} onClick={onPublish}><Send /> Tovar joylash</Button></div>
    {posts.length > 0 && <div className={styles.toolbar}>
      <div className={styles.search}><Search /><Input aria-label="E’lon qidirish" placeholder="Matn yoki tovar bo‘yicha qidirish" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(PAGE_SIZE); }} />{query && <button type="button" aria-label="E’lon qidiruvini tozalash" onClick={() => setQuery("")}><X /></button>}</div>
      <div className={styles.filters} role="group" aria-label="E’lon bog‘lanishi">{[["all", "Barchasi"], ["linked", "Bog‘langan"], ["unlinked", "Bog‘lanmagan"]].map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); setLimit(PAGE_SIZE); }}>{label}</button>)}</div>
    </div>}
    {filtered.length === 0 ? <Empty title={posts.length ? "Mos e’lon topilmadi" : "Birinchi e’loningizni joylang"} description={posts.length ? "Qidiruv yoki filtrni o‘zgartirib ko‘ring." : platform === "telegram" ? "Ochiq kanaldagi eski e’lonlar ham olinadi. Yopiq kanalda faqat bot qo‘shilgandan keyingi e’lonlar ko‘rinadi." : "Ombordan tovar tanlang va ulangan akkauntingizga joylang."} action={posts.length ? <Button variant="outline" onClick={() => { setQuery(""); setFilter("all"); }}>Filtrlarni tozalash</Button> : undefined} /> : <><div className={styles.postGrid}>{filtered.slice(0, limit).map((post) => <PostTile key={post.id} post={post} onLink={onLink} onUnlink={onUnlink} />)}</div><div className={styles.feedFooter}><span>{Math.min(limit, filtered.length)} / {filtered.length} ta e’lon ko‘rsatilmoqda</span>{limit < filtered.length && <Button variant="outline" onClick={() => setLimit((current) => current + PAGE_SIZE)}>Yana {Math.min(PAGE_SIZE, filtered.length - limit)} ta ko‘rsatish</Button>}</div></>}
  </div>;
}

function Disconnected({ platform }: { platform?: SocialPlatform }) {
  return <Empty title={platform ? `${PLATFORM_LABEL[platform]} hali ulanmagan` : "Birinchi tarmog‘ingizni ulang"} description="Akkauntingizni ulang. Tovarlarni joylash va e’lonlarni kuzatish shu yerda bo‘ladi." action={<Button asChild><Link href={"/integrations" as Route}>Tarmoq ulash<ArrowRight /></Link></Button>} />;
}

function Empty({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className={styles.empty}><span className={styles.emptyIcon}><Layers3 /></span><h2>{title}</h2><p>{description}</p>{action}</div>;
}

function Notice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className={styles.notice} role="status"><CircleHelp /><p>{message}</p>{onRetry && <Button variant="outline" onClick={onRetry}>Qayta urinish</Button>}</div>;
}

function LoadingRows() {
  return <div className="space-y-2 py-2" role="status" aria-label="Yuklanmoqda">{[0, 1, 2, 3].map((index) => <Skeleton key={index} className="h-24 w-full rounded-2xl" />)}</div>;
}
