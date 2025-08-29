import { type NextRequest, NextResponse } from "next/server";
import { generatePresignedUrl } from "@/lib/s3";

// POST /api/upload/presigned - Generate presigned URL for direct client upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { success: false, error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    // ✅ Validate file type (only images)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { success: false, error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    // Generate signed URL
    const { url, key } = await generatePresignedUrl(fileName, contentType);

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: url,
        key,
        // ✅ Fixed: use global-style URL (works for all buckets)
        publicUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`,
      },
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
