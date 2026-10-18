import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, verifySessionToken } from '../../../../lib/auth';
import { AdminShell } from '../../../components/admin/AdminShell';

export default async function ConsoleLayout({ children }) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) redirect('/admin/login');
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
