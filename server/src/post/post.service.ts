import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import {
  CreatePostCommentDto,
  createPostCommentLikeDto,
  CreatePostDto,
  createPostLikeDto,
  CreatePostMediaDto,
  CreatePresignedUrlDto,
  createUserSavedPostDto,
} from "./dto/create-post.dto";
import {
  updatePostCommentContentDto,
  UpdatePostContentDto,
} from "./dto/update-post.dto";
import { v4 as uuid } from "uuid";
import { Post } from "./entities/post.entity";
import { PostMedia } from "./entities/post-media.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { PostComments } from "./entities/post-comment.entity";
import { User } from "src/user/entities/user.entity";
import { JwtAuthGuardTrueType, UserRoleEnum } from "src/lib/types/user";
import {
  commentsResponseDataType,
  postCommentLikesResponseDataType,
  PostLikeTargetEnum,
  PostMediaEnum,
  PostUserTypeEnum,
} from "src/lib/types/post";
import { PostCommentLike } from "./entities/post-comment-like.entity";
import { ConfigService } from "@nestjs/config";

import { S3Client } from "@aws-sdk/client-s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UserSavedPostsAssociation } from "src/user/entities/user-saved-post.entity";
import { isFirebasePushId } from "class-validator";
import { prefixSplitNestingObject } from "src/lib/utils";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  async createPresignedUrl(
    user: JwtAuthGuardTrueType,
    createPresignedUrlDto: CreatePresignedUrlDto[],
  ) {
    const s3Client = await this.getS3Client();
    const presignedUrls = [];
    for (let i = 0; i < createPresignedUrlDto.length; i++) {
      const key = `post/${user.userId}/${new Date().getTime()}-${createPresignedUrlDto[i].fileName}`;
      const command = new PutObjectCommand({
        Bucket: this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
        Key: key,
        ContentType: createPresignedUrlDto[i].mimeType,
      });
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 1200, // 20 minutes
      });
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
        postBy:
          user.userRole === "creator"
            ? PostUserTypeEnum.CREATOR
            : PostUserTypeEnum.ADMIN,
        creatorUserId: user.userRole === "creator" ? user.userId : null,
        adminUserId: user.userRole === "admin" ? user.userId : null,
      });

      // the media.urlKey have key we have to make the url from aws presigned method then add into db
      const postMediaList: PostMedia[] = [];
      for (let i = 0; i < createPostDto.postMedias.length; i++) {
        const url = await this.generatePresignedUrl(
          createPostDto.postMedias[i].urlKey,
          await this.getS3Client(),
          Number.parseInt(this.configService.getOrThrow("AWS_S3_URL_EXPIRY")),
        );
        const postMedia = new PostMedia({
          id: uuid(),
          postId: postId,
          mimeType: createPostDto.postMedias[i].mimeType,
          url,
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
    const postMedia: PostMedia[] = [];
    await this.entityManager.transaction(async entityManager => {
      // first check if post is exist or not
      const post = await entityManager.findOne(Post, {
        where: { id: createMedia.postId },
        select: ["id"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      createMedia.postMedias.forEach(media => {
        if (
          media.mimeType !== PostMediaEnum.IMAGE &&
          media.mimeType !== PostMediaEnum.VIDEO
        ) {
          throw new UnsupportedMediaTypeException("Invalid media type!");
        }
        const postMedia_ = new PostMedia({
          ...media,
          id: uuid(),
          postId: createMedia.postId,
        });
        postMedia.push(postMedia_);
        this.entityManager.save(postMedia_);
      });
    });
    return { message: "media created successfully!", data: postMedia };
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
    createLike: createPostLikeDto,
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
    createSaved: createUserSavedPostDto,
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
    createPostLike: createPostCommentLikeDto,
  ) {
    // checking if comment like is available or not
    const likeExist = await this.entityManager.findOne(PostCommentLike, {
      where: { userId: user.userId, commentId: createPostLike.commentId },
      loadEagerRelations: false,
    });
    if (likeExist) {
      if (likeExist.likeType === createPostLike.likeType) {
        return { message: "Already liked!" };
      } else {
        likeExist.likeType = createPostLike.likeType;
        await this.entityManager.save(likeExist);
        return { message: "like updated successfully!" };
      }
    }
    const postCommentLike = new PostCommentLike({
      id: uuid(),
      commentId: createPostLike.commentId,
      likeType: createPostLike.likeType,
      userId: user.userId,
      targetType: PostLikeTargetEnum.COMMENT,
    });
    await this.entityManager.save(postCommentLike);
    return { message: "like created successfully!", data: postCommentLike };
  }
  async findUserPersonalPosts(
    user: JwtAuthGuardTrueType,
    from: number,
    to: number,
  ) {
    const query = await this.entityManager
      .createQueryBuilder(Post, "post")
      .select(["post.id", "post.textContent", "post.createdAt"])
      .leftJoin("post.postMedias", "postMedias")
      .addSelect(["postMedias.url", "postMedias.mimeType", "postMedias.id"]);

    if (user.userRole === UserRoleEnum.ADMIN) {
      query.where("post.adminUserId = :userId", { userId: user.userId });
    } else if (user.userRole === UserRoleEnum.CREATOR) {
      query.where("post.creatorUserId = :userId", { userId: user.userId });
    }

    query.orderBy("post.createdAt", "DESC");
    query.skip(from).take(to);
    const posts = await query.getMany();

    // checking if presigned url is expired or not
    for (let i = 0; i < posts.length; i++) {
      posts[i].postMedias = await this.getNewPostMediasUrlAfterExpiration(
        posts[i].postMedias,
      );
    }

    // getting total counts
    let total: number;
    if (user.userRole === UserRoleEnum.ADMIN) {
      total = await this.entityManager.count(Post, {
        where: { adminUserId: user.userId },
      });
    } else if (user.userRole === UserRoleEnum.CREATOR) {
      total = await this.entityManager.count(Post, {
        where: { creatorUserId: user.userId },
      });
    }

    return { data: posts, total };
  }

  async findUserPersonalLikedPosts(
    user: JwtAuthGuardTrueType,
    from: number,
    to: number,
  ) {
    const likedPosts = await this.entityManager
      .createQueryBuilder(Post, "post")
      .select(["post.id", "post.textContent", "post.createdAt"])
      .leftJoin("post.postMedias", "postMedias")
      .addSelect(["postMedias.url", "postMedias.mimeType", "postMedias.id"])

      // get user liked posts
      .where(
        'post.id IN (SELECT "postId" FROM "postCommentLikes" WHERE "userId" = :userId AND "targetType" = :targetType)',
        { userId: user.userId, targetType: PostLikeTargetEnum.POST },
      )
      .orderBy("post.createdAt", "DESC")
      .skip(from)
      .take(to)
      .getMany();

    // checking if presigned url is expired or not
    for (let i = 0; i < likedPosts.length; i++) {
      likedPosts[i].postMedias = await this.getNewPostMediasUrlAfterExpiration(
        likedPosts[i].postMedias,
      );
    }
    const total = await this.entityManager.count(PostCommentLike, {
      where: { userId: user.userId, targetType: PostLikeTargetEnum.POST },
    });

    return { data: likedPosts, total };
  }

  async findUserPersonalSavedPosts(
    user: JwtAuthGuardTrueType,
    from: number,
    to: number,
  ) {
    const savedPosts = await this.entityManager
      .createQueryBuilder(Post, "post")
      .select(["post.id", "post.textContent", "post.createdAt"])
      .leftJoin("post.postMedias", "postMedias")
      .addSelect(["postMedias.url", "postMedias.mimeType", "postMedias.id"])

      // get user  saved posts
      .where(
        'post.id IN (SELECT "postId" FROM "userSavedPostsAssociation" WHERE "userId" = :userId)',
        { userId: user.userId },
      )
      .orderBy("post.createdAt", "DESC")
      .skip(from)
      .take(to)
      .getMany();

    // checking if presigned url is expired or not
    for (let i = 0; i < savedPosts.length; i++) {
      savedPosts[i].postMedias = await this.getNewPostMediasUrlAfterExpiration(
        savedPosts[i].postMedias,
      );
    }
    const total = await this.entityManager.count(UserSavedPostsAssociation, {
      where: { userId: user.userId },
    });

    return { data: savedPosts, total };
  }

  async findAllPosts(from: number, to: number) {
    const posts = await this.entityManager.find(Post, {
      skip: from,
      take: to,
      order: { createdAt: "DESC" },
    });
    return { data: posts };
  }

  async findAllComments(postId: string, from: number, to: number) {
    const postComments: commentsResponseDataType[] = [];

    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: {
          id: postId,
        },
        select: ["id"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      const [comments]: [PostComments[], number] =
        await entityManager.findAndCount(PostComments, {
          where: { postId },
          skip: from,
          take: to,
        });
      // finding the relevant user belongs to the comment

      comments.forEach(async comment => {
        const user = await entityManager.findOne(User, {
          where: { id: comment.userId },
          select: [
            "id",
            "firstname",
            "lastname",
            "avatarUrl",
            "userRoles",
            "isSpecialUser",
            "isVerified",
          ],
        });
        postComments.push({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          avatarUrl: user.avatarUrl,
          userRoles: user.userRoles,
          isSpecialUser: user.isSpecialUser,
          isVerified: user.isVerified,
          commentId: comment.id,
          commentContent: comment.content,
          commentLikes: comment.commentLikes,
          createdAt: comment.createdAt,
        });
      });
    });
    return { data: postComments };
  }

  async findAllPostLikes(postId: string, from: number, to: number) {
    const postLikes: postCommentLikesResponseDataType[] = [];

    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: {
          id: postId,
        },
        select: ["id"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      const [likes]: [PostCommentLike[], number] =
        await entityManager.findAndCount(PostCommentLike, {
          where: { postId },
          skip: from,
          take: to,
        });
      // finding the relevant user belongs to the comment

      likes.forEach(async like => {
        const user = await entityManager.findOne(User, {
          where: { id: like.userId },
          select: [
            "id",
            "firstname",
            "lastname",
            "avatarUrl",
            "userRoles",
            "isSpecialUser",
            "isVerified",
          ],
        });
        postLikes.push({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          avatarUrl: user.avatarUrl,
          userRoles: user.userRoles,
          isSpecialUser: user.isSpecialUser,
          isVerified: user.isVerified,
          likeId: like.id,
          likeType: like.likeType,
          createdAt: like.createdAt,
        });
      });
    });
    return { data: postLikes };
  }
  async findAllCommentLikes(commentId: string, from: number, to: number) {
    const commentLikes: postCommentLikesResponseDataType[] = [];

    await this.entityManager.transaction(async entityManager => {
      const comment = await entityManager.findOne(PostComments, {
        where: {
          id: commentId,
        },
      });
      if (!comment) {
        throw new NotFoundException("Comment not found!");
      }
      const [likes]: [PostCommentLike[], number] =
        await entityManager.findAndCount(PostCommentLike, {
          where: { commentId },
          skip: from,
          take: to,
        });
      // finding the relevant user belongs to the comment
      likes.forEach(async like => {
        const user = await entityManager.findOne(User, {
          where: { id: like.userId },
          select: [
            "id",
            "firstname",
            "lastname",
            "avatarUrl",
            "userRoles",
            "isSpecialUser",
            "isVerified",
          ],
        });
        commentLikes.push({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          avatarUrl: user.avatarUrl,
          userRoles: user.userRoles,
          isSpecialUser: user.isSpecialUser,
          isVerified: user.isVerified,
          likeId: like.id,
          likeType: like.likeType,
          createdAt: like.createdAt,
        });
      });
    });
    return { data: commentLikes };
  }

  async findOnePost(postId: string, userId:string) {
    const query = await this.entityManager
      .createQueryBuilder(Post, "post")
      .select(["post.id", "post.textContent", "post.createdAt", "post.postBy"])
      .groupBy("post.id")
      .addGroupBy("post.textContent")
      .addGroupBy("post.createdAt")
      .addGroupBy("post.postBy")

      // getting post likes count
      .leftJoin("post.postLikes", "postLikesCount")
      .addSelect("COUNT(postLikesCount.id)", "likesCount")
      
      // getting latest like type
      .leftJoin("post.postLikes", "lastLike")
      .addSelect("lastLike.likeType",)
      .addGroupBy("lastLike.likeType")
      .addGroupBy("lastLike.createdAt")
      .addOrderBy("lastLike.createdAt", "DESC")
      .limit(1)
      
      // getting latest like user name
      .leftJoin("lastLike.user", "lastLikeUser")
      .addSelect(["lastLikeUser.firstname", "lastLikeUser.lastname"])
      .addGroupBy("lastLikeUser.id")
      .addGroupBy("lastLikeUser.firstname")
      .addGroupBy("lastLikeUser.lastname")
      .addOrderBy("lastLike.createdAt", "DESC")
      .limit(1)

      // getting post comments count
      .leftJoin("post.postComments", "postCommentsCount")
      .addSelect("COUNT(postCommentsCount.id)", "commentsCount")

      // getting latest comment content
      .leftJoin("post.postComments", "lastComment")
      .addSelect(["lastComment.content", "lastComment.createdAt"])
      .addGroupBy("lastComment.content")
      .addGroupBy("lastComment.createdAt")
      .addOrderBy("lastComment.createdAt", "DESC")
      .limit(1)

      // getting latest comment user name
      .leftJoin("lastComment.user", "lastCommentUser")
      .addSelect(["lastCommentUser.firstname", "lastCommentUser.lastname"])
      .addGroupBy("lastCommentUser.id")
      .addGroupBy("lastCommentUser.firstname")
      .addGroupBy("lastCommentUser.lastname")
      .addOrderBy("lastComment.createdAt", "DESC")
      .limit(1)

      // checking if fetch user like this post or not
      .leftJoin("post.postLikes", "userLike", 'userLike.userId = :userId',{userId})
      .addSelect("userLike.likeType", "isCurrentUserLiked")
      .addGroupBy("userLike.likeType")
      
      // checking if user saved this post or not
      .leftJoin("post.savedByUsers", "userSaved", 'userSaved.userId = :userId',{userId})
      .addSelect("userSaved.userId", "isCurrentUserSaved")
      .addGroupBy("userSaved.userId")

      // checking if user have comments on this post or not
      .leftJoin("post.postComments", "userComment", 'userComment.userId = :userId',{userId})
      .addSelect(['userComment.content', 'userComment.createdAt'])
      .addGroupBy("userComment.content")
      .addGroupBy("userComment.createdAt")

      // checking if user comment like counts this 
      .leftJoin("userComment.commentLikes", "commentLikesCount")
      .addSelect("COUNT(commentLikesCount.id)", "commentLikesCount")
      .addGroupBy("commentLikesCount.id")
      // type
      .addSelect("commentLikesCount.likeType")
      .addGroupBy("commentLikesCount.likeType")




      // getting creator user details
      .leftJoin("post.creatorUser", "cu")
      .leftJoin("cu.user", "creatorUser")
      .addSelect([
        "creatorUser.firstname",
        "creatorUser.lastname",
        "creatorUser.avatarUrl",
      ])
      .addGroupBy("creatorUser.id")
      .addGroupBy("creatorUser.firstname")
      .addGroupBy("creatorUser.lastname")
      .addGroupBy("creatorUser.avatarUrl")

      // getting admin user details
      .leftJoin("post.adminUser", "au")
      .leftJoin("au.user", "adminUser")
      .addSelect([
        "adminUser.firstname",
        "adminUser.lastname",
        "adminUser.avatarUrl",
      ])
      .addGroupBy("adminUser.id")
      .addGroupBy("adminUser.firstname")
      .addGroupBy("adminUser.lastname")
      .addGroupBy("adminUser.avatarUrl");

    const postData = await query
      .where("post.id = :postId", { postId })
      .getRawOne();
    console.log(postData);
    const tempObject = prefixSplitNestingObject(postData);
    if (tempObject.creatorUser.firstname && tempObject.creatorUser.firstname) {
      delete tempObject.adminUser;
      tempObject["user"] = tempObject.creatorUser;
      delete tempObject.creatorUser;
    } else {
      delete tempObject.creatorUser;
      tempObject["user"] = tempObject.adminUser;
      delete tempObject.adminUser;
    }
    const postMedias = await this.entityManager.find(PostMedia, {
      where: { postId },
      loadEagerRelations: false,
      select: ["id", "mimeType", "url"],
    });
    const post = { ...tempObject, postMedias };

    return post;
  }
  async updatePostContent(updatePost: UpdatePostContentDto) {
    await this.entityManager.transaction(async entityManager => {
      const post = await entityManager.findOne(Post, {
        where: { id: updatePost.postId },
        select: ["id", "textContent"],
      });
      if (!post) {
        throw new NotFoundException("Post not found!");
      }
      post.textContent = updatePost.content;
      await this.entityManager.save(post);
    });
    return { message: "post updated successfully!" };
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

  async removePost(id: string) {
    await this.entityManager.delete(Post, { id });
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
  async removePostOrCommentLike(id: string) {
    await this.entityManager.delete(PostCommentLike, { id });
    return { message: "Like deleted successfully!" };
  }

  async getS3Client() {
    const s3Client = new S3Client({
      region: this.configService.get("AWS_S3_REGION"),
      credentials: {
        accessKeyId: this.configService.get("AWS_S3_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_S3_SECRET_ACCESS_KEY"),
      },
    });
    return s3Client;
  }
  async generatePresignedUrl(
    key: string,
    s3Client: S3Client,
    expiresIn: number = 1200,
  ) {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow("AWS_S3_BUCKET_NAME"),
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  getKeyFromPresignedUrl(url: string) {
    const keyPrefix =
      "https://" +
      this.configService.getOrThrow("AWS_S3_BUCKET_NAME") +
      ".s3." +
      this.configService.getOrThrow("AWS_S3_REGION") +
      ".amazonaws.com/";
    const key = url.split(keyPrefix)[1].split("?")[0];
    return key;
  }
  checkPresignedUrlExpirationTime(url: string) {
    // first get the timestamp from the url
    const key = this.getKeyFromPresignedUrl(url);
    const timestamps = parseInt(key.split("/")[2].split("-")[0]);
    const diffMinutes = Math.floor((Date.now() - timestamps) / (1000 * 60));
    if (diffMinutes >= 60) {
      return true;
    }
    return false;
  }
  async getNewPostMediasUrlAfterExpiration(postMedias: PostMedia[]) {
    for (let i = 0; i < postMedias.length; i++) {
      // check if url is expires or not
      if (this.checkPresignedUrlExpirationTime(postMedias[i].url)) {
        // if expired then generate new url
        const url = await this.generatePresignedUrl(
          this.getKeyFromPresignedUrl(postMedias[i].url),
          await this.getS3Client(),
          Number.parseInt(this.configService.getOrThrow("AWS_S3_URL_EXPIRY")),
        );
        postMedias[i].url = url;
      }
    }
    return postMedias;
  }
}
