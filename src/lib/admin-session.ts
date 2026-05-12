// Admin uchun stateless session token (HMAC-SHA256 bilan imzolangan).
//
// Format: `<exp>.<nonce>.<sig>` — barchasi base64url.
//   exp   — UNIX seconds, token muddati tugash vaqti.
//   nonce — 16 baytli tasodifiy qiymat (replay'ni qiyinlashtiradi).
//   sig   — HMAC-SHA256("<exp>.<nonce>", ADMIN_SECRET).
//
// Cookie qiymati endi ADMIN_SECRET'ning o'zi emas — agar cookie chiqib ketsa
// ham parol fosh bo'lmaydi, va token muddati 8 soatdan keyin tugaydi.

const encoder = new TextEncoder();

export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 soat

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
 * Yangi imzolangan admin session token yaratadi.
 */
export async function createAdminSession(): Promise<{
  token: string;
  maxAge: number;
}> {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const payload = `${exp}.${base64urlEncode(nonce)}`;

  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  const token = `${payload}.${base64urlEncode(new Uint8Array(sig))}`;
  return { token, maxAge: ADMIN_SESSION_TTL_SECONDS };
}

/**
 * Cookie'dagi admin tokenni HMAC va muddat bo'yicha tekshiradi.
 */
export async function verifyAdminSession(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expStr, nonceStr, sigStr] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return false;
  if (exp < Math.floor(Date.now() / 1000)) return false;

  const payload = `${expStr}.${nonceStr}`;
  try {
    const key = await getKey();
    const sig = base64urlDecode(sigStr);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      sig as BufferSource,
      encoder.encode(payload)
    );
    return ok;
  } catch {
    return false;
  }
}

/**
 * Xom parol va ADMIN_SECRET'ni timing-safe taqqoslash.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const len = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < len; i++) {
    const x = i < aBytes.length ? aBytes[i] : 0;
    const y = i < bBytes.length ? bBytes[i] : 0;
    diff |= x ^ y;
  }
  return diff === 0;
}
