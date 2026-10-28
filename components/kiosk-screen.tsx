import { NextResponse } from 'next/server';
import { z } from 'zod';
import { appendAudit, getDefaultSettings, readJson, writeJson } from '@/lib/storage';
import { getCurrentAdminEmail } from '@/lib/auth';
import type { AttendanceLog, StaffMember } from '@/lib/types';

const adjustmentSchema = z.object({
  staffId: z.string(),
  date: z.string(),
  timeIn: z.string(),
  notes: z.string().optional(),
  verificationMethod: z.enum(['manual', 'qr']).optional(),
});

export async function POST(req: Request) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = adjustmentSchema.parse(await req.json());
  const staff = await readJson<StaffMember[]>('staff.json', []);
  const logs = await readJson<AttendanceLog[]>('logs.json', []);
  const settings = await getDefaultSettings();

  const person = staff.find((entry) => entry.id === payload.staffId);
  if (!person) return NextResponse.json({ error: 'Staff member not found.' }, { status: 404 });

  const status = payload.timeIn > settings.lateThreshold ? 'late' : 'present';
  const existing = logs.find((entry) => entry.staffId === payload.staffId && entry.date === payload.date);

  const entry: AttendanceLog = {
    id: existing?.id || `ATT-${Date.now()}`,
    staffId: person.id,
    fullName: person.fullName,
    position: person.position,
    department: person.department,
    date: payload.date,
    timeIn: payload.timeIn,
    verificationMethod: payload.verificationMethod || 'manual',
    status,
    notes: payload.notes || 'Manual adjustment by admin',
  };

  const nextLogs = existing ? logs.map((log) => (log.id === existing.id ? entry : log)) : [entry, ...logs];
  await writeJson('logs.json', nextLogs);
  await appendAudit('Manual adjustment', adminEmail, 'attendance', person.id, `${person.fullName} attendance updated to ${payload.timeIn} on ${payload.date}.`);

  return NextResponse.json({ success: true, log: entry });
}
