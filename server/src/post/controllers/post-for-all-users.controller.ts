import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { AllExceptionFilter } from "src/all-exceptions.filter";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";
import { PostService } from "../post.service";
import { MyLoggerService } from "src/my-logger/my-logger.service";
import {
  CreatePostCommentDto,
  CreatePostCommentLikeDto,
  CreatePostLikeDto,
  CreateUserSavedPostDto,
  UpdatePostCommentLikeDto,
} from "../dto/create-post.dto";
import { updatePostCommentContentDto } from "../dto/update-post.dto";

@UseFilters(AllExceptionFilter)
@UseGuards(JwtAccessTokenGuard)
@Controller()
export class PostForAllUsersController {
  constructor(private readonly postService: PostService) {}
  private readonly logger = new MyLoggerService(PostForAllUsersController.name);

  @Post("post/comment")
  createPostComment(
    @Request() req,
    @Body() createPostDto: CreatePostCommentDto,
  ) {
    this.postService.createPostComment(req.user, createPostDto);
  }
  @Post("post/like")
  createLikePost(@Request() req, @Body() createLike: CreatePostLikeDto) {
    this.postService.createLikePost(req.user, createLike);
  }

  @Post("post/save")
  createSavePost(@Request() req, @Body() createSaved: CreateUserSavedPostDto) {
    return this.postService.createSavePost(req.user, createSaved);
  }

  @Post("post/comment/like")
  createPostCommentLike(
    @Request() req,
    @Body() createLike: CreatePostCommentLikeDto,
  ) {
    this.postService.createPostCommentLike(req.user, createLike);
  }

  @Get("post/user/liked/personal")
  findUserPersonalLikedPosts(
    @Request() req,
    @Query("skip", ParseIntPipe) skip,
    @Query("take", ParseIntPipe) take,
  ) {
    return this.postService.findUserPersonalLikedPosts(req.user, skip, take);
  }
  @Get("post/user/saved/personal")
  findUserPersonalSavedPosts(
    @Request() req,
    @Query("skip", ParseIntPipe) skip,
    @Query("take",ParseIntPipe) take,
  ) {
    return this.postService.findUserPersonalSavedPosts(req.user, skip, take);
  }

  @Get("post")
  findAllPosts(@Query("from") from: number, @Query("to") to: number) {
    return this.postService.findAllPosts(from, to);
  }

  @Get("post/comments/all/:postId")
  getAllComments(
    @Request() req,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Query("isLatest", ParseBoolPipe) isLatest: boolean,
    @Query("skip", ParseIntPipe) skip: number = 0,
    @Query("take", ParseIntPipe) take: number = 10,
  ) {
    return this.postService.getAllComments(
      req.user,
      postId,
      isLatest,
      skip,
      take,
    );
  }

  @Get("post/likes/all/:postId")
  findAllPostLikes(
    @Request() req,
    @Param("postId",ParseUUIDPipe) postId: string,
    @Query("isLatest", ParseBoolPipe) isLatest: boolean,
    @Query("skip", ParseIntPipe) skip: number,
    @Query("take",ParseIntPipe) take: number,
  ) {
    return this.postService.findAllPostLikes(req.user,postId,isLatest, skip, take);
  }

  @Get("post/comment/likes/all/:commentId")
  findAllCommentLikes(
    @Request() req,
    @Param("commentId",ParseUUIDPipe) commentId: string,
    @Query("isLatest", ParseBoolPipe) isLatest: boolean,
    @Query("skip", ParseIntPipe) skip: number,
    @Query("take",ParseIntPipe) take: number,
  ) {
    return this.postService.findAllCommentLikes(req.user, commentId,isLatest, skip, take);
  }
  @Patch("post/like")
  updatePostLike(@Request() req, @Body() updateLike: CreatePostLikeDto) {
    return this.postService.updatePostLike(req.user,updateLike);
  }
  @Patch("post/comment")
  updatePostCommentContent(@Body() updateComment: updatePostCommentContentDto) {
    return this.postService.updatePostCommentContent(updateComment);
  }
  @Patch("post/comment/like")
  updatePostCommentLike(
    @Request() req,
    @Body() updateLike: UpdatePostCommentLikeDto,
  ) {
    this.postService.updatePostCommentLike(req.user, updateLike);
  }

  

  @Delete("post/comment/:id")
  removePostComment(@Param("id") id: string) {
    return this.postService.removePostComment(id);
  }
  @Delete("post/like/:postId")
  removePostLike( @Request() req,@Param("postId", ParseUUIDPipe) postId: string) {
    return this.postService.removePostLike(req.user, postId);
  }
  @Delete("post/save/:postId")
  removeUserSavePost(@Request() req, @Param("postId", ParseUUIDPipe) postId: string) {
    return this.postService.removeUserSavePost(req.user, postId);
  }
  @Delete("post/comment/like/:commentId")
  removePostCommentLike(
    @Request() req,
    @Param("commentId", ParseUUIDPipe) commentId: string,
  ) {
    this.postService.removePostCommentLike(req.user,commentId );
  }
}
