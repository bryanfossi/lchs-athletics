import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { validateImageFile } from '@/lib/validate-image';
import { readJson, writeJson } from '@/lib/json-store';

const sportsDataPath = path.join(process.cwd(), 'data', 'sportsData.json');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sport = formData.get('sport') as string;

    if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });

    const error = validateImageFile(file);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });

    const processedBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .resize(1920, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filename = `${sport}-hero.jpg`;
    await writeFile(path.join(process.cwd(), 'public', filename), processedBuffer);

    const allSportsData = await readJson<Record<string, any>>(sportsDataPath, {});
    if (!allSportsData[sport]) allSportsData[sport] = { schedule: [], roster: [] };
    allSportsData[sport].image = `/${filename}`;
    await writeJson(sportsDataPath, allSportsData);

    return NextResponse.json({ success: true, message: 'Image uploaded successfully', filename });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ success: false, message: 'Error uploading image' }, { status: 500 });
  }
}
