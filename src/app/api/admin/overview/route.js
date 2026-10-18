import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth';
import { getAdminOverview } from '../../../../../lib/store';

export async function GET(request) {
  const { error } = requireAdmin(request);
  if (error) return error;
  try {
    const data = await getAdminOverview();
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
