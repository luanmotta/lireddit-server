import { MyContext } from 'src/types'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql'
import argon2 from 'argon2'
import { Person } from '../entities/Person'
// import { EntityManager } from '@mikro-orm/postgresql'

// InputTypes we use for arguments
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string

  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

// Object types we use for returning
@ObjectType()
class PersonResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => Person, { nullable: true })
  person?: Person
}

@Resolver()
export class PersonResolver {
  @Query(() => Person, { nullable: true })
  async me(@Ctx() { em, req }: MyContext): Promise<Person | null> {
    // You are not loged in
    if (!req.session.personId) {
      return null
    }

    const person = await em.findOne(Person, { id: req.session.personId })
    return person
  }

  @Mutation(() => PersonResponse)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext,
  ): Promise<PersonResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be greater than 2',
          },
        ],
      }
    }

    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be greater than 2',
          },
        ],
      }
    }

    const hashedPassword = await argon2.hash(options.password)
    let person
    try {
      person = em.create(Person, {
        username: options.username,
        password: hashedPassword,
      })
      // Using query knex builder
      // eslint-disable-next-line max-len
      // const [user] = await (em as EntityManager).createQueryBuilder(Person).getKnexQuery().insert({
      //   username: options.username,
      //   password: hashedPassword,
      //   created_at: new Date(),
      //   updated_at: new Date(),
      // }).returning('*')
      await em.persistAndFlush(person)
    } catch (err) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username already exists',
          },
        ],
      }
    }
    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.personId = person.id
    return { person }
  }

  @Mutation(() => PersonResponse)
  async login(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext,
  ): Promise<PersonResponse> {
    const person = await em.findOne(Person, { username: options.username })
    if (!person) {
      return {
        errors: [
          {
            field: 'username',
            // eslint-disable-next-line quotes
            message: "that username doesn't exists",
          },
        ],
      }
    }
    const valid = await argon2.verify(person.password, options.password)
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      }
    }

    req.session.personId = person.id

    return {
      person,
    }
  }

  @Query(() => Person, { nullable: true })
  person(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext,
  ): Promise<Person | null> {
    return em.findOne(Person, { id })
  }
}
