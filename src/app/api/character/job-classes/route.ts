import { NextResponse } from 'next/server';
import { getAllJobClasses } from '@src/features/character/service/server';

export async function GET() {
  try {
    const jobClasses = await getAllJobClasses();
    return NextResponse.json(jobClasses);
  } catch (error) {
    console.error('Error fetching job classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job class data' },
      { status: 500 }
    );
  }
}
