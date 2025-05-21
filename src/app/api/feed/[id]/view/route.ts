// src/app/api/stories/[id]/view/route.ts
import { NextRequest, NextResponse } from "next/server";
import { storyService } from "@src/features/feed/service/server";

// POST /api/stories/[id]/view - บันทึกการดู story
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const view = await storyService.markStoryAsViewed({
      storyId: parseInt(params.id),
      userId: body.userId,
    });

    return NextResponse.json(view);
  } catch (error) {
    console.error("Error marking story as viewed:", error);
    return NextResponse.json(
      { error: "Failed to mark story as viewed" },
      { status: 500 }
    );
  }
}
