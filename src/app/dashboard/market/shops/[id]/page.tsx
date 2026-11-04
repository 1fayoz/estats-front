import { redirect } from "next/navigation";

/*
  Eski manzil. Do'kon sahifasi endi tashqi xizmat tuzilishida —
  «Do'kon tahlili» (`/dashboard/market/shop?shop_id=`).
*/
export default async function LegacyShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/market/shop?shop_id=${encodeURIComponent(id)}`);
}
