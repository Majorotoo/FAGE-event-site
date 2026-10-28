import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { appendAudit, getDefaultSettings, readJson, writeJson } from '@/lib/storage';
import { getCurrentAdminEmail } from '@/lib/auth';
import type { AttendanceLog } from '@/lib/types';

export async function GET() {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [logs, settings] = await Promise.all([
    readJson<AttendanceLog[]>('logs.json', []),
    getDefaultSettings(),
  ]);

  return NextResponse.json({ logs, settings, today: new Date().toISOString().slice(0, 10) });
}

const updateSettingsSchema = z.object({
  lateThreshold: z.string().optional(),
  adminEmail: z.string().email().optional(),
});

export async function PATCH(req: Request) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = updateSettingsSchema.parse(await req.json());
  const settings = await getDefaultSettings();
  const nextSettings = { ...settings, ...payload };
  await writeJson('settings.json', nextSettings);
  await appendAudit('Update settings', adminEmail, 'settings', 'lateThreshold', `Late threshold set to ${nextSettings.lateThreshold}.`);

  return NextResponse.json(nextSettings);
}

export async function POST() {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const logs = await readJson<AttendanceLog[]>('logs.json', []);
  const today = new Date().toISOString().slice(0, 10);
  const todaysEntries = logs.filter((entry) => entry.date === today);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Daily Attendance');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 18 },
    { header: 'Time In', key: 'timeIn', width: 14 },
    { header: 'Staff ID', key: 'staffId', width: 20 },
    { header: 'Full Name', key: 'fullName', width: 24 },
    { header: 'Position', key: 'position', width: 22 },
    { header: 'Verification Method', key: 'verificationMethod', width: 18 },
    { header: 'Status', key: 'status', width: 14 },
  ];

  todaysEntries.forEach((entry) => {
    sheet.addRow({
      date: entry.date,
      timeIn: entry.timeIn,
      staffId: entry.staffId,
      fullName: entry.fullName,
      position: entry.position,
      verificationMethod: entry.verificationMethod,
      status: entry.status,
    });
  });

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const outputPath = path.join(process.cwd(), 'data', `attendance-${today}.xlsx`);
  await fs.writeFile(outputPath, Buffer.from(buffer));

  const settings = await getDefaultSettings();
  const adminDestination = settings.adminEmail || process.env.ADMIN_EMAIL || 'admin@fage.com';

  let emailSent = false;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transport.sendMail({
      from: process.env.SMTP_FROM || 'FAGE Attendance <admin@fage.com>',
      to: adminDestination,
      subject: `FAGE Daily Attendance Report - ${today}`,
      text: 'Please find attached the daily attendance report.',
      attachments: [{ filename: `attendance-${today}.xlsx`, path: outputPath }],
    });

    emailSent = true;
  }

  await appendAudit('Generate report', adminEmail, 'attendance', 'daily-report', `Daily attendance report generated for ${today}.`);

  return NextResponse.json({ success: true, sent: emailSent, file: `attendance-${today}.xlsx`, totalEntries: todaysEntries.length });
}
