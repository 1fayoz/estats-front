"use client";

import * as React from "react";
import { toast } from "sonner";
import { ApiError, fetchPublishPreview, publishToInstagram } from "@/lib/api";
import type { PublishPreview } from "@/lib/types";
import { useUserStore } from "@/stores/user-store";
import { PublishComposer, PublishComposerFields, togglePublishImage } from "@/features/social/components/publish-composer";

interface PublishDialogProps {
  productId: number | null;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
}

export function PublishDialog(props: PublishDialogProps) {
  const scope = useUserStore((state) => `${state.user?.id}:${state.workspaceId}:${state.activeShopId}`);
  if (props.productId === null) return null;
  return <InstagramComposer key={`${scope}:${props.productId}`} {...props} productId={props.productId} />;
}

function InstagramComposer({ productId, onOpenChange, onPublished }: PublishDialogProps & { productId: number }) {
  const [preview, setPreview] = React.useState<PublishPreview | null>(null);
  const [caption, setCaption] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [retry, setRetry] = React.useState(0);
  const submitting = React.useRef(false);
  const mounted = React.useRef(true);
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    fetchPublishPreview(productId).then((draft) => {
      if (!active) return;
      setPreview(draft);
      setCaption(draft.caption);
      setImages([...new Set(draft.images)].slice(0, 10));
    }).catch((error: unknown) => {
      if (active) setLoadError(error instanceof ApiError ? error.message : "E’lon ma’lumotlari yuklanmadi.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId, retry]);
  const submit = async () => {
    if (submitting.current || loading || loadError || !preview?.canPublish || images.length === 0 || caption.length > 2200) return;
    submitting.current = true;
    setSending(true);
    setSubmitError(null);
    try {
      await publishToInstagram({ productId, caption, images });
      if (!mounted.current) return;
      toast.success("Instagram’ga joylandi");
      onPublished();
      onOpenChange(false);
    } catch (error) {
      if (mounted.current) setSubmitError(error instanceof ApiError ? error.message : "Joylanmadi. Qayta urinib ko‘ring.");
    } finally {
      submitting.current = false;
      if (mounted.current) setSending(false);
    }
  };
  return <PublishComposer open onOpenChange={(open) => { if (!submitting.current) onOpenChange(open); }} title="Instagram’ga joylash" description="Matn va rasmlarni tekshiring. Tasdiqlagandan keyin e’lon joylanadi." loading={loading} loadError={loadError} onRetry={() => setRetry((value) => value + 1)} submitting={sending} submitError={submitError} onSubmit={submit} submitDisabled={!preview?.canPublish || images.length === 0 || caption.length > 2200}>
    {preview && <PublishComposerFields title={preview.title} availableImages={[...new Set(preview.images)]} images={images} onToggleImage={(url) => setImages((value) => togglePublishImage(value, url))} caption={caption} onCaptionChange={setCaption} disabled={sending} maxCaption={2200} fixedDestination="instagram" warning={!preview.canPublish ? preview.reason : caption.length > 2200 ? "Instagram uchun matn 2 200 belgidan oshmasligi kerak." : images.length === 0 ? "Kamida bitta rasm tanlang." : null} />}
  </PublishComposer>;
}
