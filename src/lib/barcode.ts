/**
 * Code-128 (Subset B) Barcode Generator
 * Uzum Market, Wildberries, Yandex Market va Ozon etiketkalari uchun
 * universal shtrix-kod generatori.
 */

// Code 128B pattern table (107 symbols).
// Each 6-digit number represents alternating widths of 3 bars and 3 spaces (total 11 modules).
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112", // 100-106 (106 is STOP, 13 modules)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

/**
 * Berilgan matnni Code-128 barlari ketma-ketligiga (qora/oq modullar) o'tkazadi
 */
export function encodeCode128(text: string): boolean[] {
  if (!text || text.length === 0) {
    return [];
  }

  // Faqat ASCII 32 - 126 oraliqdagi belgilar Code 128B da qo'llab-quvvatlanadi
  const cleanText = text
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code <= 126;
    })
    .join("");

  if (cleanText.length === 0) {
    return [];
  }

  const values: number[] = [START_CODE_B];

  for (let i = 0; i < cleanText.length; i++) {
    values.push(cleanText.charCodeAt(i) - 32);
  }

  // Checksum hisoblash: (START + SUM(index * value)) % 103
  let checksum = values[0];
  for (let i = 1; i < values.length; i++) {
    checksum += i * values[i];
  }
  values.push(checksum % 103);
  values.push(STOP_CODE);

  // Barlarga aylantirish
  const modules: boolean[] = [];

  // Quiet zone chap tomonda (10 modul)
  for (let i = 0; i < 10; i++) modules.push(false);

  for (const val of values) {
    const pattern = CODE128_PATTERNS[val];
    if (!pattern) continue;

    let isBar = true;
    for (let i = 0; i < pattern.length; i++) {
      const width = parseInt(pattern[i], 10);
      for (let w = 0; w < width; w++) {
        modules.push(isBar);
      }
      isBar = !isBar;
    }
  }

  // Quiet zone o'ng tomonda (10 modul)
  for (let i = 0; i < 10; i++) modules.push(false);

  return modules;
}

/**
 * 12 ta raqamdan EAN-13 nazorat raqamini (check digit) hisoblash
 */
export function calculateEan13CheckDigit(first12: string): string {
  if (!/^\d{12}$/.test(first12)) return "";
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(first12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const mod = sum % 10;
  return mod === 0 ? "0" : (10 - mod).toString();
}

/**
 * Uzum va WB uchun yangi avtomatik EAN-13 generatsiya qilish (200 dan boshlanadigan ichki prefiks)
 */
export function generateRandomBarcode(): string {
  const prefix = "200"; // Mahalliylashtirilgan / ichki ombor kodi
  let body = "";
  for (let i = 0; i < 9; i++) {
    body += Math.floor(Math.random() * 10).toString();
  }
  const first12 = prefix + body;
  const check = calculateEan13CheckDigit(first12);
  return first12 + check;
}
