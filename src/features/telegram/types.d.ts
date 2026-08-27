/**
 * Telegram WebApp SDK — bizga kerakli qismi.
 *
 * To'liq tipni olib kelish uchun alohida paket bor, lekin unda
 * yuzdan ortiq maydon bor va bizga uchtasi kerak. Kerakligini
 * yozib qo'yish kam kod va aniqroq hujjat.
 */
interface TelegramWebApp {
  /** Imzolangan satr. Telegram tashqarisida bo'sh bo'ladi. */
  initData: string;
  ready?: () => void;
  expand?: () => void;
  colorScheme?: "light" | "dark";
}

interface Window {
  Telegram?: { WebApp?: TelegramWebApp };
}
