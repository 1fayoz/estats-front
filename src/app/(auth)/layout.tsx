import type { ReactNode } from "react";

import { TelegramEntry } from "@/features/telegram/telegram-entry";

/** Bosh sahifa va kirish — Telegram WebApp shu yerdan ochiladi. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TelegramEntry />
      {children}
    </>
  );
}
