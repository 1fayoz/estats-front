"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ExternalLink, ImageOff, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title, uzumUrl }: {
  images: string[]; title: string; uzumUrl: string | null;
}) {
  const [active, setActive] = React.useState(0);
  const [expanded, setExpanded] = React.useState(false);
  const [failedSource, setFailedSource] = React.useState<string | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const signature = images.join("|");
  React.useEffect(() => { setActive(0); setFailedSource(null); }, [signature]);
  const current = images[active];
  const available = Boolean(current && current !== failedSource);

  return (
    <div className="grid min-w-0 grid-cols-2 items-start gap-3 lg:block lg:space-y-3">
      <button ref={triggerRef} type="button" className="group relative row-span-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default" onClick={() => setExpanded(true)} disabled={!available} aria-label="Tovar rasmini kattalashtirish">
        {available
          ? <img src={current} alt={title} onError={() => setFailedSource(current)} className="h-full w-full object-contain" decoding="async" />
          : <span className="flex flex-col items-center gap-2 px-4 text-center text-muted-foreground"><ImageOff className="size-9" /><span className="text-xs">{current ? "Rasm yuklanmadi" : "Rasm hali qo‘shilmagan"}</span></span>}
        {available && <><span className="absolute bottom-3 left-3 rounded-lg border bg-background/90 px-2 py-1 text-[11px] text-foreground">{active + 1} / {images.length}</span><span className="absolute bottom-3 right-3 rounded-xl border bg-background/90 p-2.5 text-foreground transition-colors group-hover:bg-background"><ZoomIn className="size-4" /></span></>}
      </button>
      {images.length > 1 && <div className="flex min-w-0 gap-2 overflow-x-auto p-1" role="group" aria-label="Tovar rasmlari">
        {images.map((source, index) => <button key={source + index} type="button" onClick={() => setActive(index)} aria-label={`Rasm ${index + 1}`} aria-pressed={active === index} className={cn("size-14 shrink-0 overflow-hidden rounded-xl border bg-muted/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active === index ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40")}><img src={source} alt="" className="h-full w-full object-contain" loading="lazy" /></button>)}
      </div>}
      {uzumUrl && <Button asChild variant="outline" className="min-h-11 w-full rounded-xl px-2"><a href={uzumUrl} target="_blank" rel="noopener noreferrer" aria-label="Uzum’da ochish"><ExternalLink /><span>Uzum’da<span className="hidden lg:inline"> ochish</span></span></a></Button>}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }} className="max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl p-4 sm:p-6 [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center">
          <DialogHeader className="pr-10"><DialogTitle className="line-clamp-2 text-base leading-snug">{title}</DialogTitle><DialogDescription>Rasm {active + 1} / {images.length}</DialogDescription></DialogHeader>
          <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-xl bg-muted/20">
            {available ? <img src={current} alt={title} className="max-h-[60dvh] w-full object-contain" onError={() => setFailedSource(current)} /> : <ImageOff className="size-9 text-muted-foreground" />}
          </div>
          {images.length > 1 && <div className="flex items-center justify-between gap-3">
            <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => setActive((value) => (value - 1 + images.length) % images.length)}><ChevronLeft /> Oldingi</Button>
            <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => setActive((value) => (value + 1) % images.length)}>Keyingi <ChevronRight /></Button>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
