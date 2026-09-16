import { redirect } from "next/navigation";

/*
  Eski manzil. Do'kon sahifasi endi ZoomSelling tuzilishida —
  «Do'kon tahlili» (`/market/shop?shop_id=`).
*/
export default async function LegacyShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/market/shop?shop_id=${encodeURIComponent(id)}`);
}
