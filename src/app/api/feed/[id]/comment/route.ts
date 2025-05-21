// src/app/api/feed/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { commentService } from "@src/features/feed/service/server";

// GET /api/feed/[id]/comments - ดึงความคิดเห็นทั้งหมด
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await commentService.getCommentsByFeedItem(
      parseInt(params.id)
    );
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/feed/[id]/comments - สร้างความคิดเห็นใหม่
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const comment = await commentService.createComment({
      feedItemId: parseInt(params.id),
      userId: body.userId,
      content: body.content,
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
