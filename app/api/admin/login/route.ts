import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createAdminSessionToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());
    const expectedEmail = process.env.ADMIN_EMAIL || 'admin@fage.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'FAGE2026!';

    if (body.email !== expectedEmail || body.password !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const token = await createAdminSessionToken(body.email);
    const cookieStore = cookies();
    cookieStore.set('fage_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return NextResponse.json({ success: true, redirectTo: '/admin' });
  } catch {
    return NextResponse.json({ error: 'Missing or invalid login payload' }, { status: 400 });
  }
}
