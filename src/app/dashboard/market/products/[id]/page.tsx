import { redirect } from "next/navigation";

/*
  Eski manzil. Kartochka sahifasi endi tashqi xizmat tuzilishida —
  «Maxsulot kartochkasi» (`/dashboard/market/card?id=`). Tashqi havolalar va
  xatcho'plar buzilmasin deb yo'naltiriladi.
*/
export default async function LegacyProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/market/card?id=${encodeURIComponent(id)}`);
}
