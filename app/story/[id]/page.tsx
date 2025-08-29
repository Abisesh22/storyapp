import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, MessageCircle, BookOpen } from "lucide-react"
import { CommentForm } from "@/components/comment-form"

interface Story {
  _id: string
  title: string
  content: string
  coverImage?: string
  authorName: string
  createdAt: string
}

interface Comment {
  _id: string
  text: string
  commenterName: string
  timestamp: string
}

interface StoryData {
  story: Story
  comments: Comment[]
}

async function getStory(id: string): Promise<StoryData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/stories/${id}`,
      { cache: "no-store" }
    )

    if (!response.ok) return null

    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error("Error fetching story:", error)
    return null
  }
}

function CommentCard({ comment }: { comment: Comment }) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <Card className="bg-muted/50 border-border">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">{comment.commenterName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</p>
            </div>
          </div>
        </div>
        <p className="text-card-foreground leading-relaxed">{comment.text}</p>
      </CardContent>
    </Card>
  )
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params   // ✅ must await

  const storyData = await getStory(id)
  if (!storyData) notFound()

  const { story, comments } = storyData

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Stories
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">StoryShare</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Story */}
        <article className="mb-12">
          {story.coverImage && (
            <div className="w-full h-64 md:h-80 mb-8 rounded-xl overflow-hidden bg-muted">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {story.title}
            </h1>

            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{story.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(story.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span>
                  {comments.length} {comments.length === 1 ? "comment" : "comments"}
                </span>
              </div>
            </div>
          </header>

          <div className="prose prose-lg max-w-none whitespace-pre-wrap text-foreground">
            {story.content}
          </div>
        </article>

        {/* Comments */}
        <section className="border-t border-border pt-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Comments ({comments.length})
            </h2>
          </div>

          <div className="mb-8">
            <CommentForm storyId={story._id} />
          </div>

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((c) => (
                <CommentCard key={c._id} comment={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">No comments yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Be the first to share your thoughts about this story.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
