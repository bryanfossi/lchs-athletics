import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { hashPassword } from '../../lib/auth';

const DATA_PATH = path.join(process.cwd(), 'data', 'pageOwners.json');

async function readPageOwners(): Promise<Record<string, { hash: string; salt: string }>> {
  try {
    const content = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writePageOwners(data: Record<string, { hash: string; salt: string }>) {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET — list which sports have page owners (no hashes returned)
export async function GET() {
  const owners = await readPageOwners();
  const sportsWithOwners = Object.keys(owners);
  return NextResponse.json({ success: true, sports: sportsWithOwners });
}

// POST — create or update page owner for a sport
export async function POST(request: NextRequest) {
  try {
    const { sport, password } = await request.json();

    if (!sport || !password) {
      return NextResponse.json(
        { success: false, message: 'Sport and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    const owners = await readPageOwners();
    owners[sport] = hashPassword(password);
    await writePageOwners(owners);

    return NextResponse.json({ success: true, message: `Page owner set for ${sport}.` });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error saving page owner.' },
      { status: 500 }
    );
  }
}

// DELETE — remove page owner for a sport
export async function DELETE(request: NextRequest) {
  try {
    const { sport } = await request.json();

    if (!sport) {
      return NextResponse.json(
        { success: false, message: 'Sport is required.' },
        { status: 400 }
      );
    }

    const owners = await readPageOwners();
    delete owners[sport];
    await writePageOwners(owners);

    return NextResponse.json({ success: true, message: `Page owner removed for ${sport}.` });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error removing page owner.' },
      { status: 500 }
    );
  }
}
