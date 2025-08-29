import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Calendar, User } from "lucide-react"

interface Story {
  _id: string
  title: string
  content: string
  coverImage?: string
  authorName: string
  createdAt: string
}

async function getStories(): Promise<Story[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/stories`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch stories")
    }

    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error("Error fetching stories:", error)
    return []
  }
}

function StoryCard({ story }: { story: Story }) {
  const excerpt = story.content.length > 150 ? story.content.substring(0, 150) + "..." : story.content

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border">
      <CardHeader className="pb-3">
        {story.coverImage && (
          <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-muted">
            <img
              src={story.coverImage || "/placeholder.svg"}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardTitle className="text-xl font-bold text-balance leading-tight text-card-foreground group-hover:text-primary transition-colors">
          {story.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed text-pretty">{excerpt}</p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{story.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(story.createdAt)}</span>
            </div>
          </div>

          <Link href={`/story/${story._id}`}>
            <Button
              variant="outline"
              size="sm"
              className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Read Story
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function HomePage() {
  const stories = await getStories()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">StoryShare</h1>
            </div>

            <Link href="/create">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Share Your Story
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-balance mb-4 text-foreground">Discover Amazing Stories</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Share your stories with the world and discover incredible tales from our community of storytellers.
          </p>
        </div>

        {/* Stories Grid */}
        {stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No stories yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Be the first to share a story with our community. Your tale could inspire others!
            </p>
            <Link href="/create">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Share the First Story
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 StoryShare. A place for storytellers to connect and inspire.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
