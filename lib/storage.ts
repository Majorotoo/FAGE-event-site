import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function ensureFile(fileName: string, fallback: unknown) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, fileName);
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
  }
}

export async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  await ensureFile(fileName, fallback);
  const filePath = path.join(DATA_DIR, fileName);
  const content = await fs.readFile(filePath, 'utf8');

  if (!content.trim()) {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

export async function writeJson<T>(fileName: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function appendAudit(
  action: string,
  actor: string,
  entityType: string,
  entityId: string | undefined,
  details: string,
) {
  const auditLog = await readJson<unknown[]>('audit.json', []);
  const newEntry = {
    id: `AUD-${Date.now()}`,
    action,
    actor,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };

  await writeJson('audit.json', [...(auditLog as any[]), newEntry]);
}

export async function getDefaultSettings() {
  return {
    lateThreshold: '08:00',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@fage.com',
  } as const;
}
