import type { Metadata } from "next";
import Link from "next/link";

import { fetchLensReleaseCached, LENS_PRIVACY_PATH } from "@/lib/lens";

/**
 * eStats Lens kengaytmasining OCHIQ sahifasi — Chrome Web Store'dagi
 * "Homepage URL" shu yerga olib keladi.
 *
 * Do'kon qoidasi (User Data Policy, Limited Use): foydalanuvchi ma'lumoti
 * bilan ishlaydigan kengaytma bu haqdagi bayonotni bosh sahifasida yoki bir
 * bosishda ko'rsatishi SHART — shu sababli qisqa bayonot shu yerda, to'liq
 * matn `/lens/privacy` da.
 */

export const metadata: Metadata = {
  title: "eStats Lens — uzum.uz uchun brauzer kengaytmasi",
  description: "uzum.uz sahifalarida bozor tahlili: tovar tushumi, qoldiq, qidiruvdagi o'rin, Uzum tariflari bilan unit iqtisodiyot va rasm bo'yicha qidiruv.",
};

export default async function LensPage() {
  const release = await fetchLensReleaseCached();
  return (
    <>
      <h1>eStats Lens — uzum.uz uchun brauzer kengaytmasi</h1>
      <p>
        Uzum Market sotuvchisi uchun bozor tahlili — to&apos;g&apos;ridan-to&apos;g&apos;ri uzum.uz sahifalarida, eStats hisobingiz bilan.
      </p>
      <p>
        {release?.storeUrl ? (
          <a href={release.storeUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">
            Chrome Web Store&apos;dan o&apos;rnatish →
          </a>
        ) : (
          <>Kengaytma Chrome Web Store tekshiruvida — tez orada o&apos;rnatish mumkin bo&apos;ladi.</>
        )}
      </p>

      <h2>Nima qiladi</h2>
      <ul>
        <li>
          <strong>Kartochkalar ostida</strong>{" "}— tanlangan davrdagi tushum, sotilgan dona, qisqa davr sotuvi, qoldiq, do&apos;kon va sotuvchi.
        </li>
        <li>
          <strong>Turkum va do&apos;kon sahifalarida</strong>{" "}— 3/30/60/90 kunlik hisobot: tushum, sotuvli va sotuvsiz do&apos;konlar va kartochkalar,
          o&apos;rtacha narx, o&apos;sish, Uzum&apos;ning rasmiy komissiya, logistika va saqlash tariflari.
        </li>
        <li>
          <strong>Tovar oynasida</strong>{" "}— SKU bo&apos;yicha sotuv va qoldiq grafiklari, turkum va kalit so&apos;zlardagi o&apos;rin (reklama belgisi bilan),
          Uzum tariflari bo&apos;yicha unit iqtisodiyot va Excel hisobot, narx yoki qoldiq o&apos;zgarsa Telegram xabari.
        </li>
        <li>
          <strong>Rasm bo&apos;yicha qidiruv</strong>{" "}— istalgan rasm yoki ekrandan belgilangan joy bo&apos;yicha: shu suratning o&apos;zini ishlatgan
          e&apos;lonlar (bir xil tovarni kim sotyapti) va o&apos;xshash tovarlar, narx oralig&apos;i va tushumi bilan. Suratlar to&apos;g&apos;ridan-to&apos;g&apos;ri
          solishtiriladi — sun&apos;iy intellektsiz.
        </li>
      </ul>

      <h2>Qanday ulanadi</h2>
      <ul>
        <li>Chrome Web Store&apos;dan o&apos;rnating — eStats&apos;ning ulash sahifasi o&apos;zi ochiladi.</li>
        <li>eStats hisobingizga kiring va «Shu brauzerni ulash» ni tasdiqlang.</li>
        <li>Ulangan brauzerlarni kabinetdagi Integratsiyalar → «Brauzer kengaytmasi» bo&apos;limidan ko&apos;rasiz va istalgan vaqtda uzasiz.</li>
      </ul>

      <h2>Ma&apos;lumotlar va maxfiylik</h2>
      <p>
        Kengaytma faqat uzum.uz sahifalarida va eStats&apos;ning ulash sahifasida ishlaydi. U sahifadagi tovar, turkum va do&apos;kon
        identifikatorlarini eStats serveriga yuboradi va shu tovarlar bo&apos;yicha tahlilni oladi. Uzum parolingiz, sotuvchi kabineti tokeni
        yoki boshqa saytlardagi faoliyatingiz o&apos;qilmaydi va yuborilmaydi.
      </p>
      <p>
        <strong>Limited Use.</strong>{" "}eStats Lens foydalanuvchi ma&apos;lumotidan faqat kengaytmaning yagona vazifasi — uzum.uz&apos;da bozor tahlilini
        ko&apos;rsatish uchun foydalanadi; ma&apos;lumot sotilmaydi, reklama yoki kredit baholash uchun ishlatilmaydi va Chrome Web Store User Data
        Policy, jumladan Limited Use talablariga amal qiladi. The use of information received from eStats Lens adheres to the Chrome Web Store User
        Data Policy, including the Limited Use requirements.
      </p>
      <p>
        To&apos;liq matn (o&apos;zbek, rus, ingliz tillarida):{" "}
        <Link href={LENS_PRIVACY_PATH} className="font-medium text-primary underline underline-offset-2">
          eStats Lens maxfiylik siyosati
        </Link>
      </p>

      <h2>Yordam</h2>
      <p>Savol yoki muammo bo&apos;lsa: turaqulovfayoz4@gmail.com</p>
    </>
  );
}
