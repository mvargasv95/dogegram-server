import nanoid from 'nanoid'
import jwt from 'jsonwebtoken'
import { User } from './user.model'
import { Post } from '../post/post.model'
import { validateObjectId } from '../../utils/helpers'

const newToken = ({ _id: id }) => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: '1h'
  })
}

// queries
const whoAmI = async (_, __, ctx) => {
  if (!ctx.id) throw new Error('Please sign in or sign up')
  const user = await User.findById(ctx.id)
    .lean()
    .exec()
  if (!user) {
    throw new Error('Unable to find user. Please try again')
  } else {
    return user
  }
}

const users = () =>
  User.find({})
    .lean()
    .exec()

// mutation
const updateUser = async (_, { input }, ctx) => {
  if (!ctx.id || !validateObjectId(ctx.id)) throw new Error('Not authorized')
  if (input.password && input.password.length < 8) throw new Error('Password minimum length not reached')
  const user = await User.findById(ctx.id, (err, user) => {
    if (err) throw new Error(err)
    if (user) {
      for (const key in input) user[key] = input[key]
      user.save()
    }
  })
  if (!user) throw new Error('Unable to find user')
  return { name: user.name, email: user.email, username: user.username, ...input, _id: ctx.id }
}

const signUp = async (_, { input }) => {
  const user = await User.create({ id: nanoid(), ...input })
  if (!user) throw new Error('Unable to create user. Please try again')
  const token = newToken(user)
  return { token }
}

const signIn = async (_, { input }) => {
  if (!input.email && !input.username) throw new Error('Please provide an email address or username')
  let user = null
  if (input.email) user = await User.findOne({ email: input.email }).exec()
  if (!user && input.username) user = await User.findOne({ username: input.username }).exec()
  if (!user) throw new Error('Unable to find user. Please try again')
  const match = await user.checkPassword(input.password)
  if (!match) throw new Error('Password does not match. Please try again')
  const token = newToken(user)
  return { token }
}

const removeUser = async (_, { input }) => {
  await Post.deleteMany({ author: input })
  const user = User.findByIdAndRemove(input)
  if (!user) throw new Error('Unable to find user')
  return user
}

export default {
  Query: {
    whoAmI,
    users
  },
  Mutation: {
    updateUser,
    signUp,
    signIn,
    removeUser
  },
  User: {
    id(user) {
      return user._id
    }
  }
}
