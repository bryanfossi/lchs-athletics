import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { validateImageFile } from '@/lib/validate-image';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });

    const error = validateImageFile(file);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });

    const filename = `/news/article-${Date.now()}.jpg`;
    const savePath = path.join(process.cwd(), 'public', filename);
    await mkdir(path.dirname(savePath), { recursive: true });

    const processedBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .resize(1200, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    await writeFile(savePath, processedBuffer);

    return NextResponse.json({ success: true, filename });
  } catch {
    return NextResponse.json({ success: false, message: 'Error uploading image.' }, { status: 500 });
  }
}
