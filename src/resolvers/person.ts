import { MyContext } from 'src/types'
import {
 Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver,
} from 'type-graphql'
import argon2 from 'argon2'
import { Person } from '../entities/Person'

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
  @Mutation(() => PersonResponse)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext,
  ): Promise<PersonResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'length must be greater than 2',
        }],
      }
    }

    if (options.password.length <= 2) {
      return {
        errors: [{
          field: 'password',
          message: 'length must be greater than 2',
        }],
      }
    }

    const hashedPassword = await argon2.hash(options.password)
    let person
    try {
      person = em.create(Person, { username: options.username, password: hashedPassword })
      await em.persistAndFlush(person)
    } catch (err) {
      return {
        errors: [{
          field: 'username',
          message: 'username already exists',
        }],
      }
    }
    return { person }
  }

  @Mutation(() => PersonResponse)
  async login(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext,
  ): Promise<PersonResponse> {
    const person = await em.findOne(Person, { username: options.username })
    if (!person) {
      return {
        errors: [{
          field: 'username',
          message: 'that username doesn\'t exists',
        }],
      }
    }
    const valid = await argon2.verify(person.password, options.password)
    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: 'incorrect password',
        }],
      }
    }
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
