import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, createSessionToken, sessionCookieOptions, validateAdminLogin } from '../../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    if (!validateAdminLogin(email, password)) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }
    const token = createSessionToken(email.toLowerCase());
    const res = NextResponse.json({ success: true, email: email.toLowerCase() });
    res.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
