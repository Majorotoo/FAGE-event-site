import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDefaultEventConfig, readJson, writeJson } from '@/lib/storage';

const registrationSchema = z.object({
  firstName: z.string().min(2),
  surname: z.string().min(2),
  telephone: z.string().min(7),
  email: z.string().email(),
  association: z.string().min(2),
  userAgent: z.string().optional(),
});

export async function POST(req: Request) {
  const config = await readJson('event-config.json', await getDefaultEventConfig());

  if (!config.registrationOpen) {
    return NextResponse.json({ error: 'Registration is closed.' }, { status: 403 });
  }

  const payload = registrationSchema.parse(await req.json());
  const participants = await readJson<any[]>('participants.json', []);
  const normalizedEmail = payload.email.trim().toLowerCase();

  const duplicate = participants.some((person) => {
    const sameEmail = person.email?.trim().toLowerCase() === normalizedEmail;
    const sameTelephone = person.telephone?.trim() === payload.telephone.trim();
    return sameEmail || sameTelephone;
  });

  if (duplicate) {
    return NextResponse.json({ message: 'You have already registered for this event.' }, { status: 409 });
  }

  const entry = {
    id: `REG-${Date.now()}`,
    firstName: payload.firstName.trim(),
    surname: payload.surname.trim(),
    telephone: payload.telephone.trim(),
    email: payload.email.trim(),
    association: payload.association.trim(),
    createdAt: new Date().toISOString(),
    deviceInfo: {
      userAgent: payload.userAgent || 'Unknown',
      browser: 'Unknown',
      platform: 'Unknown',
      deviceType: 'desktop',
      screenResolution: 'Unknown',
    },
  };

  await writeJson('participants.json', [entry, ...participants]);

  return NextResponse.json({ success: true, message: 'Registration submitted successfully.' }, { status: 201 });
}
