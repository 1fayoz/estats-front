"use client";

import { ProductLinkPicker } from "@/features/social/components/product-link-picker";
import { linkPostToProducts } from "@/lib/api";
import type { InstagramPost } from "@/lib/types";

export function LinkDialog({
  post,
  onOpenChange,
  onSaved,
}: {
  post: InstagramPost | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  if (!post) return null;

  return (
    <ProductLinkPicker
      key={post.id}
      caption={post.caption}
      linkedProducts={post.products}
      onOpenChange={onOpenChange}
      onSaved={onSaved}
      onSave={(productIds) => linkPostToProducts(post.id, productIds)}
    />
  );
}
