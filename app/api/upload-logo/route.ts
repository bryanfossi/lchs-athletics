import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload JPG, PNG, or SVG.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file extension
    const ext = file.type === 'image/svg+xml' ? 'svg' : file.type.split('/')[1];
    const filename = `school-logo.${ext}`;
    
    // Save to public directory
    const publicPath = path.join(process.cwd(), 'public', filename);
    await writeFile(publicPath, buffer);

    return NextResponse.json({ 
      success: true, 
      message: 'Logo uploaded successfully',
      filename: `/${filename}`
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { success: false, message: 'Error uploading logo' },
      { status: 500 }
    );
  }
}