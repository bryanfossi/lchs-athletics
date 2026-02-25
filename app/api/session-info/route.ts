import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, SPORT_COOKIE, validateAdminToken, validateSportToken } from '../../lib/auth';

export async function GET(request: NextRequest) {
  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value ?? '';
  const sportToken = request.cookies.get(SPORT_COOKIE)?.value ?? '';

  if (adminToken && validateAdminToken(adminToken)) {
    return NextResponse.json({ role: 'admin' });
  }

  if (sportToken) {
    const result = validateSportToken(sportToken);
    if (result.valid && result.sport) {
      return NextResponse.json({ role: 'pageowner', sport: result.sport });
    }
  }

  return NextResponse.json({ role: 'none' });
}
