import type mongoose from "mongoose"

declare global {
  var mongooseConn: {
    conn: mongoose.Mongoose | null
    promise: mongoose.Mongoose | null
  }
}
