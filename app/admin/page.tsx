import { redirect } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/auth';
import AdminDashboard from '@/components/admin-dashboard';

export default async function AdminPage() {
  const adminEmail = await getCurrentAdminEmail();

  if (!adminEmail) {
    redirect('/admin/login');
  }

  return <AdminDashboard adminEmail={adminEmail} />;
}
