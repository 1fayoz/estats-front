import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foydalanish shartlari — eStats",
  description: "eStats xizmatidan foydalanish shartlari.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Foydalanish shartlari</h1>
      <p>Oxirgi yangilanish: 2026-yil 23-avgust</p>

      <h2>Xizmat</h2>
      <p>
        eStats marketpleyslar (Uzum Market, Yandex Market, Wildberries, Ozon va boshqalar) sotuvchilariga
        tovarlarining tan narxini, sotuvlarini va foydasini hisoblab beradi. Xizmatdan foydalanish uchun
        akkaunt ochish va do&apos;kon API ulanishlarini sozlash kifoya.
      </p>

      <h2>Sizning javobgarligingiz</h2>
      <ul>
        <li>Faqat o&apos;zingizga tegishli do&apos;kon ulanishlarini kiritasiz.</li>
        <li>Kiritgan tan narx va kirim ma&apos;lumotlarining to&apos;g&apos;riligi sizning zimmangizda.</li>
        <li>Akkauntingizga kirish huquqini boshqalarga bermaysiz.</li>
      </ul>

      <h2>Hisob-kitobning aniqligi</h2>
      <p>
        Hisob-kitob siz kiritgan kirimlar va marketpleys API&apos;laridan olingan sotuv
        ma&apos;lumotlariga asoslanadi. Kirim kiritilmagan yoki sotuv tarixi to&apos;liq
        yuklanmagan bo&apos;lsa, natija to&apos;liq bo&apos;lmaydi — bunday holatlar
        interfeysda alohida ogohlantiriladi. Xizmat buxgalteriya yoki soliq hujjati
        o&apos;rnini bosmaydi va moliyaviy maslahat hisoblanmaydi.
      </p>

      <h2>Marketpleyslar bilan bog&apos;liqlik</h2>
      <p>
        eStats marketpleyslarning (Uzum, Yandex, Wildberries, Ozon) rasmiy mahsuloti emas va ular bilan
        hamkorlikda ishlab chiqilmagan mustaqil servisdir. Tashqi marketpleys API&apos;lari o&apos;zgarsa yoki
        ishlamay qolsa, xizmatning ba&apos;zi qismlari vaqtincha ta&apos;sirlanishi mumkin.
      </p>

      <h2>Xizmatni to&apos;xtatish</h2>
      <p>
        Istalgan vaqtda magazinlaringizni o&apos;chirib, xizmatdan foydalanishni
        to&apos;xtatishingiz mumkin.
      </p>

      <h2>Aloqa</h2>
      <p>turaqulovfayoz4@gmail.com</p>
    </>
  );
}
