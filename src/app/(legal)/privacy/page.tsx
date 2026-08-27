import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati — eStats",
  description: "eStats qanday ma'lumot yig'adi, nima uchun va qanday saqlaydi.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Maxfiylik siyosati</h1>
      <p>Oxirgi yangilanish: 2026-yil 23-avgust</p>

      <p>
        eStats — Uzum Market sotuvchilari uchun tan narx va foyda hisobi xizmati.
        Quyida qanday ma&apos;lumot olishimiz, nima uchun va qanday saqlashimiz
        tushuntirilgan.
      </p>

      <h2>Biz oladigan ma&apos;lumotlar</h2>
      <ul>
        <li>
          <strong>Google akkaunt ma&apos;lumoti:</strong> email, ism va profil rasmi.
          Bular faqat sizni tanib olish uchun ishlatiladi. Parolingizni biz ko&apos;rmaymiz
          va saqlamaymiz.
        </li>
        <li>
          <strong>Uzum Seller API tokeni:</strong> siz kiritgan token serverda saqlanadi
          va faqat sizning do&apos;koningiz ma&apos;lumotini (tovarlar, sotuvlar, moliya)
          Uzum&apos;dan olish uchun ishlatiladi. Token brauzerga qaytarilmaydi.
        </li>
        <li>
          <strong>Do&apos;kon ma&apos;lumoti:</strong> Uzum&apos;dan olingan tovarlar,
          sotuvlar, komissiya va yetkazib berish summalari.
        </li>
        <li>
          <strong>Siz kiritgan ma&apos;lumot:</strong> kirim partiyalari — tan narx,
          miqdor, yetkazib beruvchi.
        </li>
      </ul>

      <h2>Nima uchun</h2>
      <p>
        Faqat xizmatning o&apos;zi uchun: FIFO bo&apos;yicha tan narxni hisoblash, foyda
        va zararni ko&apos;rsatish, beziyon nuqtani topish. Boshqa maqsadda ishlatilmaydi.
      </p>

      <h2>Kim ko&apos;radi</h2>
      <p>
        Faqat siz. Har bir magazin ma&apos;lumoti alohida ajratilgan: boshqa
        foydalanuvchi sizning tovarlaringizni ham, tan narxlaringizni ham ko&apos;ra
        olmaydi. Ma&apos;lumotingizni uchinchi shaxslarga sotmaymiz va bermaymiz.
      </p>

      <h2>Saqlash va xavfsizlik</h2>
      <ul>
        <li>Barcha aloqa HTTPS orqali shifrlangan.</li>
        <li>Ma&apos;lumot Germaniyadagi serverda saqlanadi, kunlik zaxira olinadi.</li>
        <li>Uzum tokeni faqat serverda; brauzerda sessiya kalitidan boshqa narsa yo&apos;q.</li>
      </ul>

      <h2>O&apos;chirish</h2>
      <p>
        Sozlamalar sahifasidan magazinni o&apos;chirsangiz, uning butun ma&apos;lumoti
        (tovarlar, kirimlar, sotuvlar) ham o&apos;chadi. Hisobingizni butunlay
        o&apos;chirishni istasangiz, quyidagi manzilga yozing.
      </p>

      <h2>Aloqa</h2>
      <p>turaqulovfayoz4@gmail.com</p>
    </>
  );
}
