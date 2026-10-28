import { z } from 'zod';

export type StaffStatus = 'active' | 'blocked';
export type VerificationMethod = 'qr' | 'manual';
export type AttendanceStatus = 'present' | 'late' | 'approved';

export interface StaffMember {
  id: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  photoUrl?: string;
  status: StaffStatus;
  createdAt: string;
  lastCheckIn?: string | null;
}

export interface AttendanceLog {
  id: string;
  staffId: string;
  fullName: string;
  position: string;
  department: string;
  date: string;
  timeIn: string;
  verificationMethod: VerificationMethod;
  status: AttendanceStatus;
  notes?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  entityType: string;
  entityId?: string;
  details: string;
  createdAt: string;
}

export interface AppSettings {
  lateThreshold: string;
  adminEmail: string;
}

export interface EventBrandConfig {
  eventName: string;
  logoUrl: string;
  themeColor: string;
  registrationOpen: boolean;
  lastUpdated: string;
}

export interface RegistrationEntry {
  id: string;
  firstName: string;
  surname: string;
  telephone: string;
  email: string;
  association: string;
  deviceInfo?: {
    userAgent?: string;
    browser?: string;
    platform?: string;
    deviceType?: string;
    screenResolution?: string;
  };
  createdAt: string;
}

export interface ArchivedEvent {
  id: string;
  eventName: string;
  logoUrl: string;
  archivedAt: string;
  participants: RegistrationEntry[];
}

export const eventSettingsSchema = z.object({
  eventName: z.string().min(2).default('FAGE Event'),
  logoUrl: z.string().default('/FAGE%20Logos-02.png'),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#0f172a'),
  registrationOpen: z.boolean().default(false),
  lastUpdated: z.string().default(new Date().toISOString()),
});
