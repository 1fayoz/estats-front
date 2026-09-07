"use client";

import { SocialPostCard } from "@/features/social/components/social-post-card";
import type { SocialPost } from "@/lib/types";

export function PostTile({
  post,
  onLink,
  onUnlink,
}: {
  post: SocialPost;
  onLink: (post: SocialPost) => void;
  onUnlink: (post: SocialPost, productId: number) => void;
}) {
  return (
    <SocialPostCard
      post={post}
      platform={post.platform}
      insightsAvailable={post.insightsAvailable}
      metrics={[
        { key: "reach", label: "Qamrov", value: post.reach, hint: "E’lonni ko‘rgan boshqa-boshqa odamlar soni" },
        { key: "likes", label: "Layk", value: post.likes },
        { key: "comments", label: "Izoh", value: post.comments },
        { key: "shares", label: "Ulashish", value: post.shares },
        { key: "engagement", label: "Faollik", value: post.engagementRate, suffix: "%" },
      ]}
      onLink={() => onLink(post)}
      onUnlink={(productId) => onUnlink(post, productId)}
    />
  );
}
