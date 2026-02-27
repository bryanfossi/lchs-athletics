import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sport = formData.get('sport') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload JPG, PNG, or WEBP.' },
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

    // Convert file to buffer and resize
    const bytes = await file.arrayBuffer();
    const processedBuffer = await sharp(Buffer.from(bytes))
      .resize(1920, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filename = `${sport}-hero.jpg`;

    // Save to public directory
    const publicPath = path.join(process.cwd(), 'public', filename);
    await writeFile(publicPath, processedBuffer);

    // Update sports data to reference new image
    const dataFilePath = path.join(process.cwd(), 'data', 'sportsData.json');
    const { readFile } = await import('fs/promises');
    
    let allSportsData: any = {};
    try {
      const fileContent = await readFile(dataFilePath, 'utf-8');
      allSportsData = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet
      allSportsData = {};
    }

    // Initialize sport if needed
    if (!allSportsData[sport]) {
      allSportsData[sport] = { schedule: [], roster: [] };
    }

    // Update image path
allSportsData[sport].image = `/${filename}`;

// Debug logging
console.log('About to save data for sport:', sport);
console.log('Image path:', allSportsData[sport].image);
console.log('Full data:', JSON.stringify(allSportsData, null, 2));

// Save updated data
await writeFile(dataFilePath, JSON.stringify(allSportsData, null, 2), 'utf-8');

console.log('File written successfully!');
    return NextResponse.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      filename: filename
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, message: 'Error uploading image' },
      { status: 500 }
    );
  }
}