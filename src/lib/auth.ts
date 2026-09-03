import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'lp_admin_session';
const SESSION_HOURS = 12;

function getSecretKey() {
  return new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
}

// jose works in both Node and Edge runtimes (unlike jsonwebtoken), which is
// required since Next.js middleware always runs on the Edge runtime.
export async function signAdminToken(email: string) {
  return new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(getSecretKey());
}

export async function verifyAdminToken(token: string | undefined | null): Promise<{ email: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== 'admin' || typeof payload.email !== 'string') return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function checkPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function adminCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_HOURS * 60 * 60,
  };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
