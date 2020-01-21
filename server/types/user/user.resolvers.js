import nanoid from 'nanoid'
import jwt from 'jsonwebtoken'
import { User } from './user.model'

export const newToken = ({ id }) => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: '1h'
  })
}

const user = (_, { input }) => User.findById(input)

const users = () => User.find({})

const signUp = (_, { input }) => {
  const newUser = User.create({ id: nanoid(), ...input })
  const token = newToken(newUser)
  return { token }
}

export default {
  Query: {
    user,
    users
  },
  Mutation: {
    signUp
  }
}
