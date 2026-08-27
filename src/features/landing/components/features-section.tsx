import {
  Award,
  BarChart3,
  FolderTree,
  ScanSearch,
  Package,
  PackageX,
  RadioTower,
  Rocket,
  Search,
  Star,
  Store,
  Wallet,
} from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Bozor sharhi",
    desc: "Daromad, sotuvlar va o'sish dinamikasi bir joyda — 30/60 kunlik kesimda",
    color: "from-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    icon: FolderTree,
    title: "Kategoriya va nisha tahlili",
    desc: "Bozor sig'imi, talab darajasi, narx segmentlari va aylanma kunlari",
    color: "from-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    icon: Package,
    title: "Mahsulot va SKU",
    desc: "Sotuv tezligi, qoldiq, reyting va yo'qotilgan daromad bo'yicha to'liq tahlil",
    color: "from-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Store,
    title: "Sotuvchilar va yuridik shaxs",
    desc: "Do'kon kartochkasi, INN, bozor ulushi, 30/60 kunlik sotuv tarixi",
    color: "from-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Award,
    title: "Brendlar reytingi",
    desc: "Top brendlar, ularning bozor ulushi va o'sish ko'rsatkichlari",
    color: "from-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    icon: Search,
    title: "SEO kalit so'zlar",
    desc: "Qidiruv so'rovlari, sizning pozitsiyangiz va raqobat darajasi",
    color: "from-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  {
    icon: Rocket,
    title: "Boost TOP boshqaruvi",
    desc: "Reklama kampaniyalari, DRR hisoblash va minus so'zlar boshqaruvi",
    color: "from-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  {
    icon: ScanSearch,
    title: "Rasm bo'yicha qidiruv",
    desc: "1688, WB va boshqa saytlardan rasmni Uzumda 10 soniyada toping",
    color: "from-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: PackageX,
    title: "Yo'qolgan mahsulotlar",
    desc: "Omborga kelmagan SKU lar va kompensatsiya hisoboti",
    color: "from-red-500/15 text-red-600 dark:text-red-400",
  },
  {
    icon: RadioTower,
    title: "Avto monitoring",
    desc: "Har 4 soatda narx, qoldiq, kontent va pozitsiya o'zgarishlari",
    color: "from-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Star,
    title: "Sharhlar va reyting",
    desc: "Sentiment tahlili, reyting taqsimoti va sharhlarga javob",
    color: "from-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  },
  {
    icon: Wallet,
    title: "Komissiya va foyda",
    desc: "Uzum komissiyasi, reklama, QQS va sof foyda kalkulyatori",
    color: "from-teal-500/15 text-teal-600 dark:text-teal-400",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          Hammasi bitta dashboardda
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Sellerlar uchun <span className="gradient-text">12 ta vosita</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Bozor tahlilidan tortib reklama optimizatsiyasigacha — bir oyda sotuvlaringizni 2-3 barobar
          oshirish uchun zarur bo'lgan barcha narsa.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-xl border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
          >
            <div
              className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br to-card ${f.color}`}
            >
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
