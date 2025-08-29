import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Comment from "@/models/Comment"
import Story from "@/models/Story"
import mongoose from "mongoose"

// GET /api/stories/[id]/comments - Fetch comments for a story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params   // ✅ await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid story ID" }, { status: 400 })
    }

    const comments = await Comment.find({ storyId: id }).sort({ timestamp: -1 })

    return NextResponse.json({
      success: true,
      data: comments,
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST /api/stories/[id]/comments - Add a comment to a story
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params   // ✅ await params
    const body = await request.json()
    const { text, commenterName } = body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid story ID" }, { status: 400 })
    }

    if (!text || !commenterName) {
      return NextResponse.json(
        { success: false, error: "Comment text and commenter name are required" },
        { status: 400 }
      )
    }

    const story = await Story.findById(id)
    if (!story) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 })
    }

    const comment = await Comment.create({
      storyId: id,
      text,
      commenterName,
    })

    return NextResponse.json(
      { success: true, data: comment },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ success: false, error: "Failed to create comment" }, { status: 500 })
  }
}
