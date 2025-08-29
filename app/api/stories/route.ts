import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Story from "@/models/Story"

// GET /api/stories - Fetch all stories
export async function GET() {
  try {
    await dbConnect()

    const stories = await Story.find({}).sort({ createdAt: -1 }).select("title content coverImage authorName createdAt")

    return NextResponse.json({
      success: true,
      data: stories,
    })
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stories" }, { status: 500 })
  }
}

// POST /api/stories - Create a new story
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { title, content, coverImage, authorName } = body

    // Validate required fields
    if (!title || !content || !authorName) {
      return NextResponse.json(
        { success: false, error: "Title, content, and author name are required" },
        { status: 400 },
      )
    }

    const story = await Story.create({
      title,
      content,
      coverImage,
      authorName,
    })

    return NextResponse.json(
      {
        success: true,
        data: story,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating story:", error)
    return NextResponse.json({ success: false, error: "Failed to create story" }, { status: 500 })
  }
}
