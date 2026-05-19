# MyStats — Frontend

Marketplace analitikasi uchun dashboard: kategoriyalar, raqobatchilar, kalit so'zlar, mahsulotlar, sharhlar, moliyaviy ko'rsatkichlar va trend tahlili.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives)
- **Zustand** — state management
- **Recharts** — grafiklar
- **Framer Motion** — animatsiyalar
- **next-themes** — light/dark mode
- **Sonner** — notifications

## Talablar

- Node.js 20+
- npm (yoki yarn / pnpm / bun)

## O'rnatish

```bash
npm install
```

## Ishga tushirish

Dev server:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) — brauzerda ochiladi.

Production build:

```bash
npm run build
npm start
```

## Loyiha tuzilishi

```
src/
├── app/                # Next.js App Router
│   ├── (auth)/         # auth route guruhi
│   └── (dashboard)/    # dashboard route guruhi
├── components/
│   ├── charts/         # grafik komponentlar
│   ├── dashboard/      # dashboard-ga oid UI
│   ├── layout/         # layout (sidebar, header, ...)
│   └── ui/             # shadcn/ui komponentlar
├── features/           # domain feature'lari (auth, products, reviews, ...)
├── config/             # konfiguratsiya
├── data/               # mock / static data
├── hooks/              # custom React hooks
├── lib/                # utility funksiyalar
├── stores/             # zustand store'lar
└── types/              # umumiy TypeScript turlari
```

## Environment

`.env.example`'ni `.env.local`'ga ko'chiring va kerakli qiymatlarni kiriting:

```bash
cp .env.example .env.local
```

## Eslatma

Bu loyiha Next.js'ning **yangi versiyasidan** foydalanadi — ba'zi API'lar va konvensiyalar eski hujjatlardan farq qilishi mumkin. Kod yozishdan oldin `node_modules/next/dist/docs/`'dagi tegishli yo'riqnomani o'qing.
