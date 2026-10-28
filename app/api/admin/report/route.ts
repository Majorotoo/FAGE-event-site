import { NextResponse } from 'next/server';
import { z } from 'zod';
import { appendAudit, getDefaultSettings, readJson, writeJson } from '@/lib/storage';
import { verifyQrPayload, checkRateLimit } from '@/lib/security';
import type { AttendanceLog, StaffMember } from '@/lib/types';

const payloadSchema = z.object({
  method: z.enum(['qr', 'manual']),
  qrToken: z.string().optional(),
  staffId: z.string().optional(),
  email: z.string().email().optional(),
});

function getLocalTimeString(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'local-client';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment and try again.' }, { status: 429 });
  }

  const body = payloadSchema.parse(await req.json());
  const staff = await readJson<StaffMember[]>('staff.json', []);
  const logs = await readJson<AttendanceLog[]>('logs.json', []);
  const settings = await getDefaultSettings();

  let person: StaffMember | undefined;

  if (body.method === 'qr') {
    const payload = verifyQrPayload(body.qrToken || '');
    if (!payload) {
      return NextResponse.json({ error: 'Invalid QR code signature.' }, { status: 400 });
    }
    person = staff.find((entry) => entry.id === payload.staffId);
  } else {
    person =
      staff.find((entry) => entry.id === body.staffId) ||
      staff.find((entry) => entry.email.toLowerCase() === (body.email || '').toLowerCase());
  }

  if (!person) {
    return NextResponse.json({ error: 'Staff member not found.' }, { status: 404 });
  }

  if (person.status === 'blocked') {
    return NextResponse.json({ error: 'Access denied. Staff account inactive.', status: 'blocked' }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const existing = logs.find((entry) => entry.staffId === person.id && entry.date === today);
  if (existing) {
    return NextResponse.json({ success: true, message: `Already checked in today at ${existing.timeIn}.`, duplicate: true });
  }

  const now = new Date();
  const timeIn = getLocalTimeString(now);
  const isLate = timeIn > settings.lateThreshold;
  const logEntry: AttendanceLog = {
    id: `ATT-${Date.now()}`,
    staffId: person.id,
    fullName: person.fullName,
    position: person.position,
    department: person.department,
    date: today,
    timeIn,
    verificationMethod: body.method,
    status: isLate ? 'late' : 'present',
  };

  const updatedStaff = staff.map((entry) => (entry.id === person.id ? { ...entry, lastCheckIn: now.toISOString() } : entry));
  await writeJson('staff.json', updatedStaff);
  await writeJson('logs.json', [logEntry, ...logs]);
  await appendAudit('Check-in', 'system', 'attendance', person.id, `${person.fullName} checked in via ${body.method}.`);

  return NextResponse.json({
    success: true,
    message: `Welcome back, ${person.fullName}! Logged in at ${timeIn}.`,
    status: isLate ? 'late' : 'present',
    staff: person,
    log: logEntry,
  });
}

export async function GET() {
  const logs = await readJson<AttendanceLog[]>('logs.json', []);
  return NextResponse.json(logs);
}
