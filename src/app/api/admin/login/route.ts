import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkPassword, signAdminToken, adminCookieOptions } from '@/lib/auth';

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminHash = process.env.ADMIN_PASSWORD_HASH!;

  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const valid = await checkPassword(password, adminHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = await signAdminToken(email);
  const res = NextResponse.json({ success: true });
  const cookie = adminCookieOptions();
  res.cookies.set(cookie.name, token, cookie);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  const cookie = adminCookieOptions();
  res.cookies.set(cookie.name, '', { ...cookie, maxAge: 0 });
  return res;
}
