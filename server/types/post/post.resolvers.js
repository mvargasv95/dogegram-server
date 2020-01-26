import nanoid from 'nanoid'
import { Post } from './post.model'
import { User } from '../user/user.model'
import { verifyObjectId, validateObjectId } from '../../utils/helpers'

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
  if (!ctx.id || !validateObjectId(input)) throw new Error('Not authorized')
  const post = await Post.findById(input, (err, post) => {
    if (err) throw new Error('Unable to find post')
    if (post) {
      post.likes = ++post.likes
      post.save()
    }
  })
  if (!post) throw new Error('Unable to find post')
  return { ...post, likes: ++post.likes }
}

const decreasePostLikes = async (_, { input }, ctx) => {
  let likes = 0
  if (!ctx.id || !validateObjectId(input)) throw new Error('Not authorized')
  const post = await Post.findById(input, (err, post) => {
    if (err) throw new Error('Unable to find post')
    if (post && post.likes > 0) {
      post.likes = --post.likes
      post.save()
    }
  })
  if (!post) throw new Error('Unable to find post')
  if (!post.likes <= 0) likes = --post.likes
  return { ...post, likes }
}

const addComment = async (_, { input }, ctx) => {
  if (!ctx.id || !validateObjectId(input.id)) throw new Error('Not authorized')
  const comment = { id: nanoid(), body: input.body, author: ctx.id }
  const post = await Post.findById(input.id, (err, post) => {
    if (err) throw new Error('Unable to find post')
    if (post) {
      post.comments.push(comment)
      post.save()
    }
  })
  if (!post) throw new Error('Unable to find post')
  post.comments.push(comment)
  return post
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
    decreasePostLikes,
    addComment
  },
  Post: {
    id(post) {
      return post._id
    },
    author(post) {
      return User.findById(post.author)
    }
  },
  Comment: {
    id(comment) {
      return comment._id
    },
    author: async comment => {
      const user = await User.findById(comment.author)
      const msg = 'User not found'
      if (!user) {
        return {
          _id: msg,
          name: msg,
          email: msg,
          username: msg
        }
      }
      return user
    }
  }
}
