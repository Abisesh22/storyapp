import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-4 text-foreground">Story Not Found</h1>
        <p className="text-muted-foreground mb-8 text-pretty">
          The story you're looking for doesn't exist or may have been removed.
        </p>

        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>
        </Link>
      </div>
    </div>
  )
}
