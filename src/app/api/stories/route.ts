// src/app/api/stories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { storyService } from "@src/features/feed/service/server";

// GET /api/stories - ดึง stories ที่ยังไม่หมดอายุ
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = parseInt(searchParams.get("userId") || "1");

    const stories = await storyService.getActiveStories(userId);
    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

// POST /api/stories - สร้าง story ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const story = await storyService.createStory(body);

    return NextResponse.json(story);
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
