import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sport = formData.get('sport') as string;

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

    const filename = `${sport || 'coach'}.jpg`;
    const dir = path.join(process.cwd(), 'public', 'coaches');
    await mkdir(dir, { recursive: true });
    const processedBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    await writeFile(path.join(dir, filename), processedBuffer);

    return NextResponse.json({ success: true, path: `/coaches/${filename}` });
  } catch (error) {
    console.error('Error uploading coach photo:', error);
    return NextResponse.json({ success: false, message: 'Error uploading photo' }, { status: 500 });
  }
}
