import { NextRequest, NextResponse } from 'next/server';
import { getProfile } from '@src/features/profile/service/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the id
    const { id } = await params;
    
    console.log('API Route called with id:', id);

    // Validate parameters
    if (!id) {
      console.log('User ID is missing');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`Getting profile for userId: ${id}`);

    // Get profile
    const profileData = await getProfile({ userId: id });

    console.log('Profile data retrieved successfully:', !!profileData);

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error in profile API:', error);

    // Need to get id for error logging
    let userId = 'unknown';
    try {
      const { id } = await params;
      userId = id;
    } catch (e) {
      // If we can't get the id, just use 'unknown'
    }

    if ((error as Error).message === 'Profile not found') {
      console.log('Profile not found for id:', userId);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}