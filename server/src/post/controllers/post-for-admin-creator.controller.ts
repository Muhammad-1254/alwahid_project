import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { PostService } from "../post.service";
import { MyLoggerService } from "src/my-logger/my-logger.service";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/roles.decorator";
import { UserRoleEnum } from "src/lib/types/user";
import { AllExceptionFilter } from "src/all-exceptions.filter";
import { CreatePostDto, CreatePostMediaDto, CreatePresignedUrlDto } from "../dto/create-post.dto";
import { UpdatePostContentDto } from "../dto/update-post.dto";

@UseFilters(AllExceptionFilter)
@UseGuards(JwtAccessTokenGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)  
@Controller()
export class PostForAdminCreatorController {
  constructor(private readonly postService: PostService) {}
  private readonly logger = new MyLoggerService(PostForAdminCreatorController.name);
  
  // @Throttle({short:{ttl:1000*60,limit:1}})
  @Post("post/create")
  create(
    @Request() req,
    @Ip() ip: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    this.logger.log(`Post created by:\t${ip}`, PostForAdminCreatorController.name);
    return this.postService.createPost(req.user, createPostDto);
  }

  @Post("post/presigned-url")
  createPresignedUrl(
    @Request() req,
    @Body() createUrl: CreatePresignedUrlDto[],
  ) {
    return this.postService.createPresignedUrl(req.user, createUrl);
  }
  @Post("post/media")
  createPostMedia(@Body() createPostDto: CreatePostMediaDto) {
    return this.postService.createPostMedia(createPostDto);
  }

  @Get("post/user/personal")
  findUserPersonalPosts(
    @Request() req,
    @Query("from") from: number,
    @Query("to") to: number,
  ) {
    return this.postService.findUserPersonalPosts(req.user, from, to);
  }

  
  @Patch("post")
  updatePostContent(@Body() updateComment: UpdatePostContentDto) {
    return this.postService.updatePostContent(updateComment);
  }
  @Delete("post/:id")
  removePost(@Param("id") id: string) {
    return this.postService.removePost(id);
  }
  @Delete("post/media/:id")
  removePostMedia(@Param("id") id: string) {
    return this.postService.removePostMedia(id);
  }
}
