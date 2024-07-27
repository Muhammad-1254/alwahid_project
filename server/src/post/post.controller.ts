import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Ip,
  Query,
  UseFilters,
  UseGuards,
  Request,
} from "@nestjs/common";
import { PostService } from "./post.service";
import {
  CreatePostCommentDto,
  CreatePostDto,
  CreatePostMediaDto,
  createPostOrCommentLikeDto,
  CreatePresignedUrlDto,
} from "./dto/create-post.dto";
import {
  updatePostCommentContentDto,
  UpdatePostContentDto,
} from "./dto/update-post.dto";
import { MyLoggerService } from "src/my-logger/my-logger.service";
import { AllExceptionFilter } from "src/all-exceptions.filter";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";

// @SkipThrottle()
@UseFilters(AllExceptionFilter)
@Controller()
export class PostController {
  constructor(private readonly postService: PostService,
   
  ) {}
  private readonly logger = new MyLoggerService(PostController.name);


  // @Throttle({short:{ttl:1000*60,limit:1}})
  @UseGuards(JwtAccessTokenGuard)
  @Post("post/create")
  create(@Request() req ,@Ip() ip: string, @Body() createPostDto: CreatePostDto) {
    this.logger.log(`Post created by:\t${ip}`, PostController.name);
    return this.postService.createPost(req.user,createPostDto);
  }
  @UseGuards(JwtAccessTokenGuard)
  @Post("post/presigned-url")
   createPresignedUrl(@Request() req, @Body() createUrl: CreatePresignedUrlDto[]) {
    return this.postService.createPresignedUrl(req.user,createUrl);  
  }
  @Post("post/media")
  createPostMedia(@Body() createPostDto: CreatePostMediaDto) {
    return this.postService.createPostMedia(createPostDto);
  }
  @Post("post/comment")
  createPostComment(@Body() createPostDto: CreatePostCommentDto) {
    this.postService.createPostComment(createPostDto);
  }

  @Post("post-or-comment/like")
  createPostOrCommentLike(@Body() createLike: createPostOrCommentLikeDto) {
    this.postService.createPostOrCommentLike(createLike);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get("post/user/personal")
  findUserPersonalPosts(@Request() req ,@Query("from") from: number, @Query("to") to: number) {
    return this.postService.findUserPersonalPosts(req.user, from, to);
  }
 
  @Get("post")
  findAllPosts(@Query("from") from: number, @Query("to") to: number) {
    return this.postService.findAllPosts(from, to);
  }

  @Get("post/comments")
  findAllComments(
    @Query("post_id") post_id: string,
    @Query("from") from: number,
    @Query("to") to: number,
  ) {
    return this.postService.findAllComments(post_id, from, to);
  }
  @Get("post/likes")
  findAllPostLikes(
    @Query("post_id") post_id: string,
    @Query("from") from: number,
    @Query("to") to: number,
  ) {
    return this.postService.findAllPostLikes(post_id, from, to);
  }
  @Get("comments/likes")
  findAllCommentLikes(
    @Query("comment_id") comment_id: string,
    @Query("from") from: number,
    @Query("to") to: number,
  ) {
    return this.postService.findAllCommentLikes(comment_id, from, to);
  }

  @Get("post/:post_id")
  findOnePost(@Param("post_id") post_id: string) {
    return this.postService.findOnePost(post_id);
  }

  @Patch("post")
  updatePostContent(@Body() updateComment: UpdatePostContentDto) {
    return this.postService.updatePostContent(updateComment);
  }

  @Patch("post/comment")
  updatePostCommentContent(@Body() updateComment: updatePostCommentContentDto) {
    return this.postService.updatePostCommentContent(updateComment);
  }

  @Delete("post/:id")
  removePost(@Param("id") id: string) {
    return this.postService.removePost(id);
  }

  @Delete("post/media/:id")
  removePostMedia(@Param("id") id: string) {
    return this.postService.removePostMedia(id);
  }

  @Delete("post/comment/:id")
  removePostComment(@Param("id") id: string) {
    return this.postService.removePostComment(id);
  }
  @Delete("post/like/:id")
  removePostOrCommentLike(@Param("id") id: string) {
    return this.postService.removePostOrCommentLike(id);
  }
}
