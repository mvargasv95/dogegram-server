import nanoid from 'nanoid'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { User } from './user.model'

export const newToken = ({ id }) => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: '1h'
  })
}

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

const users = () => {
  User.find({})
    .lean()
    .exec()
}

const updateUser = async (_, { input }, ctx) => {
  if (!ctx.id || !mongoose.Types.ObjectId.isValid(ctx.id)) throw new Error('Not authorized')
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

const signUp = (_, { input }) => {
  const newUser = User.create({ id: nanoid(), ...input })
  if (!newUser) throw new Error('Unable to create user. Please try again')
  const token = newToken(newUser)
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

export default {
  Query: {
    whoAmI,
    users
  },
  Mutation: {
    updateUser,
    signUp,
    signIn
  },
  User: {
    id(user) {
      return user._id
    }
  }
}
