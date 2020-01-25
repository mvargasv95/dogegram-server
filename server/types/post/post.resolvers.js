import nanoid from 'nanoid'
import { Post } from './post.model'
import { User } from '../user/user.model'

// queries
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

const myPosts = (_, __, ctx) => {
  if (!ctx.id) throw new Error('Please sign in to see your posts')
  return Post.find({ author: ctx.id })
}

// mutations
const newPost = async (_, { input }, ctx) => {
  if (!ctx.id) throw new Error('Not authorized')
  if (!input.media && !input.caption) throw new Error("Post can't be empty")
  const newPost = await Post.create({ id: nanoid(), author: ctx.id, likes: 0, ...input })
  if (!newPost) throw new Error('Unable to create post. Please try again')
  return newPost
}

const increasePostLikes = async (_, { input }, ctx) => {
  if (!ctx.id) throw new Error('Not authorized')
  const post = await Post.findById(input)
  if (!post) throw new Error('Unable to find post')
  const newPost = await Post.findByIdAndUpdate(input, { likes: ++post.likes }, { new: true })
  return newPost
}

const decreasePostLikes = async (_, { input }, ctx) => {
  if (!ctx.id) throw new Error('Not authorized')
  const post = await Post.findById(input)
  if (!post) throw new Error('Unable to find post')
  if (post.likes < 1) throw new Error('Likes are already 0')
  const newPost = await Post.findByIdAndUpdate(input, { likes: --post.likes }, { new: true })
  console.log('here', newPost)
  return newPost
}

export default {
  Query: {
    post,
    posts,
    myPosts
  },
  Mutation: {
    newPost,
    increasePostLikes,
    decreasePostLikes
  },
  Post: {
    id(post) {
      return post._id
    },
    author(post) {
      return User.findById(post.author)
    }
  }
}
