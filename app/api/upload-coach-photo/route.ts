import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { validateImageFile } from '@/lib/validate-image';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sport = formData.get('sport') as string;

    if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });

    const error = validateImageFile(file);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });

    const filename = `${sport || 'coach'}.jpg`;
    const dir = path.join(process.cwd(), 'public', 'coaches');
    await mkdir(dir, { recursive: true });
    const processedBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .resize(800, 1067, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 92 })
      .toBuffer();
    await writeFile(path.join(dir, filename), processedBuffer);

    return NextResponse.json({ success: true, path: `/coaches/${filename}` });
  } catch (error) {
    console.error('Error uploading coach photo:', error);
    return NextResponse.json({ success: false, message: 'Error uploading photo' }, { status: 500 });
  }
}
