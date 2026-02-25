import { createHmac, pbkdf2Sync, randomBytes } from 'crypto';

export const ADMIN_COOKIE = 'admin_session';
export const SPORT_COOKIE = 'sport_session';
export const EIGHT_HOURS_SECONDS = 8 * 60 * 60;
const EIGHT_HOURS_MS = EIGHT_HOURS_SECONDS * 1000;

// ─── Admin tokens ─────────────────────────────────────────────────────────────
// Format: "{timestamp}.{hmac_of_timestamp}"

export function generateAdminToken(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) throw new Error('COOKIE_SECRET env var is not set');
  const timestamp = Date.now().toString();
  const signature = createHmac('sha256', secret).update(timestamp).digest('hex');
  return `${timestamp}.${signature}`;
}

export function validateAdminToken(token: string): boolean {
  const secret = process.env.COOKIE_SECRET;
  if (!secret || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [timestamp, signature] = parts;
  const expected = createHmac('sha256', secret).update(timestamp).digest('hex');
  if (signature.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return false;
  const issuedAt = parseInt(timestamp, 10);
  return !isNaN(issuedAt) && Date.now() - issuedAt < EIGHT_HOURS_MS;
}

// ─── Sport tokens ─────────────────────────────────────────────────────────────
// payload = "{sport}:{timestamp}", token = "{payload}.{hmac_of_payload}"

export function generateSportToken(sport: string): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) throw new Error('COOKIE_SECRET env var is not set');
  const payload = `${sport}:${Date.now()}`;
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export function validateSportToken(token: string): { valid: boolean; sport?: string } {
  const secret = process.env.COOKIE_SECRET;
  if (!secret || !token) return { valid: false };
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx === -1) return { valid: false };
  const payload = token.substring(0, dotIdx);
  const signature = token.substring(dotIdx + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  if (signature.length !== expected.length) return { valid: false };
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return { valid: false };
  const colonIdx = payload.lastIndexOf(':');
  if (colonIdx === -1) return { valid: false };
  const sport = payload.substring(0, colonIdx);
  const timestamp = parseInt(payload.substring(colonIdx + 1), 10);
  if (isNaN(timestamp) || Date.now() - timestamp > EIGHT_HOURS_MS) return { valid: false };
  return { valid: true, sport };
}

// ─── Password hashing (PBKDF2-SHA512) ────────────────────────────────────────

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  if (hash.length !== verifyHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ verifyHash.charCodeAt(i);
  }
  return diff === 0;
}
