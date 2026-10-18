import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth';

export async function GET(request) {
  const { session, error } = requireAdmin(request);
  if (error) return error;
  return NextResponse.json({ success: true, email: session.email });
}
