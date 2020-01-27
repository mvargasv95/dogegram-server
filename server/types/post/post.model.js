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
        body: {
          type: String,
          maxlength: 500,
          required: true
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
