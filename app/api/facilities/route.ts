import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'facilities.json');

async function readFacilities() {
  try {
    return JSON.parse(await readFile(DATA_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

export async function GET() {
  const data = await readFacilities();
  return NextResponse.json({ success: true, data });
}

// POST: upsert or delete a facility
// body: { action: "upsert" | "delete", facility: { id, name, address, description, photo } }
export async function POST(request: NextRequest) {
  try {
    const { action, facility } = await request.json();
    let facilities = await readFacilities();

    if (action === 'upsert') {
      const idx = facilities.findIndex((f: any) => f.id === facility.id);
      if (idx >= 0) {
        facilities[idx] = facility;
      } else {
        facilities.push(facility);
      }
    } else if (action === 'delete') {
      facilities = facilities.filter((f: any) => f.id !== facility.id);
    }

    await writeFile(DATA_PATH, JSON.stringify(facilities, null, 2), 'utf-8');
    return NextResponse.json({ success: true, data: facilities });
  } catch (error) {
    console.error('Error saving facilities:', error);
    return NextResponse.json({ success: false, message: 'Error saving facilities data' }, { status: 500 });
  }
}
