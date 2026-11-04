"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { useUserStore } from "@/stores/user-store";

/**
 * `useQuery` + kabinet konteksti: kalitga hisob va do'kon qo'shiladi (bir
 * do'kon javobi boshqasiga aralashmasin), sessiya bo'lmasa so'rov ketmaydi.
 *
 * Yangi kabinet sahifalari ma'lumotni shu orqali olsin — qo'lda
 * `useEffect` + `useState` o'rniga. Eskilari bosqichma-bosqich ko'chiriladi.
 */
export function useApiQuery<T>(
  key: QueryKey,
  queryFn: () => Promise<T>,
  options: Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> = {}
) {
  const workspaceId = useUserStore((s) => s.workspaceId);
  const activeShopId = useUserStore((s) => s.activeShopId);
  const signedIn = useUserStore((s) => Boolean(s.accessToken));

  return useQuery<T>({
    ...options,
    queryKey: [workspaceId, activeShopId, ...key],
    queryFn,
    enabled: signedIn && (options.enabled ?? true),
  });
}
