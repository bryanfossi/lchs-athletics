import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { validateImageFile } from '@/lib/validate-image';
import { readJson, writeJson } from '@/lib/json-store';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const posX = (formData.get('posX') as string) || '50';
    const posY = (formData.get('posY') as string) || '30';

    if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });

    const error = validateImageFile(file);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });

    const rawExt = file.type.split('/')[1];
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const filename = `home-hero-${Date.now()}.${ext}`;
    await writeFile(path.join(process.cwd(), 'public', filename), Buffer.from(await file.arrayBuffer()));

    const settings = await readJson<any>(settingsPath, {});
    if (!Array.isArray(settings.heroImages)) settings.heroImages = [];
    settings.heroImages.push({ path: `/${filename}`, position: `${posX}% ${posY}%` });
    await writeJson(settingsPath, settings);

    return NextResponse.json({ success: true, heroImages: settings.heroImages });
  } catch (error) {
    console.error('Error uploading home hero:', error);
    return NextResponse.json({ success: false, message: 'Error uploading image' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { imagePath } = await request.json();
    const settings = await readJson<any>(settingsPath, {});
    if (Array.isArray(settings.heroImages)) {
      settings.heroImages = settings.heroImages.filter((img: any) => img.path !== imagePath);
    }
    await writeJson(settingsPath, settings);
    return NextResponse.json({ success: true, heroImages: settings.heroImages || [] });
  } catch (error) {
    console.error('Error removing home hero:', error);
    return NextResponse.json({ success: false, message: 'Error removing image' }, { status: 500 });
  }
}
