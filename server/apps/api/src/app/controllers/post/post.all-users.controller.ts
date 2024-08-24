import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
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
import {
  AllExceptionFilter,
  CreatePostCommentDto,
  CreatePostCommentLikeDto,
  CreatePostLikeDto,
  CreateUserSavedPostDto,
  MicroservicesNames,
  MyLoggerService,
  UpdatePostCommentLikeDto,
  UpdatePostCommentContentDto,
} from "@app/shared";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@app/shared/guards/jwt-access-token.global.guard";

@UseFilters(AllExceptionFilter)
@UseGuards(JwtAuthGuard)
@ApiTags("Post for all Users")
@Controller()
export class PostAllUsersController {
  constructor(
    @Inject(MicroservicesNames.POST_SERVICE)
    private readonly postService: ClientProxy,
  ) {}
  private readonly logger = new MyLoggerService(PostAllUsersController.name);

  @Post("post/comment")
  createPostComment(
    @Request() req,
    @Body() createPostCommentDto: CreatePostCommentDto,
  ) {
    this.postService.send(
      { cmd: "createPostComment" },
      { user: req.user, createPostCommentDto },
    );
  }
  @Post("post/like")
  createLikePost(@Request() req, @Body() createPostLikeDto: CreatePostLikeDto) {
    this.postService.send(
      { cmd: "createLikePost" },
      { user: req.user, createPostLikeDto },
    );
  }

  @Post("post/save")
  createSavePost(
    @Request() req,
    @Body() createUserSavedPostDto: CreateUserSavedPostDto,
  ) {
    return this.postService.send(
      { cmd: "createSavePost" },
      { user: req.user, createUserSavedPostDto },
    );
  }

  @Post("post/comment/like")
  createPostCommentLike(
    @Request() req,
    @Body() createPostCommentLikeDto: CreatePostCommentLikeDto,
  ) {
    this.postService.send(
      { cmd: "createPostCommentLike" },
      { user: req.user, createPostCommentLikeDto },
    );
  }

  @Get("post/user/liked/personal")
  findUserPersonalLikedPosts(
    @Request() req,
    @Query("skip", ParseIntPipe) skip,
    @Query("take", ParseIntPipe) take,
  ) {
    return this.postService.send(
      { cmd: "findUserPersonalLikedPosts" },
      { user: req.user, skip, take },
    );
  }
  @Get("post/user/saved/personal")
  findUserPersonalSavedPosts(
    @Request() req,
    @Query("skip", ParseIntPipe) skip,
    @Query("take", ParseIntPipe) take,
  ) {
    return this.postService.send(
      { cmd: "findUserPersonalSavedPosts" },
      { user: req.user, skip, take },
    );
  }

  @Get("post")
  findAllPosts(
    @Request() req,
    @Query("isLatest", ParseBoolPipe) isLatest: boolean,
    @Query("skip", ParseIntPipe) skip: number = 0,
    @Query("take", ParseIntPipe) take: number = 10,
  ) {
    return this.postService.send(
      { cmd: "findAllPosts" },
      { user: req.user, isLatest, skip, take },
    );
  }

  @Get("post/comments/all/:postId")
  getAllComments(
    @Request() req,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Query("isLatest", ParseBoolPipe) isLatest: boolean,
    @Query("skip", ParseIntPipe) skip: number = 0,
    @Query("take", ParseIntPipe) take: number = 10,
  ) {
    return this.postService.send(
      { cmd: "getAllComments" },
      {
        user: req.user,
        postId,
        isLatest,
        skip,
        take,
      },
    );
  }

  @Get("post/likes/all/:postId")
  getAllPostLikes(
    @Request() req,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Query("isLatest", ParseBoolPipe) isLatest: boolean,
    @Query("skip", ParseIntPipe) skip: number,
    @Query("take", ParseIntPipe) take: number,
  ) {
    return this.postService.send(
      { cmd: "getAllPostLikes" },
      { user: req.user, postId, isLatest, skip, take },
    );
  }

  @Get("post/comment/likes/all/:commentId")
  getAllCommentLikes(
    @Request() req,
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @Query("isLatest", ParseBoolPipe) isLatest: boolean,
    @Query("skip", ParseIntPipe) skip: number,
    @Query("take", ParseIntPipe) take: number,
  ) {
    return this.postService.send(
      { cmd: "getAllCommentLikes" },
      { user: req.user, commentId, isLatest, skip, take },
    );
  }

  @Patch("post/like")
  updatePostLike(@Request() req, @Body() createPostLikeDto: CreatePostLikeDto) {
    return this.postService.send(
      { cmd: "updatePostLike" },
      { user: req.user, createPostLikeDto },
    );
  }
  @Patch("post/comment")
  updatePostCommentContent(
    @Request() req,
    @Body() updatePostCommentContentDto: UpdatePostCommentContentDto,
  ) {
    return this.postService.send(
      { cmd: "updatePostCommentContent" },
      {
        user: req.user,
        updatePostCommentContentDto,
      },
    );
  }
  @Patch("post/comment/like")
  updatePostCommentLike(
    @Request() req,
    @Body() updatePostCommentLikeDto: UpdatePostCommentLikeDto,
  ) {
    this.postService.send(
      { cmd: "updatePostCommentLike" },
      { user: req.user, updatePostCommentLikeDto },
    );
  }

  @Delete("post/comment/:commentId")
  removePostComment(@Request() req, @Param("commentId") commentId: string) {
    return this.postService.send(
      { cmd: "removePostComment" },
      { user: req.user, commentId },
    );
  }
  @Delete("post/like/:postId")
  removePostLike(
    @Request() req,
    @Param("postId", ParseUUIDPipe) postId: string,
  ) {
    return this.postService.send(
      { cmd: "removePostLike" },
      { user: req.user, postId },
    );
  }
  @Delete("post/save/:postId")
  removeUserSavePost(
    @Request() req,
    @Param("postId", ParseUUIDPipe) postId: string,
  ) {
    return this.postService.send(
      { cmd: "removeUserSavePost" },
      { user: req.user, postId },
    );
  }
  @Delete("post/comment/like/:commentId")
  removePostCommentLike(
    @Request() req,
    @Param("commentId", ParseUUIDPipe) commentId: string,
  ) {
    this.postService.send(
      { cmd: "removePostCommentLike" },
      { user: req.user, commentId },
    );
  }
}
