"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useUserStore } from "@/stores/user-store";

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Kabinet ma'lumoti tez eskiradi, lekin tab almashganda har safar
        // qayta so'ramaslik uchun qisqa "yangi" oyna.
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // 401/403/404 qaytadan so'ralmaydi — natija o'zgarmaydi.
        retry: (count, error) =>
          count < 2 && !(error && typeof error === "object" && "status" in error &&
            [401, 403, 404].includes((error as { status: number }).status)),
      },
    },
  });
}

/**
 * Kabinet uchun React Query. Chiqishda kesh to'liq tozalanadi — keyingi
 * kirgan odam oldingi hisob ma'lumotini bir lahza ham ko'rmasin.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(makeClient);
  const signedIn = useUserStore((s) => Boolean(s.accessToken));

  React.useEffect(() => {
    if (!signedIn) client.clear();
  }, [client, signedIn]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
