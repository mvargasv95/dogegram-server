import nanoid from 'nanoid'
import { Post } from './post.model'
import { User } from '../user/user.model'

const post = async (_, { input }) => {
  const post = await Post.findById(input)
    .lean()
    .exec()
  if (!post) throw new Error('Unable to find post')
  return post
}

const posts = () =>
  Post.find({})
    .lean()
    .exec()

const newPost = async (_, { input }, ctx) => {
  if (!ctx.id) throw new Error('Not authorized')
  if (!input.media && !input.caption) throw new Error("Post can't be empty")
  const newPost = await Post.create({ id: nanoid(), author: ctx.id, likes: 0, ...input })
  if (!newPost) throw new Error('Unable to create post. Please try again')
  return newPost
}

export default {
  Query: {
    post,
    posts
  },
  Mutation: {
    newPost
  },
  Post: {
    author(post) {
      return User.findById(post.author)
    }
  }
}
