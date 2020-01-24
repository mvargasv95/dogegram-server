import { ApolloServer } from 'apollo-server'
import { connect } from './db'
import { loadTypeSchema } from './utils/schema'
import user from './types/user/user.resolvers'
import jwt from 'jsonwebtoken'

const types = ['user']

const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, 'secret', (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const start = async () => {
  const rootSchema = `
    schema {
      query: Query
      mutation: Mutation
    }
  `
  const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  await connect()

  const server = new ApolloServer({
    typeDefs: [rootSchema, ...schemaTypes],
    resolvers: user,
    context: async ({ req }) => {
      let payload = null
      if (req.headers.authorization) {
        try {
          payload = await verifyToken(req.headers.authorization)
        } catch (e) {
          throw new Error('Invalid token')
        }
      }
      return payload
    }
  })

  const { url } = await server.listen()

  console.log(`Server ready at ${url} 🚀`)
}
