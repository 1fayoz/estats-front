import React from "react";
import { siteConfig } from "@/config/site";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: ["eStats Analytics", "eStats Uzum", "eStats Marketplace ERP"],
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
    description:
      "O‘zbekiston va Markaziy Osiyo marketpleyslari (Uzum Market, Yandex Market, Wildberries, Ozon) sotuvchilari uchun yagona avtomatlashtirilgan analitika, ombor hisobi (FIFO), sof foyda va marketing platformasi.",
    sameAs: [
      siteConfig.botUrl,
      "https://t.me/estatsuz_bot",
      "https://instagram.com/estats_uz",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: siteConfig.botUrl,
      availableLanguage: ["Uzbek", "Russian"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "eStats",
    operatingSystem: "Web Browser, Windows, macOS, Android, iOS, Chrome Extension",
    applicationCategory: "BusinessApplication, FinanceApplication",
    description:
      "Uzum Market, Yandex Market, Wildberries va Ozon uchun professional sotuvchi analitikasi, ombor hisobi, FIFO tan narx nazorati, AI SEO va ijtimoiy tarmoqlar avtoposting dasturi.",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "UZS",
        name: "Demo tarif (Bepul)",
        description: "Bozor tahlili va mahsulot qidiruvi uchun bepul sinov davri",
      },
      {
        "@type": "Offer",
        price: "1290000",
        priceCurrency: "UZS",
        name: "Starter 1 oylik",
        description: "Barcha marketpleyslar analitikasi, ombor, FIFO tan narxi va AI kartochkalar",
      },
      {
        "@type": "Offer",
        price: "900000",
        priceCurrency: "UZS",
        name: "Yarim yillik (6 oy)",
        description: "Chegirma bilan to'liq biznes avtomatlashtirish to'plami",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1420",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Ko'p bozorli analitika: Uzum Market, Yandex Market, Wildberries, Ozon",
      "Haqiqiy tan narx va FIFO usulida partiyaviy foyda/zarar (PnL) hisobi",
      "Ombor qoldiqlari, partiyalar, SKU va zaxira ogohlantirishlari",
      "Bozor tahlili: nishalar, toifalar o'sishi, top sotuvchilar va mahsulotlar",
      "AI SEO: O'zbek va rus tillarida yuqori reytingli kartochkalar yaratish",
      "Marketing: Reklama tahlili (Boost TOP, DRR) va Telegram/Instagram avtoposting",
      "ZoomSelling, MPStats, HunterSales ga to'liq va arzonroq muqobil",
      "Brauzer kengaytmasi (eStats Lens) va Telegram monitoring boti",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqSchema({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
