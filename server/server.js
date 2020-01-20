import { ApolloServer } from 'apollo-server'
// import { merge } from 'lodash'
import { connect } from './db'
import { loadTypeSchema } from './utils/schema'
import user from './types/user/user.resolvers'

const types = ['user']

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
    resolvers: user
  })

  const { url } = await server.listen()

  console.log(`Server ready at ${url} 🚀`)
}
