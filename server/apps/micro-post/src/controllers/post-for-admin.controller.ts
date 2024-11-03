import { MyLoggerService } from "@app/shared/services/logger.service";
import { PostService } from "../services/post.service";
import { Controller, } from "@nestjs/common";


@Controller()
export class PostForAdminController {
  constructor(private readonly postService: PostService) {}
  private readonly logger = new MyLoggerService(PostForAdminController.name);
}
