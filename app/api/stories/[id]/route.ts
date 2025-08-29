import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Story from "@/models/Story"
import Comment from "@/models/Comment"
import mongoose from "mongoose"

// GET /api/stories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params   // ✅ await params here

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid story ID" }, { status: 400 })
    }

    const story = await Story.findById(id).lean()
    if (!story) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 })
    }

    const comments = await Comment.find({ storyId: id }).sort({ timestamp: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: { story, comments },
    })
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch story" }, { status: 500 })
  }
}
