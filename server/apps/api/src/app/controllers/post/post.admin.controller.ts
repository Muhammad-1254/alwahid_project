import { Controller, Inject, } from "@nestjs/common";
import { MicroservicesNames } from "@app/shared";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";

// UseFilters(AllExceptionFilter);
// @UseGuards(JwtAccessTokenGuard, RolesGuard)
// @Roles(UserRoleEnum.ADMIN)
@ApiTags("Post for Admin")
@Controller()
export class PostAdminController {
  constructor(
    @Inject(MicroservicesNames.POST_SERVICE)
    private readonly postService: ClientProxy,  ) {}
  // private readonly logger = new MyLoggerService(PostForAdminController.name);
}
