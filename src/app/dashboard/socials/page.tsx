"use client";

import * as React from "react";
import { SocialWorkspace } from "@/features/social/components/social-workspace";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/stores/user-store";

export default function SocialsPage() {
  const scope = useUserStore((state) => `${state.user?.id}:${state.workspaceId}:${state.activeShopId}`);

  return (
    <React.Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <SocialWorkspace key={scope} />
    </React.Suspense>
  );
}
