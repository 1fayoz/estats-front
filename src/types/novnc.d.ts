// `@novnc/novnc` — hech qanday tur e'loni bilan kelmaydi. Faqat
// biz haqiqatan ishlatadigan qism e'lon qilingan
// (`uzum-vnc-dialog.tsx`) — to'liq API emas.
declare module "@novnc/novnc" {
  export default class RFB extends EventTarget {
    constructor(target: HTMLElement, url: string, options?: { credentials?: Record<string, string>; shared?: boolean; wsProtocols?: string[] });
    scaleViewport: boolean;
    resizeSession: boolean;
    disconnect(): void;
  }
}
