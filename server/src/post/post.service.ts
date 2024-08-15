import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreatePostCommentDto,
  CreatePostCommentLikeDto,
  CreatePostDto,
  CreatePostLikeDto,
  CreatePostMediaDto,
  CreatePresignedUrlDto,
  CreateUserSavedPostDto,
  UpdatePostCommentLikeDto,
} from "./dto/create-post.dto";
import {
  updatePostCommentContentDto,
  UpdatePostContentDto,
} from "./dto/update-post.dto";
import { v4 as uuid } from "uuid";
import { Post } from "./entities/post.entity";
import { PostMedia } from "./entities/post-media.entity";
import { EntityManager } from "typeorm";
import { PostComments } from "./entities/post-comment.entity";
import { User } from "src/user/entities/user.entity";
import { JwtAuthGuardTrueType, UserRoleEnum } from "src/lib/types/user";
import {
  PostLikeTargetEnum,
} from "src/lib/types/post";
import { PostCommentLike } from "./entities/post-comment-like.entity";
import { ConfigService } from "@nestjs/config";

import { UserSavedPostsAssociation } from "src/user/entities/user-saved-post.entity";
import { prefixSplitNestingObject } from "src/lib/utils";
import { AwsService } from "src/aws/aws.service";

@Injectable()
export class PostService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly awsService: AwsService,
  ) {}

  async createPresignedUrl(
    user: JwtAuthGuardTrueType,
    createPresignedUrlDto: CreatePresignedUrlDto[],
  ) {
    const presignedUrls = [];
    for (let i = 0; i < createPresignedUrlDto.length; i++) {
      const key = `post/${user.userId}/${new Date().getTime()}-${createPresignedUrlDto[i].fileName}`;
      const url = await this.awsService.generatePutPresignedUrl(
        key,
        createPresignedUrlDto[i].mimeType,
        60 * 60 * 20, // 20 minutes
      );
      presignedUrls.push({
        fileName: createPresignedUrlDto[i].fileName,
        key,
        url,
      });
    }

    return presignedUrls;
  }
  async createPost(user: JwtAuthGuardTrueType, createPostDto: CreatePostDto) {
    if (
      createPostDto.postMedias.length === 0 &&
      createPostDto.textContent === ""
    ) {
      throw new Error("Post content or media is required!");
    }

    await this.entityManager.transaction(async entityManager => {
      const postId = uuid();
      const post = new Post({
        id: postId,
        textContent: createPostDto.textContent,
        creatorUserId: user.userRole === "creator" ? user.userId : null,
        adminUserId: user.userRole === "admin" ? user.userId : null,
      });

      // the media.urlKey have key we have to make the url from aws presigned method then add into db
      const postMediaList: PostMedia[] = [];
      for (let i = 0; i < createPostDto.postMedias.length; i++) {
        const postMedia = new PostMedia({
          id: uuid(),
          postId: postId,
          mimeType: createPostDto.postMedias[i].mimeType,
          url: createPostDto.postMedias[i].urlKey,
        });
        postMediaList.push(postMedia);
      }

      await entityManager.save(post);
      if (postMediaList.length > 0) {
        await entityManager.save(postMediaList);
      }

      //  // Checking if user used hashtags
      // if (createPostDto.hashtagIds) {
      //   for (const hashtagId of createPostDto.hashtagIds) {
      //     const postHashtagAssociation = new HashtagPostAssociation({
      //       postId,
      //       hashtagId: hashtagId,
      //     });
      //     await entityManager.save(postHashtagAssociation);
      //   }
      // }

      // // Checking if user tagged someone
      // if (createPostDto.taggedUserIds) {
      //   for (const userId of createPostDto.taggedUserIds) {
      //     const taggedUser = await entityManager.findOne(User, { where: { id: userId } });
      //     if (!taggedUser) {
      //       throw new NotFoundException(`User with ID ${userId} not found!`);
      //     }
      //     if (taggedUser.taggedPosts && taggedUser.taggedPosts.length > 0) {
      //       taggedUser.taggedPosts.push(post);
      //     } else {
      //       taggedUser.taggedPosts = [post];
      //     }
      //     await entityManager.save(taggedUser);
      //   }
      // }
    });

    return { message: "Post created successfully!" };
  }
  async createPostMedia(createMedia: CreatePostMediaDto) {
    const postMediasList: PostMedia[] = [];
    // first check if post is exist or not
    const post = await this.entityManager.findOne(Post, {
      where: { id: createMedia.postId },
      select: ["id"],
      loadEagerRelations: false,
    });
    if (!post) {
      throw new NotFoundException("Post not found!");
    }
    for (let i = 0; i < createMedia.postMedias.length; i++) {
      const postMedia = new PostMedia({
        mimeType: createMedia.postMedias[i].mimeType,
        url: createMedia.postMedias[i].urlKey,
        id: uuid(),
        postId: createMedia.postId,
      });
      postMediasList.push(postMedia);
    }

    this.entityManager.save(postMediasList);
    const data = postMediasList.map(media => ({
      url: this.awsService.getCloudFrontSignedUrl(media.url),
      mimeType: media.mimeType,
      id: media.id,
    }));
    return { message: "media created successfully!", data };
  }

  async createPostComment(
    user_: JwtAuthGuardTrueType,
    createPostDto: CreatePostCommentDto,
  ) {
    const [user, post] = await Promise.all([
      await this.entityManager.findOne(User, {
        where: { id: user_.userId },
        select: ["id"],
      }),
      await this.entityManager.findOne(Post, {
        where: { id: createPostDto.postId },
        select: ["id"],
      }),
    ]);
    if (!user) {
      throw new NotFoundException("User not found!");
    }
    if (!post) {
      throw new NotFoundException("Post not found!");
    }
    const postComment = new PostComments({
      id: uuid(),
      content: createPostDto.content,
      userId: user_.userId,
      postId: createPostDto.postId,
    });
    await this.entityManager.save(postComment);

    return postComment;
  }
  async createLikePost(
    user: JwtAuthGuardTrueType,
    createLike: CreatePostLikeDto,
  ) {
    // checking of user already liked the post or comment
    const like = await this.entityManager.findOne(PostCommentLike, {
      where: { postId: createLike.postId, userId: user.userId },
      select: ["id", "likeType"],
      loadEagerRelations: false,
    });
    if (like) {
      // checking if likeType is same or not
      if (like.likeType === createLike.likeType) {
        return { message: "already liked!" };
      } else {
        // if same then update new one
        like.likeType = createLike.likeType;
        await this.entityManager.save(like);
        return { message: "like updated successfully!" };
      }
    }
    // if not liked then create new one
    const postLike = new PostCommentLike({
      id: uuid(),
      likeType: createLike.likeType,
      userId: user.userId,
      postId: createLike.postId,
      targetType: PostLikeTargetEnum.POST,
    });
    await this.entityManager.save(postLike);
    return { message: "like created successfully!" };
  }

  async createSavePost(
    user: JwtAuthGuardTrueType,
    createSaved: CreateUserSavedPostDto,
  ) {
    const postExist = await this.entityManager.findOne(Post, {
      where: { id: createSaved.postId },
      loadEagerRelations: false,
    });
    // check if posts is exist or not
    if (!postExist) throw new NotFoundException("Post not found!");
    // check if user already saved posts
    const userSavedPostExist = await this.entityManager.findOne(
      UserSavedPostsAssociation,
      {
        where: { postId: createSaved.postId, userId: user.userId },
        loadEagerRelations: false,
      },
    );
    if (userSavedPostExist) return { message: "Post already saved!" };

    const userSavedPostsAssociation = new UserSavedPostsAssociation({
      postId: createSaved.postId,
      userId: user.userId,
    });
    await this.entityManager.save(userSavedPostsAssociation);
    return { message: "Post saved successfully!" };
  }

  async createPostCommentLike(
    user: JwtAuthGuardTrueType,
    createPostLike: CreatePostCommentLikeDto,
  ) {
    // checking of user already liked the post or comment
    const commentLike = await this.entityManager.findOne(PostCommentLike, {
      where: {
        commentId: createPostLike.commentId,
        userId: user.userId,
      },
      select: ["id", "likeType"],
      loadEagerRelations: false,
    });
    if (commentLike) {
      return { message: "already liked!" };
    }
    const postCommentLike = new PostCommentLike({
      id: uuid(),
      commentId: createPostLike.commentId,
      likeType: createPostLike.likeType,
      userId: user.userId,
      targetType: PostLikeTargetEnum.COMMENT,
    });
    await this.entityManager.save(postCommentLike);
    return { message: "like created successfully!" };
  }

  async findUserPersonalPosts(
    user: JwtAuthGuardTrueType,
    skip: number,
    take: number,
  ) {
    const query = this.entityManager
      .createQueryBuilder(Post, "post")
      .select(["post.id", "post.createdAt"])
      .leftJoin("post.postMedias", "postMedias")
      .addSelect(["postMedias.url", "postMedias.mimeType", "postMedias.id"]);
    if (user.userRole === UserRoleEnum.ADMIN) {
      query.where("post.adminUserId = :userId", { userId: user.userId });
    } else if (user.userRole === UserRoleEnum.CREATOR) {
      query.where("post.creatorUserId = :userId", { userId: user.userId });
    }

    query.orderBy("post.createdAt", "DESC");
    query.skip(skip).take(take);
    const posts = await query.getMany();

    const data = posts.map(post => ({
      ...post,
      postMedias: post.postMedias.map(media => ({
        ...media,
        url: this.awsService.getCloudFrontSignedUrl(media.url),
      })),
    }));

    return data;
  }

  async findUserPersonalLikedPosts(
    user: JwtAuthGuardTrueType,
    skip: number,
    take: number,
  ) {
    const likedPosts = await this.entityManager
      .createQueryBuilder(Post, "post")
      .select(["post.id", "post.createdAt"])
      .leftJoin("post.postMedias", "postMedias")
      .addSelect(["postMedias.url", "postMedias.mimeType", "postMedias.id"])

      // get user liked posts
      .where(
        'post.id IN (SELECT "postId" FROM "postCommentLikes" WHERE "userId" = :userId AND "targetType" = :targetType)',
        { userId: user.userId, targetType: PostLikeTargetEnum.POST },
      )
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(take)
      .getMany();

    const data = likedPosts.map(post => ({
      ...post,
      postMedias: post.postMedias.map(media => ({
        ...media,
        url: this.awsService.getCloudFrontSignedUrl(media.url),
      })),
    }));

    return data;
  }

  async findUserPersonalSavedPosts(
    user: JwtAuthGuardTrueType,
    skip: number,
    take: number,
  ) {
    const savedPosts = await this.entityManager
      .createQueryBuilder(Post, "post")
      .select(["post.id", "post.createdAt"])
      .leftJoin("post.postMedias", "postMedias")
      .addSelect(["postMedias.url", "postMedias.mimeType", "postMedias.id"])

      // get user  saved posts
      .where(
        'post.id IN (SELECT "postId" FROM "userSavedPostsAssociation" WHERE "userId" = :userId)',
        { userId: user.userId },
      )
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(take)
      .getMany();

    const data = savedPosts.map(post => ({
      ...post,
      postMedias: post.postMedias.map(media => ({
        ...media,
        url: this.awsService.getCloudFrontSignedUrl(media.url),
      })),
    }));
    return data;
  }

  async findAllPosts(from: number, to: number) {
    const posts = await this.entityManager.find(Post, {
      skip: from,
      take: to,
      order: { createdAt: "DESC" },
    });
    return { data: posts };
  }

  async findAllPostLikes(
    user: JwtAuthGuardTrueType,
    postId: string,
    isLatest: boolean,
    skip: number,
    take: number,
  ) {
    const query = this.entityManager
      .createQueryBuilder(PostCommentLike, "likes")
      .select(["likes.id", "likes.likeType", "likes.createdAt"])
      .leftJoin("likes.user", "user")
      .addSelect([
        "user.id",
        "user.firstname",
        "user.lastname",
        "user.avatarUrl",
        "user.userRoles",
        "user.isSpecialUser",
        "user.isActive",
      ])
      .where("likes.postId = :postId", { postId })
      .andWhere("likes.targetType = :targetType", {
        targetType: PostLikeTargetEnum.POST,
      })
      .orderBy("likes.createdAt", isLatest ? "DESC" : "ASC")
      .skip(skip)
      .take(take);
    const likes = await query.getMany();
    const data = likes.map(like => ({
      ...like,
      user: {
        ...like.user,
        avatarUrl: like.user.avatarUrl
          ? this.awsService.getCloudFrontSignedUrl(like.user.avatarUrl)
          : like.user.avatarUrl,
      },
    }));

    return data;
  }
  async findAllCommentLikes(
    user: JwtAuthGuardTrueType,
    commentId: string,
    isLatest: boolean,
    skip: number,
    take: number,
  ) {
    const query = this.entityManager
      .createQueryBuilder(PostCommentLike, "likes")
      .select(["likes.id", "likes.likeType", "likes.createdAt"])
      .leftJoin("likes.user", "user")
      .addSelect([
        "user.id",
        "user.firstname",
        "user.lastname",
        "user.avatarUrl",
        "user.userRoles",
        "user.isSpecialUser",
        "user.isActive",
      ])
      .where("likes.commentId = :commentId", { commentId })
      .andWhere("likes.targetType = :targetType", {
        targetType: PostLikeTargetEnum.COMMENT,
      })
      .orderBy("likes.createdAt", isLatest ? "DESC" : "ASC")
      .skip(skip)
      .take(take);
    const likes = await query.getMany();

    const data = likes.map(like => ({
      ...like,
      user: {
        ...like.user,
        avatarUrl: like.user.avatarUrl
          ? this.awsService.getCloudFrontSignedUrl(like.user.avatarUrl)
          : like.user.avatarUrl,
      },
    }));

    return data;
  }

  async findOnePost(postId: string, userId: string) {
    const query = this.entityManager
      .createQueryBuilder(Post, "post")
      .select(["post.id", "post.textContent", "post.createdAt", ])
      .leftJoinAndSelect("post.postMedias", "postMedias")

      // if creator user
      .leftJoin("post.creatorUser", "cu")
      .leftJoin("cu.user", "creatorUser")
      .addSelect([
        "creatorUser.id",
        "creatorUser.firstname",
        "creatorUser.lastname",
        "creatorUser.avatarUrl",
      ])

      // if admin user
      .leftJoin("post.adminUser", "au")
      .leftJoin("au.user", "adminUser")
      .addSelect([
        "adminUser.id",
        "adminUser.firstname",
        "adminUser.lastname",
        "adminUser.avatarUrl",
      ])

      // total likes count
      .addSelect(subQuery => {
        return subQuery
          .select("COUNT(likes.id)", "totalLikes")
          .from(PostCommentLike, "likes")
          .where("likes.postId = post.id");
      }, "totalLikes")

      // total comments count
      .addSelect(subQuery => {
        return subQuery
          .select("COUNT(comments.id)", "totalComments")
          .from(PostComments, "comments")
          .where("comments.postId = post.id");
      }, "totalComments")

      // is fetch user like this post
      .addSelect(subQuery => {
        return subQuery
          .select("COUNT(userLike.id) > 0", "userLiked")
          .from(PostCommentLike, "userLike")
          .where("userLike.postId = post.id")
          .andWhere("userLike.userId = :userId", { userId })
          .andWhere("userLike.targetType = :targetType", {
            targetType: PostLikeTargetEnum.POST,
          });
      }, "userLiked")

      // fetch user like type
      .addSelect(subQuery => {
        return subQuery
          .select('userliketype."likeType"', "userLikedType")
          .from(PostCommentLike, "userliketype")
          .where('userliketype."postId" = post.id')
          .andWhere('userliketype."userId" = :userid', { userid: userId })
          .andWhere('userliketype."targetType" = :targett', {
            targett: PostLikeTargetEnum.POST,
          })
          .addGroupBy('userliketype."likeType"');
      }, "userLikedType")

      // is fetch user save this post
      .addSelect(subQuery => {
        return subQuery
          .select("COUNT(usersave) > 0", "userSaved")
          .from(UserSavedPostsAssociation, "usersave")
          .where('usersave."postId" = post.id')
          .andWhere('usersave."userId" = :userid', { userid: userId });
      }, "userSaved")
      .where("post.id = :postId", { postId })
      .groupBy("post.id")
      .addGroupBy("post.textContent")
      .addGroupBy("post.createdAt")
      .addGroupBy("postMedias.id")
      .addGroupBy("creatorUser.id")
      .addGroupBy("adminUser.id");

    const postData = await query.getRawMany();

    const mostPostLikeTypes = await this.entityManager
      .createQueryBuilder(PostCommentLike, "postLikes")
      .select("postLikes.likeType", "likeType")
      .addSelect("COUNT(postLikes.id)", "count")
      .where("postLikes.postId = :postId", { postId })
      .groupBy("postLikes.likeType")
      .getRawMany();

    const orderedData = prefixSplitNestingObject(postData, ["postMedias"]);
    let postBy: any;
    if (orderedData.creatorUser.id) {
      postBy = { ...orderedData.creatorUser };
    } else {
      postBy = { ...orderedData.adminUser };
    }
    const data = {
      postMedias: orderedData.postMedias.map(media => ({
        ...media,
        url: media.url
          ? this.awsService.getCloudFrontSignedUrl(media.url)
          : media.url,
      })),
      createdAt: orderedData.post.createdAt,
      postId: orderedData.post.id,
      textContent: orderedData.post.textContent,
      user: {
        ...postBy,
        avatarUrl:postBy?.avatarUrl ? this. awsService.getCloudFrontSignedUrl(postBy.avatarUrl):postBy?.avatarUrl,
        userRole: orderedData.post.postBy,
        isPostSaved: orderedData.userSaved,
        isPostLiked: orderedData.userLiked,
        postLikeType: orderedData.userLikedType,
      },
      interactions: {
        totalLikes: orderedData.totalLikes,
        totalComments: orderedData.totalComments,
        mostLikeTypes: mostPostLikeTypes,
      },
    };
    return data;
  }
  async getAllComments(
    user: JwtAuthGuardTrueType,
    postId: string,
    isLatest: boolean,
    skip: number,
    take: number,
  ) {
    const query = this.entityManager
      .createQueryBuilder(PostComments, "comments")
      .select(["comments.id", "comments.content", "comments.createdAt"])
      .leftJoin("comments.user", "user")
      .addSelect([
        "user.id",
        "user.firstname",
        "user.lastname",
        "user.avatarUrl",
        "user.isActive",
      ])
      .where("comments.postId = :postId", { postId });

    if (isLatest) {
      query.orderBy("comments.createdAt", "DESC");
    } else {
      query.orderBy("comments.createdAt", "ASC");
    }

    const comments = await query.skip(skip).take(take).getMany();
    if (comments.length === 0) return comments;

    // Fetch comment likes
    const commentIds = comments.map(comment => comment.id);
    const commentLikes = await this.entityManager
      .createQueryBuilder(PostCommentLike, "commentLikes")
      .select("commentLikes.commentId", "commentId")
      .addSelect("commentLikes.likeType", "likeType")
      .addSelect("COUNT(commentLikes.id)", "likesCount")
      .where("commentLikes.commentId IN (:...commentIds)", { commentIds })
      .groupBy("commentLikes.commentId")
      .addGroupBy("commentLikes.likeType")
      .getRawMany();
    console.log("commentLikes", commentLikes);
    // Fetch current user's likes
    const currentUserLikes = await this.entityManager
      .createQueryBuilder(PostCommentLike, "userLike")
      .select(["userLike.commentId", "userLike.likeType", "userLike.userId"])
      .where("userLike.targetType = :targetType", {
        targetType: PostLikeTargetEnum.COMMENT,
      })
      .andWhere("userLike.userId = :userId", { userId: user.userId })
      .getMany();

    // Merge data
    const data = comments.map(comment => {
      const likes = commentLikes.filter(like => like.commentId === comment.id);
      const totalLikesCount = likes.reduce(
        (acc, curr) => acc + Number(curr.likesCount),
        0,
      );
      const userLike = currentUserLikes.find(
        like => like.commentId === comment.id,
      );
      return {
        ...comment,
        commentLikes: likes,
        totalCommentLikesCount: totalLikesCount,
        currentUserLike: userLike,
      };
    });

    return data;
  }
  async updatePostContent(updatePost: UpdatePostContentDto) {
    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: { id: updatePost.postId },
        select: ["id", "textContent"],
      });
      if (!post) {
        return;
      }
      post.textContent = updatePost.content;
      await this.entityManager.save(post);
    });
    return { message: "post updated successfully!" };
  }

  async updatePostLike(
    user: JwtAuthGuardTrueType,
    updateLike: CreatePostLikeDto,
  ) {
    const like = await this.entityManager.findOne(PostCommentLike, {
      where: {
        postId: updateLike.postId,
        userId: user.userId,
        targetType: PostLikeTargetEnum.POST,
      },
    });
    if (!like) {
      return;
    }
    like.likeType = updateLike.likeType;
    await this.entityManager.save(like);
    return { message: "like updated successfully!" };
  }
  async updatePostCommentContent(updateComment: updatePostCommentContentDto) {
    await this.entityManager.transaction(async entityManager => {
      const comment = await entityManager.findOne(PostComments, {
        where: { id: updateComment.commentId },
        select: ["id", "content"],
      });

      comment.content = updateComment.content;
      await entityManager.save(comment);
    });
    return { message: "comment updated successfully!" };
  }
  async updatePostCommentLike(
    user: JwtAuthGuardTrueType,
    updateCommentLike: UpdatePostCommentLikeDto,
  ) {
    const commentLike = await this.entityManager.findOne(PostCommentLike, {
      where: {
        userId: user.userId,
        commentId: updateCommentLike.commentId,
        targetType: PostLikeTargetEnum.COMMENT,
      },
    });
    if (!commentLike) {
      return;
    }
    commentLike.likeType = updateCommentLike.likeType;
    await this.entityManager.save(commentLike);
    return { message: "comment like updated successfully!" };
  }

  async removePost(user: JwtAuthGuardTrueType, postId: string) {
    let post:Post;
    // first check if post belongs to user or not
    if (user.userRole === UserRoleEnum.CREATOR) {
      post = await this.entityManager.findOne(Post, {
        where: { id: postId, creatorUserId:user.userId },
        loadEagerRelations: false,
      });
    }else if(user.userRole === UserRoleEnum.ADMIN){
       post = await this.entityManager.findOne(Post,{where:{id:postId,adminUserId:null},loadEagerRelations:false})
    }
      if (!post) throw new NotFoundException("Post not found!");
    
      // check post have media
      const postMedias =await this.entityManager.find(PostMedia, {where:{postId:post.id},loadEagerRelations:false})
      if(postMedias){
        for(let i=0;i<postMedias.length;i++){
          // deleting from s3 
         const result = await this.awsService.deleteObjectFromS3(postMedias[i].url)
          // invalidate from cloudfront
          const result1 =await this.awsService.invalidateCloudfrontCache(postMedias[i].url)
          console.log({result,result1})
        }
      }


      await this.entityManager.delete(Post,{id:postId,}) 
    
    
    return { message: "Post deleted successfully!" };
  }

  async removePostMedia(id: string) {
    await this.entityManager.delete(PostMedia, { id });
    return { message: "Post deleted successfully!" };
  }

  async removePostComment(id: string) {
    await this.entityManager.delete(PostComments, { id });
    return { message: "Comment deleted successfully!" };
  }
  async removePostLike(user: JwtAuthGuardTrueType, postId: string) {
    await this.entityManager.delete(PostCommentLike, {
      postId,
      userId: user.userId,
      targetType: PostLikeTargetEnum.POST,
    });
    return { message: "Post like deleted successfully!" };
  }
  async removeUserSavePost(user: JwtAuthGuardTrueType, postId: string) {
    await this.entityManager.delete(UserSavedPostsAssociation, {
      userId: user.userId,
      postId,
    });
    return { message: "Post unsaved successfully!" };
  }
  async removePostCommentLike(user: JwtAuthGuardTrueType, commentId: string) {
    const commentLike = await this.entityManager.findOne(PostCommentLike, {
      where: {
        userId: user.userId,
        commentId,
        targetType: PostLikeTargetEnum.COMMENT,
      },
    });
    if (!commentLike) return; // TODO: Handle this
    await this.entityManager.delete(PostCommentLike, {
      userId: user.userId,
      commentId,
      targetType: PostLikeTargetEnum.COMMENT,
    });
    return { message: "comment like deleted successfully!" };
  }
}
