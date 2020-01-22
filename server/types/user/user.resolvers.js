import nanoid from 'nanoid'
import jwt from 'jsonwebtoken'
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

// it's returning old user. check this
const updateUser = (_, { input }) => {
  const { id } = input
  delete input.id
  if (input.password && input.password.length < 8) throw new Error('Password minimun lenght not reached')
  return User.findById(id, (err, user) => {
    if (err) throw new Error(err)
    if (input.name) user.name = input.name
    if (input.username) user.username = input.username
    if (input.email) user.email = input.email
    if (user.password) user.password = input.password
    if (input.avatar) user.avatar = input.avatar
    user.save()
    return user
  })
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
