import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'championships.json');

async function readData() {
  try {
    return JSON.parse(await readFile(FILE, 'utf-8'));
  } catch {
    return { sports: [], individual: { league: [], district: [], state: [] } };
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: await readData() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await readData();

    if (body.action === 'sport') {
      const idx = data.sports.findIndex((s: { slug: string }) => s.slug === body.slug);
      if (idx >= 0) {
        data.sports[idx].achievements = body.achievements;
      } else {
        data.sports.push({ slug: body.slug, label: body.label || body.slug, achievements: body.achievements });
      }
    } else if (body.action === 'individual') {
      data.individual[body.section as 'league' | 'district' | 'state'] = body.entries;
    } else {
      return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
    }

    await writeFile(FILE, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Error saving championships data' }, { status: 500 });
  }
}
