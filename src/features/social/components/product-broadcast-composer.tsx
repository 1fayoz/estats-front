"use client";

import * as React from "react";
import { toast } from "sonner";
import { ApiError, fetchPublishPreview, fetchSocialAccounts, publishToSocial } from "@/lib/api";
import type { BroadcastResult, PublishPreview, SocialAccount, WarehouseProduct } from "@/lib/types";
import { useBroadcastStore } from "@/stores/broadcast-store";
import { useUserStore } from "@/stores/user-store";
import { PublishComposer, PublishComposerFields, PublishDestinations, PublishQueuedResult, togglePublishAccount, togglePublishImage } from "./publish-composer";

export function ProductBroadcastComposer({ productId, product, accounts: suppliedAccounts, onOpenChange, onPublished }: {
  productId: number;
  product?: WarehouseProduct;
  accounts?: SocialAccount[];
  onOpenChange: (open: boolean) => void;
  onPublished?: () => void;
}) {
  const [preview, setPreview] = React.useState<PublishPreview | null>(null);
  const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
  const [chosen, setChosen] = React.useState<Set<number>>(new Set());
  const [caption, setCaption] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const [withPrice, setWithPrice] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [retry, setRetry] = React.useState(0);
  const [result, setResult] = React.useState<BroadcastResult | null>(null);
  const submitting = React.useRef(false);
  const mounted = React.useRef(true);
  const initial = React.useRef({ product, accounts: suppliedAccounts });
  const scope = React.useRef(getScope());
  const put = useBroadcastStore((state) => state.put);
  const liveResult = useBroadcastStore((state) => result ? state.items.find((item) => item.id === result.id) : undefined);
  const usable = (suppliedAccounts ?? accounts).filter((account) => account.canPublish && !account.tokenExpired);
  const selectedIds = usable.filter((account) => chosen.has(account.id)).map((account) => account.id);
  const availableImages = React.useMemo(() => [...new Set(preview?.images ?? [])], [preview?.images]);
  const needsImages = usable.some((account) => chosen.has(account.id) && (account.platform === "instagram" || account.platform === "tiktok"));
  const noImages = images.length === 0 && (availableImages.length > 0 || needsImages);
  const current = () => mounted.current && scope.current === getScope();

  React.useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    const source = initial.current.product;
    const previewRequest = source ? Promise.resolve<PublishPreview>({
      productId: source.id,
      title: source.title,
      caption: "",
      images: source.images.length ? source.images : source.image ? [source.image] : [],
      uzumUrl: source.uzumUrl,
      canPublish: true,
      reason: null,
    }) : fetchPublishPreview(productId);
    Promise.all([previewRequest, initial.current.accounts ? Promise.resolve(initial.current.accounts) : fetchSocialAccounts()])
      .then(([draft, destinations]) => {
        if (!active) return;
        setPreview(draft);
        setCaption(source ? "" : draft.caption);
        setImages([...new Set(draft.images)].slice(0, 10));
        setAccounts(destinations);
        setChosen(new Set(destinations.filter((account) => account.canPublish && !account.tokenExpired && (source || account.isDefault)).map((account) => account.id)));
      })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof ApiError ? error.message : "E’lon ma’lumotlari yuklanmadi."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId, retry]);

  const close = (open: boolean) => { if (!submitting.current) onOpenChange(open); };
  const submit = async () => {
    if (!preview || loading || loadError || submitting.current || result || selectedIds.length === 0 || noImages || !current()) return;
    submitting.current = true;
    setSending(true);
    setSubmitError(null);
    try {
      const job = await publishToSocial({
        productId,
        accountIds: selectedIds,
        caption: product ? caption.trim() || undefined : caption,
        images: images.length ? images : undefined,
        ...(product ? { withPrice: withPrice && !caption.trim() && product.marketplacePrice != null && product.marketplacePrice > 0 } : {}),
      });
      if (!current()) return;
      put(job);
      setResult(job);
      onPublished?.();
      if (product) {
        onOpenChange(false);
        if (job.active) toast.success("E’lon navbatga qo‘yildi", { description: `${selectedIds.length} ta akkauntga yuboriladi. Natijani pastdagi panelda kuzating.` });
        else if (job.failed) toast.error("Ayrim akkauntlarga joylanmadi. Holat panelini tekshiring.");
        else toast.success(`${job.sent} ta akkauntga joylandi`);
      }
    } catch (error) {
      if (current()) setSubmitError(error instanceof ApiError ? error.message : "Yuborilmadi. Tanlovlaringiz saqlandi — qayta urinib ko‘ring.");
    } finally {
      submitting.current = false;
      if (current()) setSending(false);
    }
  };

  return <PublishComposer open onOpenChange={close} title="Tarmoqlarga joylash" description="Bitta e’lon tayyorlang, kerakli akkauntlarni tanlang." loading={loading} loadError={loadError} onRetry={() => setRetry((value) => value + 1)} submitting={sending} submitError={submitError} onSubmit={submit} submitDisabled={selectedIds.length === 0 || noImages || !preview} submitLabel={selectedIds.length ? `${selectedIds.length} ta akkauntga joylash` : "Akkaunt tanlang"} completed={result !== null}>
    {result ? <PublishQueuedResult result={liveResult ?? result} /> : preview && <>
      <PublishDestinations accounts={usable} selected={new Set(selectedIds)} onToggle={(accountId) => setChosen((value) => togglePublishAccount(value, accountId))} disabled={sending} />
      <PublishComposerFields title={preview.title} availableImages={availableImages} images={images} onToggleImage={(url) => setImages((value) => togglePublishImage(value, url))} caption={caption} onCaptionChange={setCaption} disabled={sending} captionHint={product ? "Bo‘sh qoldirsangiz, tovar nomi va havolasidan matn avtomatik tayyorlanadi." : "Uzun matn tanlangan tarmoq chegarasiga qarab qisqartirilishi mumkin."} warning={noImages ? "Joylash uchun kamida bitta rasm tanlang. Rasm yo‘q bo‘lsa, avval uni tovar kartochkasiga qo‘shing." : null} priceOption={product ? { value: withPrice, price: product.marketplacePrice, onChange: setWithPrice } : undefined} />
    </>}
  </PublishComposer>;
}

function getScope() {
  const state = useUserStore.getState();
  return `${state.user?.id}:${state.workspaceId}:${state.activeShopId}`;
}
