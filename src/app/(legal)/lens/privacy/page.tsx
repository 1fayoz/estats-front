import type { Metadata } from "next";

/**
 * eStats Lens kengaytmasining maxfiylik siyosati — Chrome Web Store'dagi
 * "Privacy policy URL" shu sahifa.
 *
 * Uch tilda: do'kon tekshiruvchisi inglizcha o'qiydi, sotuvchilar o'zbek va rus.
 * Matn KOD bilan bir xil bo'lishi shart — kengaytma yangi ma'lumot yubora
 * boshlasa (yangi so'rov, yangi ruxsat), shu sahifa ham, do'kondagi "Privacy
 * practices" javoblari ham yangilanadi (`estats-lens-extension/store/LISTING.md`).
 */

export const metadata: Metadata = {
  title: "eStats Lens — maxfiylik siyosati",
  description: "eStats Lens brauzer kengaytmasi qanday ma'lumot bilan ishlaydi, nima uchun va qancha saqlanadi.",
};

const UPDATED = { uz: "2026-yil 17-sentabr", ru: "17 сентября 2026 г.", en: "September 17, 2026" };
const CONTACT = "turaqulovfayoz4@gmail.com";

export default function LensPrivacyPage() {
  return (
    <>
      <h1>eStats Lens — maxfiylik siyosati</h1>
      <p>
        <a href="#uz">O&apos;zbekcha</a> · <a href="#ru">Русский</a> · <a href="#en">English</a>
      </p>

      {/* ── O'zbekcha ───────────────────────────────────────────── */}
      <section id="uz" className="space-y-5">
        <h2>O&apos;zbekcha</h2>
        <p>Oxirgi yangilanish: {UPDATED.uz}</p>
        <p>
          eStats Lens — eStats (estats.uz) xizmatining brauzer kengaytmasi. U uzum.uz sahifalarida Uzum Market bozor tahlilini ko&apos;rsatadi.
          Kengaytmaning yagona vazifasi shu va quyidagi ma&apos;lumot faqat shu vazifa uchun ishlatiladi.
        </p>

        <h2>Kengaytma nima bilan ishlaydi</h2>
        <ul>
          <li>
            <strong>Ulanish tokeni.</strong>{" "}estats.uz&apos;da «Shu brauzerni ulash» ni tasdiqlaganingizda eStats shu brauzer uchun token beradi. U
            brauzerning kengaytma xotirasida saqlanadi va faqat api.estats.uz&apos;ga so&apos;rovlarda yuboriladi. Serverda tokenning o&apos;zi emas,
            xeshi, brauzer nomi, kengaytma versiyasi, user-agent, ulangan va oxirgi faol vaqti saqlanadi.
          </li>
          <li>
            <strong>uzum.uz sahifasidagi identifikatorlar.</strong>{" "}Ochilgan sahifadagi tovar kartochkalarining ID raqamlari, turkum ID&apos;si yoki
            do&apos;kon nomi (manzildan) va tovar sahifasining ID&apos;si eStats serveriga yuboriladi — javobda shu tovarlar bo&apos;yicha statistika
            keladi. Sahifaning to&apos;liq matni, siz yozgan qidiruv so&apos;rovlari, Uzum hisobingiz, cookie&apos;lar va boshqa saytlardagi faoliyat
            o&apos;qilmaydi va yuborilmaydi.
          </li>
          <li>
            <strong>Siz kiritgan hisob-kitob.</strong>{" "}Unit iqtisodiyot kalkulyatoriga kiritilgan qiymatlar (tannarx, qadoq hajmi, marja va h.k.)
            hisobingizga bog&apos;lab serverda saqlanadi — keyingi safar o&apos;sha tovarda qayta kiritmaslik uchun. Kuzatuvdagi tovarlar ro&apos;yxati
            ham serverda; narx yoki qoldiq o&apos;zgarsa xabar hisobingizga ulangan Telegram chatiga yuboriladi.
          </li>
          <li>
            <strong>Rasm bo&apos;yicha qidiruv.</strong>{" "}Faqat siz tanlaganda: rasm havolasi yoki ekranning siz belgilagan qismi (1280 px gacha
            kichraytirilgan JPEG) serverga yuboriladi. Server rasmni eStats&apos;ning o&apos;zida turgan Uzum ochiq katalogi suratlari bilan solishtiradi
            (sun&apos;iy intellekt ham, tashqi xizmat ham ishlatilmaydi — rasm hech kimga uzatilmaydi) va o&apos;xshash tovarlarni qaytaradi. Rasmning
            o&apos;zi saqlanmaydi; kunlik limit va sifat uchun vaqt, topilgan tovar nomi, natijalar soni va eng yuqori moslik yoziladi. Natija brauzerning sessiya xotirasida brauzer yopilguncha turadi (10 daqiqadan eskisi yangi qidiruvda o&apos;chiriladi).
          </li>
          <li>
            <strong>Sozlamalar</strong>{" "}(til, qaysi bloklar ko&apos;rinishi, davrlar) brauzeringizning o&apos;zida (Chrome sinxronizatsiyasi) saqlanadi va
            eStats serveriga yuborilmaydi.
          </li>
          <li>
            <strong>Foydalanish statistikasi.</strong>{" "}Kengaytmaning qaysi bo&apos;limi ishlatilganini bilish uchun hodisa nomi (masalan «tovar
            tahlili ochildi»), ekran turi, uzum.uz&apos;ning ochiq tovar/turkum raqami, tanlangan davr va bitta son (masalan natijalar soni)
            hisobingizga bog&apos;lab yuboriladi. Sahifa manzili, sahifa matni, qidiruv so&apos;zlaringiz, uzum.uz&apos;dan tashqari saytlardagi faoliyat,
            klaviatura yoki sichqoncha izlari, shaxsiy va nozik toifadagi ma&apos;lumot YUBORILMAYDI — kengaytmada bunday yo&apos;l yo&apos;q, server esa
            ro&apos;yxatda yo&apos;q hodisani qabul qilmaydi. Buni kengaytma oynachasidagi «Foydalanish statistikasi» belgisi bilan istalgan vaqtda
            o&apos;chirasiz; yozuvlar 180 kundan keyin o&apos;chiriladi.
          </li>
          <li>
            <strong>Hisob ma&apos;lumoti.</strong>{" "}Kengaytma oynachasida eStats hisobingizning ismi va email&apos;i ko&apos;rsatiladi — ular serverdan
            olinadi va kengaytmada saqlanmaydi.
          </li>
          <li>
            <strong>Texnik jurnal.</strong>{" "}Server so&apos;rovlar jurnalida IP manzil, vaqt va so&apos;rov yo&apos;li 14 kungacha saqlanadi (xavfsizlik va
            nosozliklarni topish uchun).
          </li>
        </ul>

        <h2>Kimga beriladi</h2>
        <p>
          Ma&apos;lumot sotilmaydi, reklama, profil tuzish yoki kredit baholash uchun ishlatilmaydi. Uchinchi tomonlar faqat xizmatni ko&apos;rsatish
          uchun: Telegram (faqat siz yoqqan kuzatuv xabarlari) va server joylashgan hosting (Germaniya). Rasm bo&apos;yicha qidiruvdagi rasm
          uchinchi tomonga berilmaydi. Qonun talab qilgan hollar bundan mustasno.
        </p>

        <h2>Limited Use</h2>
        <p>
          eStats Lens&apos;dan olingan ma&apos;lumotdan foydalanish Chrome Web Store User Data Policy, jumladan Limited Use talablariga mos keladi.
        </p>

        <h2>Nazorat va o&apos;chirish</h2>
        <ul>
          <li>Brauzerni kabinetdagi Integratsiyalar → «Brauzer kengaytmasi» bo&apos;limidan uzsangiz, token darhol ishlamay qoladi.</li>
          <li>Kengaytmani o&apos;chirsangiz, uning brauzerdagi ma&apos;lumoti (token, natijalar) ham o&apos;chadi.</li>
          <li>
            Hisob-kitoblar, kuzatuv ro&apos;yxati va ulangan brauzerlarni butunlay o&apos;chirish uchun {CONTACT} manziliga yozing — 30 kun ichida
            o&apos;chiriladi.
          </li>
        </ul>

        <h2>Xavfsizlik</h2>
        <p>Barcha aloqa HTTPS orqali. Token serverda xesh ko&apos;rinishida saqlanadi. Kengaytma masofadan kod yuklamaydi.</p>

        <h2>Aloqa</h2>
        <p>{CONTACT}</p>
      </section>

      {/* ── Русский ─────────────────────────────────────────────── */}
      <section id="ru" className="space-y-5 border-t pt-8">
        <h2>Русский</h2>
        <p>Последнее обновление: {UPDATED.ru}</p>
        <p>
          eStats Lens — расширение браузера сервиса eStats (estats.uz). Оно показывает аналитику рынка Uzum Market на страницах uzum.uz. Это
          единственное назначение расширения, и данные ниже используются только для него.
        </p>

        <h2>С какими данными работает расширение</h2>
        <ul>
          <li>
            <strong>Токен подключения.</strong>{" "}Когда вы подтверждаете «Подключить этот браузер» на estats.uz, eStats выдаёт токен для этого браузера.
            Он хранится в памяти расширения и отправляется только в запросах к api.estats.uz. На сервере хранится не сам токен, а его хеш, название
            браузера, версия расширения, user-agent, время подключения и последней активности.
          </li>
          <li>
            <strong>Идентификаторы со страниц uzum.uz.</strong>{" "}ID карточек товаров на открытой странице, ID категории или имя магазина (из адреса) и
            ID товара на странице товара отправляются на сервер eStats, в ответ приходит статистика по этим товарам. Полный текст страницы, ваши
            поисковые запросы, аккаунт Uzum, cookie и активность на других сайтах не читаются и не отправляются.
          </li>
          <li>
            <strong>Введённые вами расчёты.</strong>{" "}Значения калькулятора юнит-экономики (себестоимость, объём упаковки, маржа и т. п.) сохраняются
            на сервере в вашем аккаунте, чтобы не вводить их повторно. Список отслеживаемых товаров тоже хранится на сервере; при изменении цены
            или остатка уведомление приходит в Telegram-чат, привязанный к аккаунту.
          </li>
          <li>
            <strong>Поиск по фото.</strong>{" "}Только по вашему выбору: ссылка на изображение или выделенная вами часть экрана (JPEG, уменьшенный до
            1280 px) отправляется на сервер. Сервер сравнивает его с фотографиями открытого каталога Uzum, которые хранятся у eStats (без
            искусственного интеллекта и сторонних сервисов — изображение никому не передаётся), и возвращает похожие товары. Само изображение не
            сохраняется; для дневного лимита и качества записываются время, название найденного товара, число результатов и наибольшее сходство. Результат хранится в сессионной памяти браузера до его закрытия (результаты старше 10 минут удаляются при новом поиске).
          </li>
          <li>
            <strong>Настройки</strong>{" "}(язык, видимые блоки, периоды) хранятся в самом браузере (синхронизация Chrome) и на сервер eStats не
            отправляются.
          </li>
          <li>
            <strong>Статистика использования.</strong>{" "}Чтобы понимать, какие разделы расширения используются, отправляются название события
            (например «открыт анализ товара»), тип экрана, публичный номер товара или категории uzum.uz, выбранный период и одно число (например
            количество результатов) — привязанные к вашему аккаунту. Адреса страниц, их содержимое, ваши поисковые запросы, активность на сайтах
            кроме uzum.uz, следы клавиатуры или мыши, личные и чувствительные данные НЕ отправляются: в расширении нет такого пути, а сервер не
            принимает события вне списка. Отключается в любой момент галочкой «Статистика использования» во всплывающем окне; записи удаляются
            через 180 дней.
          </li>
          <li>
            <strong>Данные аккаунта.</strong>{" "}Во всплывающем окне показываются имя и email аккаунта eStats — они берутся с сервера и в расширении не
            сохраняются.
          </li>
          <li>
            <strong>Технический журнал.</strong>{" "}В журнале запросов сервера IP-адрес, время и путь запроса хранятся до 14 дней (безопасность и
            поиск неисправностей).
          </li>
        </ul>

        <h2>Кому передаются данные</h2>
        <p>
          Данные не продаются и не используются для рекламы, профилирования или оценки кредитоспособности. Третьи стороны — только для работы
          сервиса: Telegram (только включённые вами уведомления) и хостинг сервера (Германия). Изображение из поиска по фото третьим лицам не
          передаётся. Исключение — требования закона.
        </p>

        <h2>Limited Use</h2>
        <p>
          Использование информации, полученной от eStats Lens, соответствует Chrome Web Store User Data Policy, включая требования Limited Use.
        </p>

        <h2>Управление и удаление</h2>
        <ul>
          <li>Если отключить браузер в кабинете (Интеграции → «Расширение браузера»), токен сразу перестаёт работать.</li>
          <li>При удалении расширения удаляются и его данные в браузере (токен, результаты).</li>
          <li>Чтобы полностью удалить расчёты, список отслеживания и подключённые браузеры, напишите на {CONTACT} — удалим в течение 30 дней.</li>
        </ul>

        <h2>Безопасность</h2>
        <p>Весь обмен данными — по HTTPS. Токен хранится на сервере в виде хеша. Расширение не загружает код удалённо.</p>

        <h2>Контакты</h2>
        <p>{CONTACT}</p>
      </section>

      {/* ── English ─────────────────────────────────────────────── */}
      <section id="en" className="space-y-5 border-t pt-8">
        <h2>English</h2>
        <p>Last updated: {UPDATED.en}</p>
        <p>
          eStats Lens is the browser extension of the eStats service (estats.uz). It shows Uzum Market analytics on uzum.uz pages. This is the
          extension&apos;s single purpose, and the data described below is used only for it.
        </p>

        <h2>Data the extension handles</h2>
        <ul>
          <li>
            <strong>Connection token.</strong>{" "}When you confirm &quot;Connect this browser&quot; on estats.uz, eStats issues a token for that browser. It
            is kept in the extension&apos;s local storage and sent only with requests to api.estats.uz. The server stores a hash of the token (not
            the token itself), the browser name, extension version, user agent, and the connection and last-activity times.
          </li>
          <li>
            <strong>Identifiers from uzum.uz pages.</strong>{" "}The IDs of product cards shown on the open page, the category ID or shop name (taken from
            the address), and the product ID on a product page are sent to the eStats server, which returns statistics for those products. The
            full page text, your search queries, your Uzum account, cookies, and activity on other websites are not read or sent.
          </li>
          <li>
            <strong>Calculations you enter.</strong>{" "}Values entered in the unit-economics calculator (cost price, package volume, margin, etc.) are
            saved on the server in your account so you do not have to re-enter them. The list of watched products is also stored on the server;
            when a price or stock changes, a notification is sent to the Telegram chat linked to your account.
          </li>
          <li>
            <strong>Image search.</strong>{" "}Only when you choose it: the image link or the screen area you select (a JPEG downscaled to at most
            1280 px) is sent to the server. The server compares it with photos of Uzum&apos;s public catalog that eStats stores itself (no artificial
            intelligence and no third-party service — the image is not shared with anyone) and returns similar products. The image itself is not
            stored; the time, the matched product title, the number of results and the best similarity are logged for the daily limit and quality. Results stay in the browser&apos;s session storage until the browser is closed (results older than 10 minutes are removed when a new search starts).
          </li>
          <li>
            <strong>Settings</strong>{" "}(language, visible blocks, periods) are stored in your browser (Chrome sync) and are not sent to the eStats
            server.
          </li>
          <li>
            <strong>Usage statistics.</strong>{" "}To understand which parts of the extension are used, we send the event name (for example &quot;product
            analysis opened&quot;), the screen type, the public uzum.uz product or category id, the selected period and a single number (such as the
            result count), linked to your account. Page URLs, page content, your search queries, activity on sites other than uzum.uz, keyboard or
            mouse traces, personal and sensitive data are NOT sent — the extension has no code path for that, and the server rejects events outside
            the list. You can switch it off at any time with the &quot;Usage statistics&quot; checkbox in the popup; records are deleted after 180 days.
          </li>
          <li>
            <strong>Account details.</strong>{" "}The popup shows the name and email of your eStats account; they are loaded from the server and are not
            stored by the extension.
          </li>
          <li>
            <strong>Technical logs.</strong>{" "}Server request logs keep the IP address, time and request path for up to 14 days (security and
            troubleshooting).
          </li>
        </ul>

        <h2>Sharing</h2>
        <p>
          Data is not sold and is not used for advertising, profiling, or creditworthiness or lending decisions. Third parties are used only to
          provide the service: Telegram (only notifications you enable) and the server hosting provider (Germany), except where required by law.
          The image used for image search is not shared with any third party.
        </p>

        <h2>Limited Use</h2>
        <p>
          The use of information received from eStats Lens adheres to the Chrome Web Store User Data Policy, including the Limited Use
          requirements.
        </p>

        <h2>Your controls and deletion</h2>
        <ul>
          <li>Disconnecting the browser in your eStats account (Integrations → &quot;Browser extension&quot;) revokes the token immediately.</li>
          <li>Uninstalling the extension removes its data from the browser (token, results).</li>
          <li>To delete saved calculations, the watch list and connected browsers entirely, write to {CONTACT}; we delete them within 30 days.</li>
        </ul>

        <h2>Security</h2>
        <p>All traffic uses HTTPS. The token is stored on the server as a hash. The extension does not load remote code.</p>

        <h2>Contact</h2>
        <p>{CONTACT}</p>
      </section>
    </>
  );
}
