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
  DeletePostCommentLikeDto,
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
    @Query("from") from,
    @Query("to") to,
  ) {
    return this.postService.findUserPersonalLikedPosts(req.user, from, to);
  }
  @Get("post/user/saved/personal")
  findUserPersonalSavedPosts(
    @Request() req,
    @Query("from") from,
    @Query("to") to,
  ) {
    return this.postService.findUserPersonalSavedPosts(req.user, from, to);
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

  @Get("post/likes")
  findAllPostLikes(
    @Query("postId") postId: string,
    @Query("from") from: number,
    @Query("to") to: number,
  ) {
    return this.postService.findAllPostLikes(postId, from, to);
  }

  @Get("comments/likes")
  findAllCommentLikes(
    @Query("commentId") commentId: string,
    @Query("isLatest") isLatest: boolean,
    @Query("from") from: number,
    @Query("to") to: number,
  ) {
    return this.postService.findAllCommentLikes(commentId, from, to);
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
  @Delete("post/like/:id")
  removePostOrCommentLike(@Param("id") id: string) {
    return this.postService.removePostOrCommentLike(id);
  }
  @Delete("post/comment/like")
  deletePostCommentLike(
    @Request() req,
    @Body() deleteLike: DeletePostCommentLikeDto,
  ) {
    this.postService.deletePostCommentLike(req.user, deleteLike);
  }
}
