/**
 * Xatcho'p (bookmarklet) kodini tekshirish — sof qism (testlanadi).
 *
 * React 19 har qanday `javascript:` href'ni xavfsizlik uchun
 * `javascript:throw new Error(...)` ga almashtiradi. Shu sabab havola
 * React'dan tashqarida (`setAttribute`) qo'yiladi. Lekin React'ning
 * himoyasini chetlab o'tgandan keyin biz o'zimiz tekshirishimiz kerak:
 * faqat backend `/market/uploader` yasaydigan shakl qabul qilinadi.
 */
const BOOKMARKLET_PREFIX = "javascript:(async()=>{";

export function safeBookmarklet(code: unknown): string | null {
  if (typeof code !== "string") return null;
  if (!code.startsWith(BOOKMARKLET_PREFIX)) return null;
  // Bitta satr: yangi qator yoki boshqaruv belgilari kutilmagan.
  if (/[\u0000-\u001f]/.test(code)) return null;
  return code;
}
