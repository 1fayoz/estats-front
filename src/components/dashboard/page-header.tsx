import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}

// Sarlavha va izoh ATAYLAB ko'rsatilmaydi: sahifaning nomi yon
// menyuda (faol band) allaqachon ko'rinib turadi — bu yerda yana
// bir marta, ko'pincha BOSHQA so'z bilan ("Tovarlar" menyuda,
// "Ombor" shu yerda) takrorlash faqat chalkashtiradi. Faqat shu
// sahifaga tegishli amallar (tugmalar) va nishon qoladi; ikkalasi
// ham yo'q bo'lsa but'un blok chiqarilmaydi — bo'sh joy qolmasin.
export function PageHeader({ actions, badge }: PageHeaderProps) {
  if (!actions && !badge) return null;
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      {badge}
      {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
