import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

async function readSettings(): Promise<any> {
  try {
    return JSON.parse(await readFile(settingsPath, 'utf-8'));
  } catch {
    return {};
  }
}

async function writeSettings(settings: any) {
  await writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

// POST: upload a new home hero image
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
      return NextResponse.json({ success: false, message: 'Invalid file type. Please upload JPG, PNG, or WEBP.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rawExt = file.type.split('/')[1];
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const filename = `home-hero-${Date.now()}.${ext}`;
    await writeFile(path.join(process.cwd(), 'public', filename), buffer);

    const settings = await readSettings();
    if (!Array.isArray(settings.heroImages)) settings.heroImages = [];
    settings.heroImages.push({ path: `/${filename}`, position: `${posX}% ${posY}%` });
    await writeSettings(settings);

    return NextResponse.json({ success: true, heroImages: settings.heroImages });
  } catch (error) {
    console.error('Error uploading home hero:', error);
    return NextResponse.json({ success: false, message: 'Error uploading image' }, { status: 500 });
  }
}

// DELETE: remove a home hero image by path
export async function DELETE(request: NextRequest) {
  try {
    const { imagePath } = await request.json();

    const settings = await readSettings();
    if (Array.isArray(settings.heroImages)) {
      settings.heroImages = settings.heroImages.filter((img: any) => img.path !== imagePath);
    }
    await writeSettings(settings);

    return NextResponse.json({ success: true, heroImages: settings.heroImages || [] });
  } catch (error) {
    console.error('Error removing home hero:', error);
    return NextResponse.json({ success: false, message: 'Error removing image' }, { status: 500 });
  }
}
