import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const championsPath = path.join(process.cwd(), 'data', 'championships.json');

async function readData(): Promise<any> {
  try {
    return JSON.parse(await readFile(championsPath, 'utf-8'));
  } catch {
    return { sports: [], individual: { league: [], district: [], state: [] }, heroImages: [] };
  }
}

async function writeData(data: any) {
  await writeFile(championsPath, JSON.stringify(data, null, 2), 'utf-8');
}

// POST: upload a new championship hero image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const posX = formData.get('posX') as string || '50';
    const posY = formData.get('posY') as string || '30';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Use JPG, PNG, or WEBP.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const processedBuffer = await sharp(Buffer.from(bytes))
      .resize(1920, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filename = `champ-hero-${Date.now()}.jpg`;
    await writeFile(path.join(process.cwd(), 'public', filename), processedBuffer);

    const data = await readData();
    if (!Array.isArray(data.heroImages)) data.heroImages = [];
    data.heroImages.push({ path: `/${filename}`, position: `${posX}% ${posY}%` });
    await writeData(data);

    return NextResponse.json({ success: true, heroImages: data.heroImages });
  } catch (error) {
    console.error('Error uploading championship hero:', error);
    return NextResponse.json({ success: false, message: 'Error uploading image' }, { status: 500 });
  }
}

// DELETE: remove a championship hero image by path
export async function DELETE(request: NextRequest) {
  try {
    const { imagePath } = await request.json();

    const data = await readData();
    if (Array.isArray(data.heroImages)) {
      data.heroImages = data.heroImages.filter((img: any) => img.path !== imagePath);
    }
    await writeData(data);

    return NextResponse.json({ success: true, heroImages: data.heroImages || [] });
  } catch (error) {
    console.error('Error removing championship hero:', error);
    return NextResponse.json({ success: false, message: 'Error removing image' }, { status: 500 });
  }
}
