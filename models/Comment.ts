import mongoose, { type Document, Schema } from "mongoose"

export interface IComment extends Document {
  storyId: mongoose.Types.ObjectId
  text: string
  commenterName: string
  timestamp: Date
}

const CommentSchema: Schema = new Schema({
  storyId: {
    type: Schema.Types.ObjectId,
    ref: "Story",
    required: [true, "Story ID is required"],
  },
  text: {
    type: String,
    required: [true, "Please provide comment text"],
    maxlength: [500, "Comment cannot be more than 500 characters"],
  },
  commenterName: {
    type: String,
    required: [true, "Please provide a commenter name"],
    maxlength: [100, "Commenter name cannot be more than 100 characters"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema)
