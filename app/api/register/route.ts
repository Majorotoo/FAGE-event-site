import { NextResponse } from 'next/server';
import { getCurrentAdminEmail } from '@/lib/auth';
import { archiveActiveParticipants, getDefaultEventConfig, readJson } from '@/lib/storage';

export async function POST() {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await readJson('event-config.json', await getDefaultEventConfig());
  const result = await archiveActiveParticipants(config.eventName, config.logoUrl);

  return NextResponse.json({
    success: true,
    archived: result.archived,
    archive: result.archive,
  });
}
