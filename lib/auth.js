import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'mg_admin_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'massa-gizey-admin-dev-secret';
}

export function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || 'admin@dictionary.com').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'admin123'
  };
}

function sign(payloadB64) {
  return createHmac('sha256', secret()).update(payloadB64).digest('base64url');
}

export function createSessionToken(email) {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + SESSION_MS })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data?.email || data.exp < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function validateAdminLogin(email, password) {
  const creds = getAdminCredentials();
  const emailOk = safeEqual(String(email || '').trim().toLowerCase(), creds.email);
  const passwordOk = safeEqual(String(password || ''), creds.password);
  return emailOk && passwordOk;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MS / 1000
  };
}

export function getSessionFromRequest(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

export function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export function requireAdmin(request) {
  const session = getSessionFromRequest(request);
  if (!session) return { session: null, error: unauthorized() };
  return { session, error: null };
}
