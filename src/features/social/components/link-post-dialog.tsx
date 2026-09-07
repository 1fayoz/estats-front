"use client";

import { ProductLinkPicker } from "@/features/social/components/product-link-picker";
import { linkSocialPost } from "@/lib/api";
import type { SocialPost } from "@/lib/types";

export function LinkPostDialog({
  post,
  onOpenChange,
  onSaved,
}: {
  post: SocialPost | null;
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
      onSave={(productIds) => linkSocialPost(post.id, productIds)}
    />
  );
}
