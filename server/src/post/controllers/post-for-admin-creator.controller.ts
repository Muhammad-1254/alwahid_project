import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseIntPipe,
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
@Controller()
export class PostForAdminCreatorController {
  constructor(private readonly postService: PostService) {}
  private readonly logger = new MyLoggerService(PostForAdminCreatorController.name);
  
  // @Throttle({short:{ttl:1000*60,limit:1}})
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)  
  @Post("post/create")
  create(
    @Request() req,
    @Ip() ip: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    this.logger.log(`Post created by:\t${ip}`, PostForAdminCreatorController.name);
    return this.postService.createPost(req.user, createPostDto);
  }


  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)  
  @Post("post/presigned-url")
  createPresignedUrl(
    @Request() req,
    @Body() createUrl: CreatePresignedUrlDto[],
  ) {
    return this.postService.createPresignedUrl(req.user, createUrl);
  }
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)  
  @Post("post/media")
  createPostMedia(@Body() createPostDto: CreatePostMediaDto) {
    return this.postService.createPostMedia(createPostDto);
  }

@Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR)  
  @Get("post/user/personal")
  findUserPersonalPosts(
    @Request() req,
    @Query("skip", ParseIntPipe) skip:number,
    @Query("take",ParseIntPipe) take: number,
  ) {
    return this.postService.findUserPersonalPosts(req.user, skip, take);
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
