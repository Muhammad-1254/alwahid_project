import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseFilters, UseGuards } from "@nestjs/common";
import { AllExceptionFilter } from "src/all-exceptions.filter";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/roles.decorator";
import { UserRoleEnum } from "src/lib/types/user";
import { PostService } from "../post.service";
import { MyLoggerService } from "src/my-logger/my-logger.service";
import { CreatePostCommentDto, createPostLikeDto } from "../dto/create-post.dto";
import { updatePostCommentContentDto } from "../dto/update-post.dto";

@UseFilters(AllExceptionFilter)
@UseGuards(JwtAccessTokenGuard, RolesGuard)
@Controller()
export class PostForAllUsersController {
  constructor(private readonly postService: PostService) {}
  private readonly logger = new MyLoggerService(PostForAllUsersController.name);
  
  @Post("post/comment")
  createPostComment(@Body() createPostDto: CreatePostCommentDto) {
    this.postService.createPostComment(createPostDto);
  }
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.CREATOR, UserRoleEnum.NORMAL)
  @Post("post/like")
  createPostLike(@Request() req,@Body() createLike: createPostLikeDto) {
    this.postService.createPostLike(req.user, createLike);
  }
  // @Post("post/comment/like")
  // createPostCommentLike(@Body() createLike: createPostCommentLikeDto) {
  //   this.postService.createPostCommentLike(createLike);
  // }

  @Get("post/user/likes/personal")
  findUserLikesOnPost(@Request() req, @Query("from") from, @Query("to") to) {
    return this.postService.findUserLikesOnPost(req.user, from, to);
  }
  

  @Get("post")
  findAllPosts(@Query("from") from: number, @Query("to") to: number) {
    return this.postService.findAllPosts(from, to);
  }

  
  @Get("post/comments")
  findAllComments(
    @Query("postId") postId: string,
    @Query("from") from: number,
    @Query("to") to: number,
  ) {
    return this.postService.findAllComments(postId, from, to);
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
    @Query("from") from: number,
    @Query("to") to: number,
  ) {
    return this.postService.findAllCommentLikes(commentId, from, to);
  }

 


  @Patch("post/comment")
  updatePostCommentContent(@Body() updateComment: updatePostCommentContentDto) {
    return this.postService.updatePostCommentContent(updateComment);
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