import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { validateImageFile } from '@/lib/validate-image';
import { readJson, writeJson } from '@/lib/json-store';

const championsPath = path.join(process.cwd(), 'data', 'championships.json');
const DEFAULT_DATA = { sports: [], individual: { league: [], district: [], state: [] }, heroImages: [] };

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const posX = (formData.get('posX') as string) || '50';
    const posY = (formData.get('posY') as string) || '30';

    if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });

    const error = validateImageFile(file);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });

    const processedBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .resize(1920, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filename = `champ-hero-${Date.now()}.jpg`;
    await writeFile(path.join(process.cwd(), 'public', filename), processedBuffer);

    const data = await readJson<any>(championsPath, DEFAULT_DATA);
    if (!Array.isArray(data.heroImages)) data.heroImages = [];
    data.heroImages.push({ path: `/${filename}`, position: `${posX}% ${posY}%` });
    await writeJson(championsPath, data);

    return NextResponse.json({ success: true, heroImages: data.heroImages });
  } catch (error) {
    console.error('Error uploading championship hero:', error);
    return NextResponse.json({ success: false, message: 'Error uploading image' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { imagePath } = await request.json();
    const data = await readJson<any>(championsPath, DEFAULT_DATA);
    if (Array.isArray(data.heroImages)) {
      data.heroImages = data.heroImages.filter((img: any) => img.path !== imagePath);
    }
    await writeJson(championsPath, data);
    return NextResponse.json({ success: true, heroImages: data.heroImages || [] });
  } catch (error) {
    console.error('Error removing championship hero:', error);
    return NextResponse.json({ success: false, message: 'Error removing image' }, { status: 500 });
  }
}
