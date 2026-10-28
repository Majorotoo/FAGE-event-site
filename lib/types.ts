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
