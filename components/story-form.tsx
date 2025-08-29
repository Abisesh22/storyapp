"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, ImageIcon, Loader2, Send } from "lucide-react"
import { uploadFile, validateFile } from "@/lib/upload-utils"

export function StoryForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")
    const validation = validateFile(file)

    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file")
      return
    }

    setCoverImage(file)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setCoverImageUrl(previewUrl)
  }

  const handleImageUpload = async () => {
    if (!coverImage) return

    setIsUploading(true)
    setUploadError("")

    try {
      const result = await uploadFile(coverImage)

      if (!result.success) {
        throw new Error(result.error || "Upload failed")
      }

      // Replace preview URL with actual S3 URL
      if (coverImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverImageUrl)
      }
      setCoverImageUrl(result.data!.url)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    if (coverImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverImageUrl)
    }
    setCoverImage(null)
    setCoverImageUrl("")
    setUploadError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !content.trim() || !authorName.trim()) {
      setError("Please fill in all required fields")
      return
    }

    if (title.length > 200) {
      setError("Title must be less than 200 characters")
      return
    }

    if (authorName.length > 100) {
      setError("Author name must be less than 100 characters")
      return
    }

    // If there's a selected image that hasn't been uploaded yet, upload it first
    if (coverImage && coverImageUrl.startsWith("blob:")) {
      setError("Please upload the cover image before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          authorName: authorName.trim(),
          coverImage: coverImageUrl || undefined,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create story")
      }

      // Redirect to the new story
      router.push(`/story/${result.data._id}`)
    } catch (error) {
      console.error("Error creating story:", error)
      setError(error instanceof Error ? error.message : "Failed to create story")
    } finally {
      setIsSubmitting(false)
    }
  }

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl text-card-foreground">Create Your Story</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-card-foreground mb-2">
              Story Title *
            </label>
            <Input
              id="title"
              placeholder="Enter your story title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">{title.length}/200 characters</span>
            </div>
          </div>

          {/* Author Name */}
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-card-foreground mb-2">
              Your Name *
            </label>
            <Input
              id="authorName"
              placeholder="Enter your name..."
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={100}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">{authorName.length}/100 characters</span>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Cover Image (Optional)</label>

            {!coverImageUrl ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Click to select a cover image for your story</p>
                <p className="text-xs text-muted-foreground mb-4">JPEG, PNG, or WebP • Max 5MB</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="bg-transparent"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={coverImageUrl || "/placeholder.svg"}
                    alt="Cover preview"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting || isUploading}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {coverImage && coverImageUrl.startsWith("blob:") && (
                  <Button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={isUploading || isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading Image...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {uploadError && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-2">
                {uploadError}
              </div>
            )}
          </div>

          {/* Story Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-card-foreground mb-2">
              Your Story *
            </label>
            <Textarea
              id="content"
              placeholder="Tell your story... Let your creativity flow and share your unique perspective with the world."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">{wordCount} words</span>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim() || !authorName.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing Story...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Story
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isSubmitting}
              className="bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
