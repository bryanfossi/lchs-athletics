import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import {
  verifyPassword,
  generateSportToken,
  SPORT_COOKIE,
  EIGHT_HOURS_SECONDS,
} from '../../lib/auth';

const DATA_PATH = path.join(process.cwd(), 'data', 'pageOwners.json');

async function readPageOwners(): Promise<Record<string, { hash: string; salt: string }>> {
  try {
    const content = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// POST — validate page owner credentials, set sport_session cookie
export async function POST(request: NextRequest) {
  try {
    const { sport, password } = await request.json();

    if (!sport || !password) {
      return NextResponse.json(
        { success: false, message: 'Sport and password are required.' },
        { status: 400 }
      );
    }

    const owners = await readPageOwners();
    const owner = owners[sport];

    if (!owner || !verifyPassword(password, owner.hash, owner.salt)) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password.' },
        { status: 401 }
      );
    }

    const token = generateSportToken(sport);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SPORT_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: EIGHT_HOURS_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request.' },
      { status: 400 }
    );
  }
}

// DELETE — clear sport_session cookie (logout)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SPORT_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
