import { MyLoggerService } from "src/my-logger/my-logger.service";
import { PostService } from "../post.service";
import { Controller, UseFilters, UseGuards } from "@nestjs/common";
import { Roles } from "src/auth/roles.decorator";
import { UserRoleEnum } from "src/lib/types/user";
import { AllExceptionFilter } from "src/all-exceptions.filter";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";

UseFilters(AllExceptionFilter);
@UseGuards(JwtAccessTokenGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@Controller()
export class PostForAdminController {
  constructor(private readonly postService: PostService) {}
  private readonly logger = new MyLoggerService(PostForAdminController.name);
}
