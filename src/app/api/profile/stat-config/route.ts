import { NextRequest, NextResponse } from 'next/server';
import { getStatConfig } from '@src/features/profile/service/server';

export async function GET(request: NextRequest) {
  try {
    // Get stat config
    const config = await getStatConfig();

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error in stat config API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stat config' },
      { status: 500 }
    );
  }
}
