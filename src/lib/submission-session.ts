// Submission uchun stateless token (HMAC-SHA256 bilan imzolangan).
//
// Maqsad: ?submission=<uuid> URL parametri bilan boshqa odam:
//   - javoblarni overwrite qila olmasin
//   - natija sahifasini ko'ra olmasin
//
// Cookie format: `<exp>.<sig>` — base64url.
//   exp — UNIX seconds, token muddati tugashi.
//   sig — HMAC-SHA256("<submissionId>.<exp>", ADMIN_SECRET).
//
// HMAC kaliti sifatida ADMIN_SECRET ishlatiladi (alohida sir saqlash
// shart emas — domain'lar farqli payload formatlari bilan ajratilgan).

const encoder = new TextEncoder();

export const SUBMISSION_TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 soat
export const SUBMISSION_COOKIE_NAME = "submission_token";

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET muhit o'zgaruvchisi o'rnatilmagan");
  }
  return secret;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64urlEncode(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

/**
 * Berilgan submissionId uchun imzolangan token va cookie maxAge'ini qaytaradi.
 */
export async function createSubmissionToken(submissionId: string): Promise<{
  token: string;
  maxAge: number;
}> {
  const exp = Math.floor(Date.now() / 1000) + SUBMISSION_TOKEN_TTL_SECONDS;
  const payload = `${submissionId}.${exp}`;
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const token = `${exp}.${base64urlEncode(new Uint8Array(sig))}`;
  return { token, maxAge: SUBMISSION_TOKEN_TTL_SECONDS };
}

/**
 * Cookie'dagi token submissionId'ga mosligini va muddatini tekshiradi.
 * Hech qanday noto'g'ri kirishda exception otmaydi — `false` qaytaradi.
 */
export async function verifySubmissionToken(
  submissionId: string | null | undefined,
  token: string | null | undefined
): Promise<boolean> {
  if (!submissionId || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [expStr, sigStr] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return false;
  if (exp < Math.floor(Date.now() / 1000)) return false;

  const payload = `${submissionId}.${expStr}`;
  try {
    const key = await getKey();
    const sig = base64urlDecode(sigStr);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sig as BufferSource,
      encoder.encode(payload)
    );
  } catch {
    return false;
  }
}
