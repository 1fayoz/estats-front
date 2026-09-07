"use client";

import { useUserStore } from "@/stores/user-store";
import { ProductBroadcastComposer } from "./product-broadcast-composer";

export function BroadcastDialog({ productId, onOpenChange, onPublished }: {
  productId: number | null;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
}) {
  const scope = useUserStore((state) => `${state.user?.id}:${state.workspaceId}:${state.activeShopId}`);
  if (productId === null) return null;
  return <ProductBroadcastComposer key={`${scope}:${productId}`} productId={productId} onOpenChange={onOpenChange} onPublished={onPublished} />;
}
