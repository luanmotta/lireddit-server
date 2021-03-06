import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core'
import { Request, Response } from 'express'
import session from 'express-session'

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & { session: session.Session & { userId?: Number } },
  res: Response,
}
