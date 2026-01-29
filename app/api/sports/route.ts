import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { sport, type, data } = await request.json();
    
    // Path to the data file
    const dataFilePath = path.join(process.cwd(), 'data', 'sportsData.json');
    
    // Read existing data
    let allSportsData: any = {};
    try {
      const fileContent = await readFile(dataFilePath, 'utf-8');
      allSportsData = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, start fresh
      allSportsData = {};
    }
    
    // Initialize sport if it doesn't exist
    if (!allSportsData[sport]) {
      allSportsData[sport] = {
        schedule: [],
        roster: []
      };
    }
    
    // Handle different update types
    if (type === 'info') {
      // Update coach, coachEmail, and description
      if (data.coach !== undefined) {
        allSportsData[sport].coach = data.coach;
      }
      if (data.coachEmail !== undefined) {
        allSportsData[sport].coachEmail = data.coachEmail;
      }
      if (data.description !== undefined) {
        allSportsData[sport].description = data.description;
      }
    } else {
      // Update schedule or roster
      allSportsData[sport][type] = data;
    }
    
    // Save back to file
    await writeFile(dataFilePath, JSON.stringify(allSportsData, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: `${type} updated successfully for ${sport}` 
    });
    
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { success: false, message: 'Error saving data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dataFilePath = path.join(process.cwd(), 'data', 'sportsData.json');
    const fileContent = await readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: true, data: {} }
    );
  }
}