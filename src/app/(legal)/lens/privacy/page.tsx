import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

/**
 * eStats Lens kengaytmasining maxfiylik siyosati — Chrome Web Store'dagi
 * "Privacy policy URL" shu sahifa.
 *
 * Uch tilda: do'kon tekshiruvchisi inglizcha o'qiydi, sotuvchilar o'zbek va rus.
 * Matn KOD bilan bir xil bo'lishi shart — kengaytma yangi ma'lumot yubora
 * boshlasa (yangi so'rov, yangi ruxsat), shu sahifa ham, do'kondagi "Privacy
 * practices" javoblari ham yangilanadi (`estats-lens-extension/store/LISTING.md`).
 */

export const metadata: Metadata = buildMetadata({
  title: "eStats Lens — maxfiylik siyosati",
  description:
    "eStats Lens brauzer kengaytmasi qanday ma'lumot bilan ishlaydi, nima uchun va qancha saqlanadi.",
  path: "/lens/privacy",
  // Mahsulot nomi "eStats Lens" — brend sarlavhada bor, shablon qo'shmaydi.
  absoluteTitle: true,
});

const UPDATED = { uz: "2026-yil 22-noyabr", ru: "22 ноября 2026 г.", en: "November 22, 2026" };
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
          eStats Lens — eStats (estats.uz) xizmatining brauzer kengaytmasi. U Uzum Market sotuvchisi uchun asbob: uzum.uz sahifalarida bozor
          tahlilini ko&apos;rsatadi va — faqat siz yoqsangiz — eStats&apos;dagi Uzum e&apos;lonlaringiz uchun vazifalarni shu brauzerda bajaradi. Quyidagi
          ma&apos;lumot faqat shu vazifa uchun ishlatiladi.
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
            o&apos;qilmaydi va yuborilmaydi (kabinet vazifalari — quyida, faqat siz yoqsangiz).
          </li>
          <li>
            <strong>Sotuvchi kabineti vazifalari (ixtiyoriy, 1.1.0 dan).</strong>{" "}Faqat siz kengaytma oynachasida «Shu brauzerda bajarish» ni
            yoqib, Chrome so&apos;ragan qo&apos;shimcha ruxsatni (seller.uzum.uz, api-seller.uzum.uz, analytics-seller.uzum.uz va webRequest) berganingizda
            ishlaydi. Shunda kengaytma eStats navbatidagi SIZNING do&apos;koningiz vazifalarini (turkumlar daraxti, moderatsiya sabablari, reklama va
            voronka statistikasi, siz alohida tasdiqlagan Bust TOP kampaniyasi) o&apos;zingiz kirgan kabinet tabida bajaradi. Buning uchun kabinet
            ilovasining o&apos;z so&apos;rovidagi avtorizatsiya sarlavhasi brauzerning sessiya xotirasida vaqtincha ushlanadi — u eStats&apos;ga ham, boshqa
            joyga ham YUBORILMAYDI. eStats&apos;ga faqat: kabinetga kirilganmi va qaysi Uzum do&apos;kon raqamlari ko&apos;rinayotgani (vazifa begona
            do&apos;konga ketmasligi uchun) hamda vazifa natijasi (Uzum javobidan olingan turkumlar, sabablar, statistika) yuboriladi. Paroliningiz
            o&apos;qilmaydi, Cloudflare yoki boshqa tekshiruvlar yechilmaydi. O&apos;chirsangiz kengaytma kabinetga umuman tegmaydi va ishchi tab yopiladi.
          </li>
          <li>
            <strong>eStats AI vazifalari (ixtiyoriy, 1.2.0 dan).</strong>{" "}Faqat siz kengaytma oynachasida «AI&apos;ni ulash» ni bosib, Chrome
            so&apos;ragan qo&apos;shimcha ruxsatni (gemini.google.com, chatgpt.com, ular rasm saqlaydigan *.googleusercontent.com va *.oaiusercontent.com
            hamda cookies) berganingizda va estats.uz/extension/ai-connect sahifasida ulaganingizda ishlaydi. Buning uchun eStats ALOHIDA AI tokeni
            beradi (Lens tokenidan mustaqil). Shunda kengaytma eStats navbatidagi SIZNING vazifalaringizni (tovar kartochkasi matni, tovar rasmini
            yasash va tekshirish) Gemini va ChatGPT&apos;ning qadalgan tabida, o&apos;zingiz kirgan hisob bilan bajaradi: promptni yozadi, tovar suratlarini
            biriktiradi va javobni o&apos;qiydi. eStats&apos;ga faqat: shu saytlarga kirilganmi, Gemini hisobingiz email&apos;i, Gemini limit holati (foiz va
            tiklanish vaqti) hamda vazifa natijasi (javob matni, yasalgan rasmlar va suhbat manzili) yuboriladi. Google/OpenAI parollaringiz va
            cookie qiymatlari o&apos;qilmaydi va yuborilmaydi (cookies ruxsati faqat ChatGPT&apos;ga kirilganini bilish uchun). «AI&apos;ni uzish» token va
            ruxsatlarni olib tashlaydi, ishchi tablar yopiladi.
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
          eStats Lens — расширение браузера сервиса eStats (estats.uz). Это инструмент продавца Uzum Market: показывает аналитику рынка на
          страницах uzum.uz и — только если вы включите — выполняет в этом браузере задачи eStats для ваших объявлений Uzum. Данные ниже
          используются только для этого.
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
            <strong>Задачи кабинета продавца (необязательно, с версии 1.1.0).</strong>{" "}Работают, только если вы включили «Выполнять в этом
            браузере» во всплывающем окне и выдали дополнительное разрешение Chrome (seller.uzum.uz, api-seller.uzum.uz,
            analytics-seller.uzum.uz и webRequest). Тогда расширение выполняет задачи ВАШЕГО магазина из очереди eStats (дерево категорий, причины
            модерации, статистика рекламы и воронки, отдельно подтверждённая вами кампания Bust TOP) во вкладке кабинета, где вы сами вошли. Для
            этого заголовок авторизации из собственного запроса приложения кабинета временно хранится в сессионной памяти браузера — он НЕ
            отправляется ни в eStats, ни куда-либо ещё. В eStats отправляются только: выполнен ли вход и какие номера магазинов Uzum видны (чтобы
            задача не ушла в чужой магазин), а также результат задачи (категории, причины, статистика из ответа Uzum). Пароль не читается,
            проверки Cloudflare и другие не обходятся. Если выключить, расширение не обращается к кабинету, а рабочая вкладка закрывается.
          </li>
          <li>
            <strong>Задачи eStats AI (необязательно, с версии 1.2.0).</strong>{" "}Работают, только если вы нажали «Подключить AI» во всплывающем окне,
            выдали дополнительное разрешение Chrome (gemini.google.com, chatgpt.com, их файловые домены *.googleusercontent.com и *.oaiusercontent.com,
            а также cookies) и подключили браузер на странице estats.uz/extension/ai-connect. Для этого eStats выдаёт ОТДЕЛЬНЫЙ токен AI (независимо
            от токена Lens). Расширение выполняет ВАШИ задачи из очереди eStats (текст карточки товара, генерация и проверка изображения товара) в
            закреплённой вкладке Gemini и ChatGPT с аккаунтом, в который вы вошли сами: вводит запрос, прикрепляет фото товара и читает ответ. В eStats
            отправляются только: выполнен ли вход на эти сайты, email аккаунта Gemini, состояние лимита Gemini (процент и время восстановления) и
            результат задачи (текст ответа, созданные изображения и адрес диалога). Пароли Google/OpenAI и значения cookie не читаются и не
            отправляются (разрешение cookies нужно только чтобы узнать, выполнен ли вход в ChatGPT). «Отключить AI» удаляет токен и разрешения,
            рабочие вкладки закрываются.
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
          eStats Lens is the browser extension of the eStats service (estats.uz). It is a tool for Uzum Market sellers: it shows market analytics on
          uzum.uz pages and — only if you turn it on — runs eStats tasks for your Uzum listings in this browser. This is the extension&apos;s single
          purpose, and the data described below is used only for it.
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
            <strong>Seller cabinet tasks (optional, since 1.1.0).</strong>{" "}Active only if you turn on &quot;Run in this browser&quot; in the popup
            and grant Chrome&apos;s additional permission (seller.uzum.uz, api-seller.uzum.uz, analytics-seller.uzum.uz and webRequest). The extension
            then runs YOUR shop&apos;s tasks from the eStats queue (category tree, moderation reasons, ad and funnel statistics, and a Bust TOP campaign
            you explicitly confirm) inside the seller cabinet tab where you signed in yourself. To do so, the authorization header of the cabinet
            app&apos;s own request is kept temporarily in the browser&apos;s session memory — it is NOT sent to eStats or anywhere else. Only the following
            is sent to eStats: whether you are signed in and which Uzum shop numbers are visible (so a task never runs against another shop), and the
            task result (categories, reasons, statistics taken from Uzum&apos;s response). Your password is not read, and Cloudflare or other checks are
            not bypassed. When switched off, the extension does not touch the cabinet and closes the worker tab.
          </li>
          <li>
            <strong>eStats AI tasks (optional, since 1.2.0).</strong>{" "}Active only if you click &quot;Connect AI&quot; in the popup, grant Chrome&apos;s
            additional permission (gemini.google.com, chatgpt.com, their file domains *.googleusercontent.com and *.oaiusercontent.com, and cookies)
            and connect the browser on estats.uz/extension/ai-connect. eStats then issues a SEPARATE AI token (independent of the Lens token). The
            extension runs YOUR tasks from the eStats queue (product card text, product image generation and checks) in a pinned Gemini and ChatGPT
            tab with the account you signed in to yourself: it types the prompt, attaches the product photos and reads the answer. Only the
            following is sent to eStats: whether you are signed in to these sites, your Gemini account email, the Gemini limit status (percentage
            and reset time), and the task result (answer text, generated images and the conversation URL). Your Google/OpenAI passwords and cookie
            values are not read or sent (the cookies permission is used only to tell whether you are signed in to ChatGPT). &quot;Disconnect AI&quot;
            removes the token and the permissions and closes the worker tabs.
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
