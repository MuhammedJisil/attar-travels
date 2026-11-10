import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken, SessionUser } from "./auth";

// Server-only helper to read session from cookies in App Router API routes
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

