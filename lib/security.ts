import crypto from 'node:crypto';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getSecret() {
  return process.env.STAFF_QR_SECRET || 'fage-local-qr-secret-change-me';
}

export function checkRateLimit(identifier: string) {
  const now = Date.now();
  const bucket = rateLimitStore.get(identifier);

  if (!bucket || bucket.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export function generateQrPayload(staffId: string) {
  const timestamp = Date.now();
  const data = `${staffId}:${timestamp}`;
  const signature = crypto.createHmac('sha256', getSecret()).update(data).digest('hex');
  return `${staffId}.${timestamp}.${signature}`;
}

export function verifyQrPayload(payload: string) {
  if (!payload || typeof payload !== 'string') {
    return null;
  }

  const parts = payload.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [staffId, timestamp, signature] = parts;
  if (!staffId || !timestamp || !signature) {
    return null;
  }

  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(`${staffId}:${timestamp}`)
    .digest('hex');

  if (signature.length !== expected.length) {
    return null;
  }

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }

  return {
    staffId,
    timestamp: Number(timestamp),
  };
}
