import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Kirish",
  description: `${siteConfig.name} kabinetiga kirish.`,
  // Kirish sahifasining qidiruvda turishi keraksiz: uning ustida
  // hech qanday so'rov yo'q va u landingdan indeks o'g'irlaydi.
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-info/15 blur-[120px]" />
      </div>

      <header className="px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Bosh sahifa
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <LogoMark size={48} priority className="h-12 w-12" />
            <h1 className="mt-4 text-2xl font-bold tracking-tight">{siteConfig.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{siteConfig.tagline}</p>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
