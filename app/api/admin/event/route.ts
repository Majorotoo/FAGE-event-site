import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminEmail } from '@/lib/auth';
import { archiveActiveParticipants, getDefaultEventConfig, readJson, saveEventConfig, writeJson } from '@/lib/storage';

const updateSchema = z.object({
  eventName: z.string().min(2).optional(),
  logoUrl: z.string().min(1).optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  registrationOpen: z.boolean().optional(),
});

export async function GET() {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [config, participants, archives] = await Promise.all([
    readJson('event-config.json', await getDefaultEventConfig()),
    readJson('participants.json', []),
    readJson('archives.json', []),
  ]);

  return NextResponse.json({ config, participants, archives });
}

export async function PATCH(req: Request) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = updateSchema.parse(await req.json());
  const config = await readJson('event-config.json', await getDefaultEventConfig());
  const nextConfig = {
    ...config,
    ...body,
    lastUpdated: new Date().toISOString(),
  };

  await saveEventConfig(nextConfig);

  return NextResponse.json({ config: nextConfig });
}

export async function POST(req: Request) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const action = body?.action;

  if (action === 'archive') {
    const config = await readJson('event-config.json', await getDefaultEventConfig());
    const result = await archiveActiveParticipants(config.eventName, config.logoUrl);
    return NextResponse.json({ success: true, archived: result.archived, archive: result.archive });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
