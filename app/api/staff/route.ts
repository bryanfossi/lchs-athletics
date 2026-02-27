import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'staff.json');

const DEFAULT_STAFF = [
  { id: 'ad',   role: 'Athletic Director',                    name: '', email: '', photo: '' },
  { id: 'aad',  role: 'Assistant Athletic Director',          name: '', email: '', photo: '' },
  { id: 'atad', role: 'Assistant to the Athletic Director',   name: '', email: '', photo: '' },
];

async function readStaff() {
  try {
    return JSON.parse(await readFile(DATA_PATH, 'utf-8'));
  } catch {
    return DEFAULT_STAFF;
  }
}

export async function GET() {
  const data = await readStaff();
  return NextResponse.json({ success: true, data });
}

// POST: receive the full staff array and write it back
export async function POST(request: NextRequest) {
  try {
    const { staff } = await request.json();
    await writeFile(DATA_PATH, JSON.stringify(staff, null, 2), 'utf-8');
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error saving staff:', error);
    return NextResponse.json({ success: false, message: 'Error saving staff data' }, { status: 500 });
  }
}
