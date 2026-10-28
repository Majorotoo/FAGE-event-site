import { NextResponse } from 'next/server';
import { z } from 'zod';
import { appendAudit, readJson, writeJson } from '@/lib/storage';
import { getCurrentAdminEmail } from '@/lib/auth';
import type { StaffMember } from '@/lib/types';

const staffSchema = z.object({
  fullName: z.string().min(2),
  position: z.string().min(2),
  department: z.string().min(2),
  email: z.string().email(),
  photoUrl: z.string().optional(),
  status: z.enum(['active', 'blocked']).optional(),
});

export async function GET() {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const staff = await readJson<StaffMember[]>('staff.json', []);
  return NextResponse.json(staff);
}

export async function POST(req: Request) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = staffSchema.parse(await req.json());
  const staff = await readJson<StaffMember[]>('staff.json', []);

  const candidateId = `STF-${String(staff.length + 1).padStart(4, '0')}`;
  const newStaff: StaffMember = {
    id: candidateId,
    fullName: payload.fullName.trim(),
    position: payload.position.trim(),
    department: payload.department.trim(),
    email: payload.email.trim(),
    photoUrl: payload.photoUrl || '',
    status: payload.status || 'active',
    createdAt: new Date().toISOString(),
  };

  staff.push(newStaff);
  await writeJson('staff.json', staff);
  await appendAudit('Create staff', adminEmail, 'staff', newStaff.id, `Added ${newStaff.fullName} to the staff roster.`);

  return NextResponse.json(newStaff, { status: 201 });
}

export async function PATCH(req: Request) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = z.object({ id: z.string(), status: z.enum(['active', 'blocked']) }).parse(await req.json());
  const staff = await readJson<StaffMember[]>('staff.json', []);
  const updated = staff.map((person) => person.id === payload.id ? { ...person, status: payload.status } : person);
  await writeJson('staff.json', updated);
  await appendAudit('Update staff status', adminEmail, 'staff', payload.id, `Staff status set to ${payload.status}.`);

  return NextResponse.json({ success: true, staff: updated.find((person) => person.id === payload.id) });
}
