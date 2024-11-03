import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Ip,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  CreatePostDto,
  CreatePostMediaDto,
  CreatePresignedUrlDto,
  MicroservicesNames,
  UpdatePostContentDto,
  UserRoleEnum,
} from "@app/shared";
import { ApiTags } from "@nestjs/swagger";
import { Roles } from "@app/shared/decorators/roles.decorator";
import { JwtAuthGuard } from "@app/shared/guards/jwt-access-token.global.guard";
import { RolesGuard } from "@app/shared/guards/roles.guard";

@ApiTags("Post for Admin and Creator")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PostAdminCreatorController {
  constructor(
    @Inject(MicroservicesNames.POST_SERVICE)
    private readonly postService: ClientProxy,
  ) {}
  // private readonly logger = new MyLoggerService(PostAdminCreatorController.name);

  // @Throttle({short:{ttl:1000*60,limit:1}})
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)
  @Post("post/create")
  createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postService.send(
      { cmd: "createPost" },
      { user: req.user, createPostDto },
    );
  }

  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)
  @Post("post/presigned-url")
  createPresignedUrl(
    @Request() req,
    @Body() createPresignedUrlDto: CreatePresignedUrlDto[],
  ) {
    return this.postService.send(
      { cmd: "createPresignedUrl" },
      { user: req.user, createPresignedUrlDto },
    );
  }
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)
  @Post("post/media")
  createPostMedia(
    @Request() req,
    @Body() createPostMediaDto: CreatePostMediaDto,
  ) {
    return this.postService.send(
      { cmd: "createPostMedia" },
      { user: req.user, createPostMediaDto },
    );
  }

  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)
  @Get("post/user/personal")
  getUserPersonalPosts(
    @Request() req,
    @Query("skip", ParseIntPipe) skip: number,
    @Query("take", ParseIntPipe) take: number,
  ) {
    return this.postService.send(
      { cmd: "getUserPersonalPosts" },
      { user: req.user, skip, take },
    );
  }

  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)
  @Patch("post")
  updatePostContent(
    @Request() req,
    @Body() updatePostContentDto: UpdatePostContentDto,
  ) {
    return this.postService.send(
      { cmd: "updatePostContent" },
      { user: req.user, updatePostContentDto },
    );
  }

  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)
  @Delete("post/:id")
  removePost(@Request() req, @Param("postId") postId: string) {
    return this.postService.send(
      { cmd: "removePost" },
      { user: req.user, postId },
    );
  }
  @Delete("post/media/:postId/:mediaId")
  removePostMedia(
    @Request() req,
    @Param("postId") postId: string,
    @Param("mediaId") mediaId: string,
  ) {
    return this.postService.send({ cmd: "removePostMedia" }, {
      user: req.user,
      postId,
      mediaId,
    });
  }
}
