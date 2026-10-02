"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { DraftWorkspace } from "@/features/products-ai/workspace/workspace";
import { useUserStore } from "@/stores/user-store";

/**
 * `/warehouse/ai/new` — yangi tovar; `/warehouse/ai/12` — mavjud qoralama.
 *
 * Statik `ai` segmenti `/warehouse/[id]` dan ustun turadi — `[id]` sahifasi
 * `Number(params.id)` qiladi va "ai" unga tushmaydi. `useSearchParams`
 * (tab) Suspense chegarasini talab qiladi — shuning uchun o'ram.
 */
export default function DraftPage() {
  const params = useParams<{ draft: string }>();
  const raw = params.draft;
  const draftId = raw === "new" ? null : Number(raw);
  // Do'kon yoki ish maydoni almashsa sahifa noldan — eski qoralama ko'rinmasin.
  const activeShopId = useUserStore((state) => state.activeShopId);
  const workspaceId = useUserStore((state) => state.workspaceId);
  const key = `${workspaceId}:${activeShopId}:${raw}`;

  if (raw !== "new" && (!Number.isInteger(draftId) || (draftId as number) <= 0)) {
    return <p className="p-6 text-sm text-destructive">Bunday qoralama yo&apos;q.</p>;
  }

  return (
    <React.Suspense fallback={<PageSkeleton />}>
      <DraftWorkspace key={key} draftId={draftId} />
    </React.Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_312px]">
        <Skeleton className="h-[480px] w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
