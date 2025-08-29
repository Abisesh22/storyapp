/**
 * Client-side utility functions for file uploads
 */

export interface UploadResponse {
  success: boolean
  data?: {
    url: string
    key: string
    fileName: string
    fileSize: number
    contentType: string
  }
  error?: string
}

/**
 * Upload file directly to server (server handles S3 upload)
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: "Failed to upload file",
    }
  }
}

/**
 * Upload file using presigned URL (direct to S3)
 */
export async function uploadFileWithPresignedUrl(file: File): Promise<UploadResponse> {
  try {
    // First, get the presigned URL
    const presignedResponse = await fetch("/api/upload/presigned", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    })

    const presignedResult = await presignedResponse.json()

    if (!presignedResult.success) {
      return presignedResult
    }

    // Upload directly to S3 using presigned URL
    const uploadResponse = await fetch(presignedResult.data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload to S3")
    }

    return {
      success: true,
      data: {
        url: presignedResult.data.publicUrl,
        key: presignedResult.data.key,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      },
    }
  } catch (error) {
    console.error("Presigned upload error:", error)
    return {
      success: false,
      error: "Failed to upload file with presigned URL",
    }
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, and WebP images are allowed",
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size must be less than 5MB",
    }
  }

  return { valid: true }
}
