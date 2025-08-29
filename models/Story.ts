import mongoose, { type Document, Schema } from "mongoose"

export interface IStory extends Document {
  title: string
  content: string
  coverImage?: string
  authorName: string
  createdAt: Date
}

const StorySchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, "Please provide a title for the story"],
    maxlength: [200, "Title cannot be more than 200 characters"],
  },
  content: {
    type: String,
    required: [true, "Please provide content for the story"],
  },
  coverImage: {
    type: String,
    required: false,
  },
  authorName: {
    type: String,
    required: [true, "Please provide an author name"],
    maxlength: [100, "Author name cannot be more than 100 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema)
