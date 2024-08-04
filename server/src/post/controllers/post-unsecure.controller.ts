import { Controller, Get, Param, Query, UseFilters } from "@nestjs/common";
import { AllExceptionFilter } from "src/all-exceptions.filter";
import { MyLoggerService } from "src/my-logger/my-logger.service";
import { PostService } from "../post.service";

@UseFilters(AllExceptionFilter)
@Controller("unsecure")
export class PostForAnyUserController {
  constructor(private readonly postService: PostService) {}
  private readonly logger = new MyLoggerService(PostForAnyUserController.name);
  
  
  @Get("post/:postId")
  findOnePost(@Param("postId") postId: string, @Query("userId") userId:string) {
    return this.postService.findOnePost(postId,userId);
  }
}
