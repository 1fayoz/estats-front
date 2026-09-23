import { LoaderCircle } from "lucide-react";

function MetricSkeleton() {
  return (
    <div className="min-h-24 animate-pulse rounded-2xl border bg-card p-4 shadow-sm">
      <div className="h-2.5 w-20 rounded-full bg-muted" />
      <div className="mt-4 h-7 w-28 rounded-lg bg-muted" />
      <div className="mt-3 h-2 w-16 rounded-full bg-muted/70" />
    </div>
  );
}

export default function MarketLoading() {
  return (
    <div className="overflow-hidden rounded-[20px] border bg-[#f8f8fd] shadow-sm" role="status" aria-label="Bozor ma’lumotlari yuklanmoqda">
      <div className="flex min-h-20 items-center justify-between border-b bg-white/80 px-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          </span>
          <div>
            <div className="font-semibold text-foreground">Bozor tahlili</div>
            <div className="mt-1 text-xs text-muted-foreground">Ma’lumotlar tayyorlanmoqda…</div>
          </div>
        </div>
        <div className="hidden h-9 w-28 animate-pulse rounded-xl bg-muted sm:block" />
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => <MetricSkeleton key={index} />)}
      </div>
      <div className="grid gap-3 px-4 pb-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-2xl border bg-card p-4 shadow-sm">
            <div className="h-3 w-36 rounded-full bg-muted" />
            <div className="mt-8 h-40 rounded-xl bg-muted/70" />
          </div>
        ))}
      </div>
      <span className="sr-only">Iltimos, kuting.</span>
    </div>
  );
}
