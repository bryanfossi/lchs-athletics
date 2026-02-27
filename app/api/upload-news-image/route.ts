import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Use JPG, PNG, or WEBP.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const filename = `/news/article-${Date.now()}.jpg`;
    const savePath = path.join(process.cwd(), 'public', filename);

    await mkdir(path.dirname(savePath), { recursive: true });
    const bytes = await file.arrayBuffer();
    const processedBuffer = await sharp(Buffer.from(bytes))
      .resize(1200, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    await writeFile(savePath, processedBuffer);

    return NextResponse.json({ success: true, filename });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error uploading image.' },
      { status: 500 }
    );
  }
}
