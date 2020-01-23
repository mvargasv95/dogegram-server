import nanoid from 'nanoid'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import lodash from 'lodash'
import { User } from './user.model'

export const newToken = ({ id }) => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: '1h'
  })
}

const user = (_, { input }) => {
  const user = User.findById(input)
    .lean()
    .exec()
  if (!user) throw new Error('Unable to find user. Please try again')
  return user
}

const users = () =>
  User.find({})
    .lean()
    .exec()

const updateUser = async (_, { input }) => {
  if (input.password && input.password.length < 8) throw new Error('Password minimun length not reached')
  if (!mongoose.Types.ObjectId.isValid(input.id)) throw new Error('Incorrect Id format')
  const user = await User.findById(input.id, (err, user) => {
    if (err) throw new Error(err)
    if (user) {
      for (const key in input) user[key] = input[key]
      user.save()
    }
  })
  if (!user) throw new Error('Unable to find user')
  return { name: user.name, email: user.email, username: user.username, ...input, _id: user.id }
}

const signUp = (_, { input }) => {
  const newUser = User.create({ id: nanoid(), ...input })
  if (!newUser) throw new Error('Unable to create user. Please try again')
  const token = newToken(newUser)
  return { token }
}

const signInByEmail = async (_, { input }) => {
  const user = await User.findOne({ email: input.email }).exec()
  if (!user) throw new Error('Unable to find user. Please try again')
  const match = await user.checkPassword(input.password)
  if (!match) throw new Error('Password does not match. Please try again')
  const token = newToken(user)
  return { token }
}

const signInByUsername = async (_, { input }) => {
  const user = await User.findOne({ username: input.username }).exec()
  if (!user) throw new Error('Unable to find user. Please try again')
  const match = await user.checkPassword(input.password)
  if (!match) throw new Error('Password does not match. Please try again')
  const token = newToken(user)
  return { token }
}

export default {
  Query: {
    user,
    users
  },
  Mutation: {
    updateUser,
    signUp,
    signInByEmail,
    signInByUsername
  },
  User: {
    id(user) {
      return user._id
    }
  }
}
