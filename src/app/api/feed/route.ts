// src/app/api/feed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { feedService } from "@src/features/feed/service/server";

// GET /api/feed - ดึงข้อมูล feed items ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userId = parseInt(searchParams.get("userId") || "0");

    const result = await feedService.getFeedItems({
      page,
      limit,
      userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}

// POST /api/feed - สร้าง feed item ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const feedItem = await feedService.createFeedItem(body);

    return NextResponse.json(feedItem);
  } catch (error) {
    console.error("Error creating feed item:", error);
    return NextResponse.json(
      { error: "Failed to create feed item" },
      { status: 500 }
    );
  }
}
