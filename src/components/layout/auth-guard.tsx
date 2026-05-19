"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const username = useUserStore((s) => s.username);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!username) {
      router.replace("/");
    } else {
      setReady(true);
    }
  }, [username, router]);

  if (!ready) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Tayyorlanmoqda...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
