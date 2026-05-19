import { MapPin, Mail, MessageCircle, Phone, Sparkles, PlaySquare } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function LandingFooter() {
  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">{siteConfig.name}</span>
          </div>
          <p className="mt-3 max-w-sm text-xs text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>Toshkent sh., Yashnobod tum., IT Park rezident</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span className="font-mono">+998 71 200-00-00</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span className="font-mono">hello@mystats.uz</span>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Mahsulot
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link href="#features" className="hover:text-primary">Funksiyalar</Link></li>
            <li><Link href="#pricing" className="hover:text-primary">Tariflar</Link></li>
            <li><Link href="/" className="hover:text-primary">Chrome plagin</Link></li>
            <li><Link href="/" className="hover:text-primary">Telegram bot</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Marketlar
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-primary">Uzum Market</Link></li>
            <li><Link href="/" className="hover:text-primary">Kaspi</Link></li>
            <li><Link href="/" className="hover:text-primary">Teez</Link></li>
            <li><Link href="/" className="hover:text-primary">Yandex Market</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Huquqiy
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-primary">Ommaviy oferta</Link></li>
            <li><Link href="/" className="hover:text-primary">Foydalanish shartlari</Link></li>
            <li><Link href="/" className="hover:text-primary">Maxfiylik siyosati</Link></li>
          </ul>
          <div className="mt-4 flex gap-2">
            <a className="flex h-8 w-8 items-center justify-center rounded-md border bg-card text-muted-foreground transition-colors hover:bg-accent">
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
            <a className="flex h-8 w-8 items-center justify-center rounded-md border bg-card text-muted-foreground transition-colors hover:bg-accent">
              <PlaySquare className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {siteConfig.name}. Barcha huquqlar himoyalangan.</span>
          <span>Uzum Market rasmiy hamkori emas.</span>
        </div>
      </div>
    </footer>
  );
}
