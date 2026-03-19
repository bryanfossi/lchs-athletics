import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readJson, writeJson } from '@/lib/json-store';

const FILE = path.join(process.cwd(), 'data', 'championships.json');

interface ChampionshipSport {
  slug: string;
  label: string;
  achievements: { id: string; title: string; years: string }[];
}
interface ChampionshipData {
  sports: ChampionshipSport[];
  individual: { league: string[]; district: string[]; state: string[] };
  heroImages?: { path: string; position: string }[];
}
const DEFAULT_DATA: ChampionshipData = { sports: [], individual: { league: [], district: [], state: [] } };

async function readData() {
  return readJson(FILE, DEFAULT_DATA);
}

export async function GET() {
  return NextResponse.json({ success: true, data: await readData() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await readData();

    if (body.action === 'sport') {
      const idx = data.sports.findIndex((s) => s.slug === body.slug);
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

    await writeJson(FILE, data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Error saving championships data' }, { status: 500 });
  }
}
