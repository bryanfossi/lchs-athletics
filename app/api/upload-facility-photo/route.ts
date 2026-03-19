import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { validateImageFile } from '@/lib/validate-image';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });

    const error = validateImageFile(file);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });

    const filename = `facility-${Date.now()}.jpg`;
    const dir = path.join(process.cwd(), 'public', 'facilities');
    await mkdir(dir, { recursive: true });
    const processedBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .resize(1200, null, { withoutEnlargement: true })
      .jpeg({ quality: 92 })
      .toBuffer();
    await writeFile(path.join(dir, filename), processedBuffer);

    return NextResponse.json({ success: true, path: `/facilities/${filename}` });
  } catch (error) {
    console.error('Error uploading facility photo:', error);
    return NextResponse.json({ success: false, message: 'Error uploading photo' }, { status: 500 });
  }
}
