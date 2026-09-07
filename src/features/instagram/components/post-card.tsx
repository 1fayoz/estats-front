"use client";

import { SocialPostCard } from "@/features/social/components/social-post-card";
import type { InstagramPost } from "@/lib/types";

export function PostCard({
  post,
  onLink,
  onUnlink,
  onAdvertise,
  canAdvertise,
}: {
  post: InstagramPost;
  onLink: (post: InstagramPost) => void;
  onUnlink: (post: InstagramPost, productId: number) => void;
  onAdvertise: (post: InstagramPost) => void;
  canAdvertise: boolean;
}) {
  return (
    <SocialPostCard
      post={post}
      platform="instagram"
      hasAd={post.hasAd}
      metrics={[
        { key: "reach", label: "Qamrov", value: post.reach, hint: "E’lonni ko‘rgan boshqa-boshqa odamlar soni" },
        { key: "likes", label: "Layk", value: post.likes },
        { key: "comments", label: "Izoh", value: post.comments },
        { key: "shares", label: "Ulashish", value: post.shares },
        { key: "saved", label: "Saqlash", value: post.saved },
        { key: "engagement", label: "Faollik", value: post.engagementRate, suffix: "%" },
        { key: "views", label: "Ko‘rishlar", value: post.views },
        { key: "interactions", label: "Harakatlar", value: post.totalInteractions },
        { key: "visits", label: "Profilga kirish", value: post.profileVisits },
      ]}
      onLink={() => onLink(post)}
      onUnlink={(productId) => onUnlink(post, productId)}
      onAdvertise={() => onAdvertise(post)}
      canAdvertise={canAdvertise}
    />
  );
}
