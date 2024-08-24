import { Controller, Get, Param, Query, UseFilters } from "@nestjs/common";
import { AllExceptionFilter } from "@app/shared/filters/all-exceptions.filter";
import { MyLoggerService } from "@app/shared/services/logger.service";
import { PostService } from "../services/post.service";
import { Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { FindOnePostPayloadType } from "../types/post-payload.type";
import { SharedService } from "@app/shared";



@Controller()
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly sharedService: SharedService
  ) {}

 
  @MessagePattern({cmd:"findOnePost"})
  findOnePost(
    @Ctx() context: RmqContext,
    @Payload() data:FindOnePostPayloadType
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.findOnePost(data);
  }
 
}
