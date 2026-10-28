import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const ADMIN_SESSION_SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || 'fage-admin-session-secret-change-me',
);

export async function createAdminSessionToken(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(ADMIN_SESSION_SECRET);
}

export async function verifyAdminSessionToken(token: string) {
  const { payload } = await jwtVerify(token, ADMIN_SESSION_SECRET);
  return payload.email as string | undefined;
}

export async function getCurrentAdminEmail() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('fage_session')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    return await verifyAdminSessionToken(sessionToken);
  } catch {
    return null;
  }
}
