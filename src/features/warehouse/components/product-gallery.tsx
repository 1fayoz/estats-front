"use client";

import * as React from "react";
import { ExternalLink, ImageOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The product's own photos, plus a way out to its Uzum page.
 *
 * The gallery comes from the public catalog and is cached server-side, so it keeps
 * rendering long after the short-lived token that fetched it has expired.
 */
export function ProductGallery({
  images,
  title,
  uzumUrl,
}: {
  images: string[];
  title: string;
  uzumUrl: string | null;
}) {
  const [active, setActive] = React.useState(0);
  // Yangi tovarga o'tilganda birinchi rasmga qaytamiz.
  React.useEffect(() => setActive(0), [images]);

  const current = images[active];

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl border bg-muted sm:w-64">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs">Rasm yo&apos;q</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {images.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {images.map((src, index) => (
              <button
                key={src}
                onClick={() => setActive(index)}
                aria-label={`Rasm ${index + 1}`}
                className={cn(
                  "h-16 w-16 overflow-hidden rounded-lg border transition-all",
                  index === active
                    ? "border-primary ring-2 ring-primary/30"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {uzumUrl && (
          <Button variant="outline" size="sm" className="w-fit" asChild>
            <a href={uzumUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" /> Uzum&apos;da ochish
            </a>
          </Button>
        )}

        {images.length <= 1 && (
          <p className="text-xs text-muted-foreground">
            To&apos;liq galereya Uzum katalogidan olinadi. Sozlamalarda bozor tokeni
            faol bo&apos;lsa, qolgan rasmlar ham shu yerda paydo bo&apos;ladi.
          </p>
        )}
      </div>
    </div>
  );
}
