"use client";

import * as React from "react";
import Link from "next/link";

import { ReportPage, styles } from "@/features/report/ui";

/*
  «Video-yuriqnomalar» — ZoomSelling'dagi sahifa tuzilishi bilan bir xil
  (markazda beshta tugma). Ularning videolari ZoomSelling brendi bilan
  yozilgan reklama roliklari, shuning uchun havolalar ko'chirilmadi:
  har tugma shu mavzudagi eStats bo'limiga va qisqa yo'riqnomaga olib boradi.
*/

const GUIDES = [
  { href: "/market/categories", title: "▶️ #1 Kategoriyalar va raqobatchilar tahlili",
    text: "Toifani tanlang: treemap qaysi qatlam katta pul aylantirishini, o'ngdagi jadval kim olib borishini ko'rsatadi." },
  { href: "/market/niches", title: "▶️ #2 Uzumda qaysi qatlamlarni (sohalarni) tanlash kerak?",
    text: "«Defitsit» ustunida ko'k fon — oborot 30 kundan past: talab bor, tovar tez tugaydi." },
  { href: "/market/card", title: "▶️ #3 Uzumdagi mahsulot kartochkasi",
    text: "prod_id kiriting: SKU bo'yicha sotuv, narx, qoldiq va qidiruvdagi o'rinlar kunma-kun." },
  { href: "/market/dynamics", title: "▶️ #4 Uzum bo'yicha kategoriyalar dinamikasi",
    text: "Turkumning kunlik tushumi va median narxi 2024-yildan beri — mavsumiylikni shu yerda ko'rasiz." },
  { href: "/market/prices", title: "▶️ #5 Uzumda narx asosida tahlil",
    text: "Narx qadamini tanlang: qaysi narx oralig'ida tushum ko'p-u, do'kon kam." },
];

export default function VideosPage() {
  return (
    <ReportPage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: "70px 0 90px" }}>
        {GUIDES.map((g) => (
          <Link key={g.href} href={g.href} className={styles.button} title={g.text}
                style={{ width: 600, flexDirection: "column", padding: "8px 16px", color: "#1a4f9c" }}>
            <span>{g.title}</span>
            <span style={{ fontSize: 11, color: "#37474f", fontFamily: "Roboto, sans-serif" }}>{g.text}</span>
          </Link>
        ))}
      </div>
    </ReportPage>
  );
}
