/**
 * `/extension/ai-connect` sahifasi va kengaytma orasidagi qo'l berishning
 * SOF qismi (`tests/ai-connect.test.mjs`).
 *
 * 2026-11 dan AI vazifalarini eStats Lens (1.2.0+) bajaradi; eski alohida
 * «eStats AI» kengaytmasi ham shu protokol bilan javob beradi. Lens `ai:ready`
 * ga `app: "estats-lens"` va `permissions` qo'shadi — shu bilan ajratamiz.
 */

export const AI_SOURCE_PAGE = "estats-front";
export const AI_SOURCE_EXTENSION = "estats-ai-worker";
export const LENS_APP = "estats-lens";

export type AiReadyMessage = { source?: string; type?: string; version?: string; app?: string; permissions?: boolean };

export type AiHandshake = {
  /** eStats Lens javob berdi. */
  lens: boolean;
  /** Eski «eStats AI» kengaytmasi javob berdi (`app` yo'q). */
  legacy: boolean;
  /** Lens: Gemini/ChatGPT saytlariga ruxsat berilganmi; `undefined` — noma'lum. */
  permitted: boolean | undefined;
  version: string | null;
};

export const EMPTY_HANDSHAKE: AiHandshake = { lens: false, legacy: false, permitted: undefined, version: null };

/** `ai:ready` ni holatga qo'shadi. Versiya — Lens'niki ustun (u ulanadi). */
export function onAiReady(state: AiHandshake, data: AiReadyMessage): AiHandshake {
  if (data.app === LENS_APP) {
    return {
      ...state,
      lens: true,
      version: data.version ?? state.version,
      permitted: typeof data.permissions === "boolean" ? data.permissions : state.permitted,
    };
  }
  return { ...state, legacy: true, version: state.lens ? state.version : (state.version ?? data.version ?? null) };
}

/**
 * `ai:connected` ga javob: `ok:true` — darhol ulandi; `ok:false` — ikkinchi
 * kengaytmaniki bo'lishi mumkin (state unga tegishli emas), shuning uchun
 * avval qisqa KUTISH; ulanib bo'lgach kelgan har qanday javob e'tiborsiz.
 */
export function aiConnectedDecision(alreadyConnected: boolean, ok: boolean): "connected" | "wait" | "ignore" {
  if (alreadyConnected) return "ignore";
  return ok ? "connected" : "wait";
}

/** Ikkala kengaytma ham o'rnatilgan — eskisini o'chirish so'raladi. */
export function bothInstalled(state: AiHandshake): boolean {
  return state.lens && state.legacy;
}
