import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import crypto from "crypto";

// Configure AWS S3 client
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const key = `uploads/${crypto.randomUUID()}.${fileExt}`;

    // Upload to S3
    await s3
      .putObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
      .promise();

    // 🔥 FIXED URL GENERATION (regionless URL works everywhere)
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;

    return NextResponse.json({ success: true, data: { url } });
  } catch (error: any) {
    console.error("S3 upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
