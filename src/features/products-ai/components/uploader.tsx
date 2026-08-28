"use client";

import * as React from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, createAiDraft } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

const MAX_FILES = 6;
const MAX_MB = 10;

/**
 * Rasm yuklash — sotuvchi qiladigan YAGONA ish.
 *
 * Shuning uchun bu yerda faqat ikkita maydon bor: rasmlar va
 * ixtiyoriy izoh. Nom, tavsif, xususiyat va narx so'ralmaydi —
 * ularni AI yozadi va sotuvchi keyin tuzatadi.
 */
export function Uploader({ onCreated }: { onCreated: (draft: AiDraft) => void }) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [hint, setHint] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const previews = React.useMemo(
    () => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [files]
  );

  // Ob'ekt URL'lari qo'lda bo'shatiladi — aks holda sahifa ochiq
  // turgan sayin xotira o'sib boradi.
  React.useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const add = (incoming: FileList | null) => {
    if (!incoming) return;
    const picked: File[] = [];
    for (const file of Array.from(incoming)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: faqat rasm fayllari.`);
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`${file.name}: ${MAX_MB} MB dan katta.`);
        continue;
      }
      picked.push(file);
    }
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_FILES));
  };

  const submit = async () => {
    if (!files.length) return;
    setBusy(true);
    try {
      const draft = await createAiDraft(files, hint.trim());
      setFiles([]);
      setHint("");
      onCreated(draft);
      toast.success("Rasm qabul qilindi — AI ishlashni boshladi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuklanmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition",
          dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <ImagePlus className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm font-medium">Tovar rasmlarini tashlang</div>
        <p className="text-xs text-muted-foreground">
          Ko&apos;pi bilan {MAX_FILES} ta, har biri {MAX_MB} MB gacha. Qolganini AI qiladi.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((p, i) => (
            <div key={p.url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.name}
                className="h-20 w-20 rounded-lg border object-cover"
              />
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, k) => k !== i))}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-background p-0.5 shadow ring-1 ring-border"
                aria-label="Olib tashlash"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Ixtiyoriy izoh: o'lcham, komplekt, kim uchun"
          className="sm:flex-1"
        />
        <Button onClick={submit} disabled={busy || !files.length}>
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          Boshlash
        </Button>
      </div>
    </div>
  );
}
