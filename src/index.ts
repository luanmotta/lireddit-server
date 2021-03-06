import { MikroORM } from '@mikro-orm/core'
// import { Post } from './entities/Post';
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'

import microConfig from './mikro-orm.config'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { PersonResolver } from './resolvers/person'
import { __prod__ } from './constants'
import { MyContext } from './types'

const SERVER_PORT = 4000

const main = async () => {
  const orm = await MikroORM.init(microConfig)
  await orm.getMigrator().up()
  const app = express()

  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 315360000000, // 1000 * 60 * 60 * 24 * 365 * 10 = 315360000000 =  10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie will work in https only
      },
      saveUninitialized: false,
      secret: 'eb1ecee9fb54a7c7c3dd761824c76d3f',
      resave: false,
    }),
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, PersonResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  })

  apolloServer.applyMiddleware({ app })

  app.get('/', (_, res) => {
    res.send('hello')
  })
  app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`)
  })
}

main()
