import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken, ADMIN_COOKIE, EIGHT_HOURS_SECONDS } from '../../lib/auth';

// POST /api/admin-auth — validate password and set session cookie
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Server is not configured for authentication.' },
        { status: 500 }
      );
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password.' },
        { status: 401 }
      );
    }

    const token = generateAdminToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: EIGHT_HOURS_SECONDS,
      // secure: true, // uncomment in production (requires HTTPS)
    });
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request.' },
      { status: 400 }
    );
  }
}

// DELETE /api/admin-auth — clear session cookie (logout)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
