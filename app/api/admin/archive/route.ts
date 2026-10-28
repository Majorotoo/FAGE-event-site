import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminEmail } from '@/lib/auth';
import { archiveActiveParticipants, getDefaultEventConfig, readJson, saveEventConfig } from '@/lib/storage';

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

  const payload = updateSchema.parse(await req.json());
  const config = await readJson('event-config.json', await getDefaultEventConfig());
  const nextConfig = {
    ...config,
    ...payload,
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

  const { action } = await req.json();
  if (action !== 'archive') {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  const config = await readJson('event-config.json', await getDefaultEventConfig());
  const result = await archiveActiveParticipants(config.eventName, config.logoUrl);

  return NextResponse.json({
    success: true,
    archived: result.archived,
    archive: result.archive,
  });
}
