import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // Path to the settings file
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    
    // Save settings
    await writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully'
    });
    
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, message: 'Error saving settings' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    const fileContent = await readFile(settingsPath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    // Return defaults if file doesn't exist
    return NextResponse.json({ 
      success: true, 
      data: {
        schoolName: "Lancaster Catholic High School",
        mascot: "Crusaders",
        primaryColor: "#581C87",
        secondaryColor: "#FBBF24",
        logo: "/lchs-banner-logo.png"
      }
    });
  }
}