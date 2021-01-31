import { MyContext } from 'src/types'
import {
 Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver,
} from 'type-graphql'
import argon2 from 'argon2'
import { User } from '../entities/User'

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
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext,
  ): Promise<UserResponse> {
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
    let user
    try {
      user = em.create(User, { username: options.username, password: hashedPassword })
      await em.persistAndFlush(user)
    } catch (err) {
      if (err.code === '23505') {
        return {
          errors: [{
            field: 'username',
            message: 'username already exists',
          }],
        }
      }
      throw err
    }
    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext,
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'that username doesn\'t exists',
        }],
      }
    }
    const valid = await argon2.verify(user.password, options.password)
    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: 'incorrect password',
        }],
      }
    }
    return {
      user,
    }
  }

  @Query(() => User, { nullable: true })
  user(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext,
  ): Promise<User | null> {
    return em.findOne(User, { id })
  }
}
