import { Loading } from "@/features/market/shared";

export default function MarketLoading() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="w-full max-w-sm">
        <Loading label="Bozor ma’lumotlari tayyorlanmoqda…" />
      </div>
    </div>
  );
}
