import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "traveldesk_super_secure_secret_key_2026_x!9qZ";
export const COOKIE_NAME = "traveldesk_session";

export interface SessionUser {
  id: string;
  username: string;
  name?: string;
  role: string;
}

// 1. Password Hashing with scrypt and salt
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString("hex"), "hex");
    const hashBuffer = Buffer.from(hash, "hex");
    return crypto.timingSafeEqual(keyBuffer, hashBuffer);
  } catch {
    return false;
  }
}

// 2. Signed Session Token (HMAC-SHA256)
export function createSessionToken(user: SessionUser, expiresInHours = 72): string {
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
  const payload = {
    user,
    exp: expiresAt,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload.user as SessionUser;
  } catch {
    return null;
  }
}
