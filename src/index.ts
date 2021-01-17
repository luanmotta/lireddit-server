import { MikroORM } from '@mikro-orm/core';
import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer} from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

const SERVER_PORT = 4000;

(async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [],
      validate: false,
    })
  });

  app.get('/', (_, res) => {
    res.send('hello');
  })
  app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`)
  })
})();

console.log('Hello There');
