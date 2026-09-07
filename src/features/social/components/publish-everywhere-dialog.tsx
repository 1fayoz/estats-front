"use client";

import type { SocialAccount, WarehouseProduct } from "@/lib/types";
import { useUserStore } from "@/stores/user-store";
import { ProductBroadcastComposer } from "./product-broadcast-composer";

export function PublishEverywhereDialog({ product, accounts, onOpenChange }: {
  product: WarehouseProduct | null;
  accounts: SocialAccount[];
  onOpenChange: (open: boolean) => void;
}) {
  const scope = useUserStore((state) => `${state.user?.id}:${state.workspaceId}:${state.activeShopId}`);
  if (!product) return null;
  return <ProductBroadcastComposer key={`${scope}:${product.id}`} productId={product.id} product={product} accounts={accounts} onOpenChange={onOpenChange} />;
}
