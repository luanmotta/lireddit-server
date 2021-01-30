import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { User } from '../entities/User';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<User> {
    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User, { username: options.username, password: hashedPassword })
    await em.persistAndFlush(user);
    return user
  }

}
