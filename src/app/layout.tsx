import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { siteConfig } from "@/config/site";
import Script from "next/script";
import { TelegramWebApp } from "@/features/telegram/telegram-webapp";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // `metadataBase` bo'lmasa Next nisbiy OG rasm manzillarini absolyutga
  // aylantira olmaydi va ijtimoiy tarmoqlarda oldindan ko'rish buziladi.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Uzum Market analitika",
    "Uzum sotuvchi",
    "tan narx hisobi",
    "FIFO",
    "foyda va zarar",
    "Uzum komissiya",
    "Instagram reklama",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  // Har sahifa o'z kanonik manzilini oladi; ildizda apex turadi.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    // Ulashilgan havola oldindan ko'rinishi uchun. OG rasmi SHAFFOF
    // EMAS: uni har xizmat o'z foniga qo'yadi va shaffof joy qora
    // bo'lib chiqadi.
    images: [{ url: "/og.png", width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        {/* Telegram WebApp SDK. `beforeInteractive` — `initData`
            React ishga tushishidan OLDIN tayyor bo'lishi kerak,
            aks holda avto-login birinchi renderni o'tkazib
            yuborardi. Telegram tashqarisida skript hech nima
            qilmaydi. */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TelegramWebApp />
          {children}
          <Toaster
            theme="system"
            position="top-right"
            toastOptions={{
              classNames: {
                toast:
                  "group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
