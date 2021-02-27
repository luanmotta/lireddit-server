import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { __prod__ } from './constants'
import { Post } from './entities/Post'
import { Person } from './entities/Person'

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, Person],
  user: 'postgres',
  password: 'postgres',
  dbName: 'lireddit',
  type: 'postgresql',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]
