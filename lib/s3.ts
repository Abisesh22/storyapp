import AWS from "aws-sdk"

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET?.trim()

if (!BUCKET_NAME) {
  throw new Error("AWS_S3_BUCKET environment variable is not set")
}

export interface UploadResult {
  url: string
  key: string
}

/**
 * Ensure the bucket exists, create if not
 */
async function ensureBucketExists(): Promise<void> {
  try {
    await s3.headBucket({ Bucket: BUCKET_NAME! }).promise()
    // Bucket exists ✅
  } catch (err: any) {
    if (err.statusCode === 404 || err.code === "NotFound" || err.code === "NoSuchBucket") {
      console.log(`Bucket "${BUCKET_NAME}" not found. Creating...`)
      await s3
        .createBucket({
          Bucket: BUCKET_NAME!,
          CreateBucketConfiguration:
            process.env.AWS_REGION === "us-east-1"
              ? undefined // us-east-1 does NOT allow region param
              : { LocationConstraint: process.env.AWS_REGION! },
        })
        .promise()

      // Optional: set public-read policy
      await s3
        .putBucketPolicy({
          Bucket: BUCKET_NAME!,
          Policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Sid: "AllowPublicRead",
                Effect: "Allow",
                Principal: "*",
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
              },
            ],
          }),
        })
        .promise()

      console.log(`Bucket "${BUCKET_NAME}" created ✅`)
    } else {
      console.error("Error checking/creating bucket:", err)
      throw err
    }
  }
}

/**
 * Upload a file to S3 bucket (ensures bucket exists first)
 */
export async function uploadToS3(file: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
  await ensureBucketExists()

  const timestamp = Date.now()
  const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`

  const uploadParams = {
    Bucket: BUCKET_NAME!,
    Key: `story-covers/${uniqueFileName}`,
    Body: file,
    ContentType: contentType,
  }

  try {
    const result = await s3.upload(uploadParams).promise()
    return { url: result.Location, key: result.Key }
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw new Error("Failed to upload file to S3")
  }
}

/**
 * Delete a file from S3 bucket
 */
export async function deleteFromS3(key: string): Promise<void> {
  await ensureBucketExists()
  try {
    await s3.deleteObject({ Bucket: BUCKET_NAME!, Key: key }).promise()
  } catch (error) {
    console.error("Error deleting from S3:", error)
    throw new Error("Failed to delete file from S3")
  }
}

/**
 * Generate a presigned URL for direct upload from client
 */
export async function generatePresignedUrl(
  fileName: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  await ensureBucketExists()

  const timestamp = Date.now()
  const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`
  const key = `story-covers/${uniqueFileName}`

  const params = {
    Bucket: BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
    Expires: 300,
  }

  try {
    const url = await s3.getSignedUrlPromise("putObject", params)
    return { url, key }
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    throw new Error("Failed to generate presigned URL")
  }
}
