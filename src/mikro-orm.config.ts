import { __prod__ } from "./contstants";
import { Post } from "./entities/Post";
import { MikroORM } from '@mikro-orm/core';

export default {
  entities: [Post],
  user: 'postgres',
  password: 'postgres',
  dbName: 'lireddit',
  type: 'postgresql',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
