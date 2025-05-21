// src/app/api/feed/[id]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { likeService } from "@src/features/feed/service/server";

// POST /api/feed/[id]/like - กดไลค์
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const like = await likeService.toggleLike({
      feedItemId: parseInt(id),
      userId: body.userId,
    });

    return NextResponse.json(like);
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

// GET /api/feed/[id]/like - ดึงรายการคนที่กดไลค์
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const likes = await likeService.getLikesByFeedItem(parseInt(id));
    return NextResponse.json(likes);
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}
