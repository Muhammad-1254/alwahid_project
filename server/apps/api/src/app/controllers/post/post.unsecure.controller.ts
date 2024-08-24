import { Controller, Get, Inject, Param, Query, UseFilters,  } from "@nestjs/common";
import { AllExceptionFilter, MicroservicesNames, MyLoggerService } from "@app/shared";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Post Unsecure")
@UseFilters(AllExceptionFilter)
@Controller("unsecure")
export class PostController {
  constructor(
    @Inject(MicroservicesNames.POST_SERVICE)
    private readonly postService: ClientProxy,  ) {}
  private readonly logger = new MyLoggerService(PostController.name);
  
  
  @Get("post/:postId")
  findOnePost(@Param("postId") postId: string, @Query("userId") userId:string) {
    return this.postService.send({cmd:"findOnePost"},{postId,userId});
  }
 
}
