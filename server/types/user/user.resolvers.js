import nanoid from 'nanoid'
import { User } from './user.model'

const user = (_, { input }) => User.findById(input)

const users = () => User.find({})

const newUser = (_, { input: { name } }) => User.create({ id: nanoid(), name })

export default {
  Query: {
    user,
    users
  },
  Mutation: {
    newUser
  }
}
