import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readJson, writeJson } from '@/lib/json-store';

const DATA_PATH = path.join(process.cwd(), 'data', 'staff.json');

const DEFAULT_STAFF = [
  { id: 'ad',   role: 'Athletic Director',                  name: '', email: '', photo: '' },
  { id: 'aad',  role: 'Assistant Athletic Director',        name: '', email: '', photo: '' },
  { id: 'atad', role: 'Assistant to the Athletic Director', name: '', email: '', photo: '' },
];

export async function GET() {
  const data = await readJson(DATA_PATH, DEFAULT_STAFF);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  try {
    const { staff } = await request.json();
    await writeJson(DATA_PATH, staff);
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error saving staff:', error);
    return NextResponse.json({ success: false, message: 'Error saving staff data' }, { status: 500 });
  }
}
