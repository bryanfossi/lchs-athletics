import { NextRequest, NextResponse } from 'next/server';

const LOGIN_PATH = '/admin-login';
const ADMIN_COOKIE = 'admin_session';
const SPORT_COOKIE = 'sport_session';
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

async function computeHmac(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isValidAdminToken(token: string): Promise<boolean> {
  const secret = process.env.COOKIE_SECRET;
  if (!secret || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const expectedSig = await computeHmac(secret, timestamp);

  if (signature.length !== expectedSig.length) return false;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  if (diff !== 0) return false;

  const issuedAt = parseInt(timestamp, 10);
  return !isNaN(issuedAt) && Date.now() - issuedAt < EIGHT_HOURS_MS;
}

// Sport token format: "{sport}:{timestamp}.{hmac_of_payload}"
async function isValidSportToken(token: string): Promise<boolean> {
  const secret = process.env.COOKIE_SECRET;
  if (!secret || !token) return false;

  const dotIdx = token.lastIndexOf('.');
  if (dotIdx === -1) return false;

  const payload = token.substring(0, dotIdx);
  const signature = token.substring(dotIdx + 1);
  const expectedSig = await computeHmac(secret, payload);

  if (signature.length !== expectedSig.length) return false;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  if (diff !== 0) return false;

  const colonIdx = payload.lastIndexOf(':');
  if (colonIdx === -1) return false;
  const timestamp = parseInt(payload.substring(colonIdx + 1), 10);
  return !isNaN(timestamp) && Date.now() - timestamp < EIGHT_HOURS_MS;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value ?? '';
  const sportToken = request.cookies.get(SPORT_COOKIE)?.value ?? '';

  const isAdmin = await isValidAdminToken(adminToken);
  const isSportOwner = !isAdmin && await isValidSportToken(sportToken);
  const hasAnySession = isAdmin || isSportOwner;

  // /system-admin requires admin session only
  const isSystemAdminRoute =
    pathname === '/system-admin' || pathname.startsWith('/system-admin/');
  if (isSystemAdminRoute && !isAdmin) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin allows admin OR page owner
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  if (isAdminRoute && !hasAnySession) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authenticated users away from the login page
  if (pathname === LOGIN_PATH && hasAnySession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/system-admin', '/system-admin/:path*', '/admin-login'],
};
