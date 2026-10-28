import { NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { readJson } from '@/lib/storage';
import { getCurrentAdminEmail } from '@/lib/auth';
import { generateQrPayload } from '@/lib/security';
import type { StaffMember } from '@/lib/types';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const staff = await readJson<StaffMember[]>('staff.json', []);
  const person = staff.find((entry) => entry.id === params.id);

  if (!person) {
    return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
  }

  const qrPayload = generateQrPayload(person.id);
  const qrImage = await QRCode.toDataURL(qrPayload, { width: 220, margin: 1 });

  const styles = StyleSheet.create({
    page: { padding: 24, backgroundColor: '#f8fafc' },
    card: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      borderColor: '#dbeafe',
      borderWidth: 1,
      borderRadius: 18,
      padding: 18,
      alignItems: 'center',
      gap: 16,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 14,
      backgroundColor: '#dbeafe',
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: { flex: 1 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
    text: { fontSize: 11, color: '#334155', marginBottom: 2 },
    qr: { width: 120, height: 120, borderRadius: 10 },
    tiny: { fontSize: 9, letterSpacing: 2, color: '#64748b', marginTop: 8 },
  });

  const BadgeDoc = () => (
    <Document>
      <Page size="A6" style={styles.page}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text>{person.fullName.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>{person.fullName}</Text>
            <Text style={styles.text}>{person.position}</Text>
            <Text style={styles.text}>{person.department}</Text>
            <Text style={styles.text}>{person.email}</Text>
            <Text style={styles.tiny}>FAGE STAFF ID</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a' }}>{person.id}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>QR</Text>
            <Text>{qrImage}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  const buffer = await pdf(<BadgeDoc />).toBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${person.id}-badge.pdf"`,
    },
  });
}
