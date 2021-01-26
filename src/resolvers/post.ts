import { MyContext } from "src/types";
import { Ctx, Query, Resolver } from "type-graphql";
import { Post } from '../entities/Post';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {})
  }
}
