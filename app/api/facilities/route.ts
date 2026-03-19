import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readJson, writeJson } from '@/lib/json-store';

const DATA_PATH = path.join(process.cwd(), 'data', 'facilities.json');

export async function GET() {
  const data = await readJson(DATA_PATH, []);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  try {
    const { action, facility } = await request.json();
    let facilities = await readJson<any[]>(DATA_PATH, []);

    if (action === 'upsert') {
      const idx = facilities.findIndex((f) => f.id === facility.id);
      if (idx >= 0) {
        facilities[idx] = facility;
      } else {
        facilities.push(facility);
      }
    } else if (action === 'delete') {
      facilities = facilities.filter((f) => f.id !== facility.id);
    }

    await writeJson(DATA_PATH, facilities);
    return NextResponse.json({ success: true, data: facilities });
  } catch (error) {
    console.error('Error saving facilities:', error);
    return NextResponse.json({ success: false, message: 'Error saving facilities data' }, { status: 500 });
  }
}
