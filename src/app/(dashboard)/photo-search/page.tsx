"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Search, Sparkles, Upload, X, Star, Link as LinkIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/dashboard/page-header";
import { getPhotoSearchResults } from "@/data/photo-search";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";

const DEMO_IMAGES = [
  "https://picsum.photos/seed/photo-search-1/400/400",
  "https://picsum.photos/seed/photo-search-2/400/400",
  "https://picsum.photos/seed/photo-search-3/400/400",
];

export default function PhotoSearchPage() {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [results, setResults] = React.useState<ReturnType<typeof getPhotoSearchResults>>([]);

  const runSearch = React.useCallback((img: string) => {
    setSelected(img);
    setSearching(true);
    setResults([]);
    setTimeout(() => {
      setResults(getPhotoSearchResults());
      setSearching(false);
    }, 1100);
  }, []);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    runSearch(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rasm bo'yicha qidiruv"
        description="1688, WildBerries yoki istalgan boshqa saytdan mahsulot rasmini yuklang — Uzumda o'xshashlarini topib bering."
        badge={<Badge variant="default" className="gap-1"><Sparkles className="h-3 w-3" /> AI</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4" /> Rasm yuklash
            </CardTitle>
            <CardDescription>Drag & drop yoki URL kiriting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5">
              {selected ? (
                <>
                  <Image src={selected} alt="Tanlandi" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelected(null);
                      setResults([]);
                    }}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Rasm tanlang yoki tashlang</div>
                    <div className="text-xs text-muted-foreground">PNG, JPG · max 10 MB</div>
                  </div>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">URL orqali</div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="https://1688.com/product/..." className="pl-9" />
                </div>
                <Button size="default" disabled={searching}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="text-xs font-medium text-muted-foreground">Yoki demo bilan sinab ko'ring</div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_IMAGES.map((img) => (
                  <button
                    key={img}
                    onClick={() => runSearch(img)}
                    className="relative aspect-square overflow-hidden rounded-lg border transition-all hover:border-primary hover:shadow-md"
                  >
                    <Image src={img} alt="Demo" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">Demo limit:</strong> 10 ta qidiruv bepul ·{" "}
              <span className="font-medium text-primary">7 ta qoldi</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:min-h-[600px]">
          <CardHeader>
            <CardTitle>O'xshash mahsulotlar</CardTitle>
            <CardDescription>
              {searching
                ? "Qidirilmoqda..."
                : results.length > 0
                ? `${results.length} ta mos mahsulot topildi · o'xshashlik bo'yicha tartiblangan`
                : "Rasm tanlang va Uzum bozoridan o'xshashlarini toping"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searching ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse rounded-lg bg-gradient-to-br from-muted via-muted/60 to-muted bg-[length:200%_100%]"
                    style={{ animation: "shimmer 1.6s linear infinite", animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="group overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={r.image}
                        alt={r.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1280px) 200px, 300px"
                        unoptimized
                      />
                      <div
                        className={cn(
                          "absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-xs font-semibold backdrop-blur",
                          r.similarity > 0.9
                            ? "bg-emerald-500/90 text-white"
                            : r.similarity > 0.85
                            ? "bg-amber-500/90 text-white"
                            : "bg-background/80 text-foreground"
                        )}
                      >
                        {Math.round(r.similarity * 100)}% mos
                      </div>
                    </div>
                    <div className="space-y-1.5 p-3">
                      <div className="line-clamp-2 text-xs font-medium leading-tight">{r.title}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{r.store}</span>
                        <span className="flex items-center gap-0.5 text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {formatNumber(r.sales30d)}
                        </span>
                      </div>
                      <div className="border-t pt-1.5 text-sm font-bold tabular-nums text-primary">
                        {formatSum(r.price)}
                      </div>
                      <Progress value={r.similarity * 100} className="h-1" indicatorClassName="bg-gradient-to-r from-primary to-info" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[480px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Search className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-base font-semibold">Rasm bilan qidirishni boshlang</div>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    Reverse image search Uzum kataloglarini skanerlab, mahsulotni 10 soniyada topadi.
                    Raqobatchi narxni, kim sotayotganini va sotuv hajmini bilib oling.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
