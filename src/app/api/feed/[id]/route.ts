// src/app/api/feed/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { feedService } from "@src/features/feed/service/server";

// GET /api/feed/[id] - ดึงข้อมูล feed item เดียว
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feedItem = await feedService.getFeedItemById(parseInt(params.id));
    
    if (!feedItem) {
      return NextResponse.json(
        { error: "Feed item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(feedItem);
  } catch (error) {
    console.error("Error fetching feed item:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed item" },
      { status: 500 }
    );
  }
}

// DELETE /api/feed/[id] - ลบ feed item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await feedService.deleteFeedItem(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feed item:", error);
    return NextResponse.json(
      { error: "Failed to delete feed item" },
      { status: 500 }
    );
  }
}