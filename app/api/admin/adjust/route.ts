import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminEmail } from '@/lib/auth';
import { appendAudit, getDefaultSettings, writeJson } from '@/lib/storage';

const settingsSchema = z.object({
  lateThreshold: z.string().optional(),
  adminEmail: z.string().email().optional(),
});

export async function GET() {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await getDefaultSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = settingsSchema.parse(await req.json());
  const settings = await getDefaultSettings();
  const nextSettings = { ...settings, ...payload };

  await writeJson('settings.json', nextSettings);
  await appendAudit('Update settings', adminEmail, 'settings', 'lateThreshold', `Late threshold updated to ${nextSettings.lateThreshold}.`);

  return NextResponse.json(nextSettings);
}
