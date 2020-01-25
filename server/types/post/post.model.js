import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      maxlength: 1000
    },
    media: String,
    likes: {
      type: Number,
      required: true,
      default: 0
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comments: [
      {
        id: mongoose.Schema.Types.ObjectId,
        body: {
          type: String,
          maxlength: 500
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
)

export const Post = mongoose.model('post', postSchema)
