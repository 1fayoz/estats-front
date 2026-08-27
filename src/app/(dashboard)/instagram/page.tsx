import { redirect } from "next/navigation";

/**
 * Instagram endi "Ijtimoiy tarmoqlar" ichida — o'z tabida.
 *
 * Manzil qoldirilgan: eski xatcho'p va tashqi havolalar 404 bo'lmasligi
 * kerak (Facebook ilovasidagi qaytish manzillari ham shu yerni ko'rsatadi).
 */
export default function InstagramRedirect() {
  redirect("/socials");
}
