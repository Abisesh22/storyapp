"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, Loader2 } from "lucide-react"

interface CommentFormProps {
  storyId: string
}

export function CommentForm({ storyId }: CommentFormProps) {
  const [text, setText] = useState("")
  const [commenterName, setCommenterName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!text.trim() || !commenterName.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (text.length > 500) {
      setError("Comment must be less than 500 characters")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          commenterName: commenterName.trim(),
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to add comment")
      }

      // Reset form
      setText("")
      setCommenterName("")

      // Refresh the page to show the new comment
      router.refresh()
    } catch (error) {
      console.error("Error adding comment:", error)
      setError(error instanceof Error ? error.message : "Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
          <MessageCircle className="w-5 h-5 text-primary" />
          Add a Comment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Your name"
              value={commenterName}
              onChange={(e) => setCommenterName(e.target.value)}
              maxLength={100}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Textarea
              placeholder="Share your thoughts about this story..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={4}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">{text.length}/500 characters</span>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !text.trim() || !commenterName.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Comment...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Add Comment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
