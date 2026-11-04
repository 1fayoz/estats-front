import type { ReactNode } from "react";

import { AuthSessionProvider } from "@/components/layout/auth-session-provider";
import { TelegramEntry } from "@/features/telegram/telegram-entry";

/** Kirish sahifalari — Telegram WebApp avto-logini shu yerda ham ishlaydi. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthSessionProvider>
      <TelegramEntry />
      {children}
    </AuthSessionProvider>
  );
}
